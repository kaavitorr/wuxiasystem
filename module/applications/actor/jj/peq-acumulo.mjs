/**
 * jj/peq-acumulo.mjs
 * Wuxia Legacy — Acúmulo de PEQ (Pontos de Essência de Qi) por passagem de dias.
 *
 * Quando o tempo do mundo avança (narrador avança dias/semanas/anos, tempo
 * automático, descanso), o sistema conta quantas meias-noites cruzaram
 * (options.dnd5e.deltas.midnights, calculado pelo CalendarData5e) e abre um
 * MODAL para o Narrador escolher quais fichas de jogador cultivaram no período
 * (uma checkbox por ficha + atalho "Todos" — interface em peq-dialog.mjs).
 *
 *   ganho_total = dias_passados × min(limite_da_zona, absorção_do_manual)
 *
 * A Essência nunca ultrapassa o custo do próximo avanço (o essGoal da aba
 * Cultivo) — o excedente é descartado.
 *
 * Fonte única dos cálculos de zona: qi-zone.mjs (importado aqui e pelo sheet).
 */

import { getZoneLimit, QI_ZONES } from "./qi-zone.mjs";
import PeqAcumuloDialog from "./peq-dialog.mjs";

/**
 * Calcula o ganho diário de PEQ de um ator.
 * @param {Actor} actor
 * @returns {number} PEQ por dia (Infinity = sem limite).
 */
function dailyGain(actor) {
  const zoneLimit = getZoneLimit();
  const manualAbsorb = actor.getFlag("wuxia-system", "manualEssencePerDay") ?? Infinity;
  return Math.min(zoneLimit, manualAbsorb);
}

/** Meta de Essência do próximo avanço — mesma régua da aba Cultivo. */
async function getEssGoal(actor) {
  const c = actor.system.cultivation ?? {};
  const rank = Math.clamp(c.rank ?? 1, 1, 10);
  const stage = Math.clamp(c.stage ?? 1, 1, 3);
  // Import tardio pra evitar ciclo (cultivation-data não importa este arquivo).
  const { essenciaMax } = await import("../../../systems/cultivation-data.mjs");
  // No 3º estágio a meta é o custo do próximo rank (rompimento); antes, o
  // custo do rank atual. No topo (rank 10) vale o máximo do próprio rank.
  return (stage >= 3 && rank < 10) ? essenciaMax(rank + 1) : essenciaMax(rank);
}

/**
 * Pré-calcula o ganho de cada ficha de JOGADOR (hasPlayerOwner) para `days`
 * dias de cultivo — alimenta o modal (preview) e a aplicação.
 * @param {number} days
 * @returns {Promise<object[]>} Entradas {id, name, img, projected, ...}.
 */
async function buildEntries(days) {
  const entries = [];
  for ( const actor of game.actors ) {
    if ( actor.type !== "character" || !actor.hasPlayerOwner ) continue;

    const gainPerDay = dailyGain(actor);
    const essGoal = await getEssGoal(actor);
    const current = Math.max(0, actor.system.cultivation?.essence ?? 0);
    const totalGain = gainPerDay * days;   // pode ser Infinity (zona/manual ilimitado)
    const newEssence = Math.min(current + totalGain, essGoal);
    const projected = Math.round(newEssence - current);

    entries.push({
      id: actor.id,
      name: actor.name,
      img: actor.img,
      gainPerDayLabel: Number.isFinite(gainPerDay) ? gainPerDay : "∞",
      current, essGoal, newEssence, projected,
      canGain: projected > 0,
      reason: projected > 0 ? "" : "Já está no auge"
    });
  }
  return entries;
}

/** Cabeçalho do modal: zona de Qi vigente + modificadores aplicados. */
function zoneInfo() {
  const zone = game.settings.get("wuxia-system", "qiZone") ?? {};
  const z = QI_ZONES.find(qz => qz.id === (zone.level ?? "mediano")) ?? QI_ZONES[3];
  const limit = getZoneLimit();
  const mods = [];
  if ( zone.veiaEspiritual ) mods.push("Veia Espiritual ×10");
  if ( zone.seita ) mods.push("Seita ×2");
  return {
    label: z.label,
    limitLabel: Number.isFinite(limit) ? `${limit}` : "sem limite",
    mods: mods.join(" · ")
  };
}

/**
 * Aplica o acúmulo às fichas selecionadas. Recalcula na hora — a Essência ou a
 * zona podem ter mudado enquanto o modal estava aberto.
 * @param {string[]} ids  IDs dos atores selecionados no modal.
 * @param {number} days   Dias de cultivo.
 */
async function applyPeqToActors(ids, days) {
  if ( !Array.isArray(ids) || ids.length === 0 ) return;

  const entries = await buildEntries(days);
  const byId = new Map(entries.map(e => [e.id, e]));

  for ( const id of ids ) {
    const entry = byId.get(id);
    if ( !entry || !entry.canGain ) continue;
    const actor = game.actors.get(id);
    if ( !actor ) continue;

    await actor.update({ "system.cultivation.essence": entry.newEssence });

    // Chat discreto: só o dono da ficha vê (evita spam em avanços longos).
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `☯ <strong>${actor.name}</strong> cultivou por <strong>${days} dia(s)</strong> e absorveu <strong>${entry.projected}</strong> de Essência de Qi <em>(${entry.gainPerDayLabel === "∞" ? "sem limite" : entry.gainPerDayLabel + "/dia"} · ${entry.newEssence}/${entry.essGoal})</em>.`,
      rollMode: "selfroll"
    });
  }
}

// ── Hook: tempo do mundo mudou ──────────────────────────────────────────────
let activeDialog = null;

Hooks.on("updateWorldTime", async (worldTime, delta, options) => {
  const midnights = options?.dnd5e?.deltas?.midnights;
  if ( !midnights || midnights <= 0 ) return;   // sem virada de dia ou tempo reverso
  const gm = game.users.activeGM;
  if ( !gm || gm !== game.user ) return;        // só o GM ativo pergunta

  // Modal já aberto? Mescla os novos dias nele em vez de empilhar modais.
  if ( activeDialog ) {
    activeDialog.addDays(midnights);
    return;
  }

  const dialog = new PeqAcumuloDialog({
    days: midnights,
    entries: await buildEntries(midnights),
    zoneInfo: zoneInfo(),
    rebuild: d => buildEntries(d),
    onApply: (ids, d) => applyPeqToActors(ids, d)
  });
  activeDialog = dialog;
  dialog.addEventListener("close", () => {
    if ( activeDialog === dialog ) activeDialog = null;
  });
  dialog.render(true);
});
