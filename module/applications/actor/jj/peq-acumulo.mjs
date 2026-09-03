/**
 * jj/peq-acumulo.mjs
 * Wuxia Legacy — Acúmulo automático de PEQ (Pontos de Essência de Qi).
 *
 * Quando o tempo do mundo avança (narrador avança dias, tempo automático,
 * descanso, rodadas), o sistema conta quantas meias-noites cruzaram
 * (options.dnd5e.deltas.midnights, calculado pelo CalendarData5e) e soma
 * automaticamente na Essência de Qi de cada personagem:
 *
 *   ganho_total = dias_passados × min(limite_da_zona, absorção_do_manual)
 *
 * A Essência nunca ultrapassa o custo do próximo avanço (o essGoal da aba
 * Cultivo) — o excedente é descartado.
 *
 * Fonte única dos cálculos de zona: qi-zone.mjs (importado aqui e pelo sheet).
 */

import { getZoneLimit } from "./qi-zone.mjs";

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

/**
 * Aplica o acúmulo de PEQ a todos os personagens.
 * @param {number} days  Nº de dias (meias-noites cruzadas). Pode ser negativo
 *   (tempo reverso) — nesse caso não aplicamos nada.
 */
async function applyPeqAccumulation(days) {
  if ( !Number.isFinite(days) || days <= 0 ) return;
  const gm = game.users.activeGM;
  if ( !gm || gm !== game.user ) return;   // só o GM ativo aplica

  for ( const actor of game.actors ) {
    if ( actor.type !== "character" ) continue;

    const gainPerDay = dailyGain(actor);
    if ( !Number.isFinite(gainPerDay) || gainPerDay <= 0 ) continue;

    const totalGain = gainPerDay * days;
    if ( totalGain <= 0 ) continue;

    // Cap: Essência nunca passa do custo do próximo avanço (essGoal).
    // Replica a lógica da aba Cultivo: no 3º estágio é o custo do próximo
    // rank (rompimento); antes, o custo do rank atual.
    const c = actor.system.cultivation ?? {};
    const rank = Math.clamp(c.rank ?? 1, 1, 10);
    const stage = Math.clamp(c.stage ?? 1, 1, 3);
    const atStageMax = stage >= 3;
    const atRankMax = rank >= 10;
    // Import tardio pra evitar ciclo (cultivation-data não importa este arquivo).
    const { essenciaMax } = await import("../../../systems/cultivation-data.mjs");
    const essGoal = (atStageMax && !atRankMax) ? essenciaMax(rank + 1) : essenciaMax(rank);

    const current = Math.max(0, c.essence ?? 0);
    const newEssence = Math.min(current + totalGain, essGoal);
    const applied = newEssence - current;
    if ( applied <= 0 ) continue;

    await actor.update({ "system.cultivation.essence": newEssence });

    // Chat discreto (apenas quando ganho relevante).
    if ( days >= 1 ) {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `☯ <strong>${actor.name}</strong> cultivou por <strong>${days} dia(s)</strong> e absorveu <strong>${applied}</strong> de Essência de Qi <em>(${gainPerDay === Infinity ? "sem limite" : gainPerDay + "/dia"} · ${newEssence}/${essGoal})</em>.`,
        rollMode: "selfroll"   // discreto: só o dono vê (evita spam em avanços longos)
      });
    }
  }
}

// ── Hook: tempo do mundo mudou ─────────────────────────────────────────────
Hooks.on("updateWorldTime", async (worldTime, delta, options) => {
  const midnights = options?.dnd5e?.deltas?.midnights;
  if ( !midnights ) return;   // sem virada de dia ou tempo reverso
  await applyPeqAccumulation(midnights);
});
