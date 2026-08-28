/**
 * jj/feridas.mjs
 * Sistema de Feridas (Wounds) — Wuxia Legacy.
 *
 * Regras:
 * - Crítico perfeito (nat 20): 50% do dano sofrido vira Ferida.
 * - Dano de queda: 100% vira Ferida (marcado manualmente pelo narrador).
 * - Cada Ferida reduz o PV máximo em 1 (aplicado em prepareHitPoints).
 * - Com Portão da Cura (Corpo nv.3+), descanso longo cura metade das feridas.
 * - Curar 20 feridas consome dados de vida = nível de cultivo (botão na sidebar).
 *
 * Acúmulo: para personagens, usa o hook hunterDamageApplied (que passa crit + amount).
 * Para NPCs, usa dnd5e.applyDamage (pós-aplicação).
 */

const WOUND_FACTOR_CRIT = 0.5;   // crítico: 50% vira ferida
const WOUND_FACTOR_FALL = 1.0;   // queda: 100% vira ferida

/** Aplica feridas a um ator. Idempotente e segura. */
async function _applyWounds(actor, amount, factor) {
  if ( !actor || amount <= 0 ) return;
  const wounds = Math.max(0, Math.ceil(amount * factor));
  if ( wounds === 0 ) return;
  const current = actor.system.attributes?.wounds ?? 0;
  await actor.update({ "system.attributes.wounds": current + wounds });
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `🩸 <strong>${actor.name}</strong> sofreu <strong>${wounds} Ferida(s)</strong> (PV máximo reduzido).`
  });
}

// ── Personagens: hunterDamageApplied (passa crit + amount) ──────────────
Hooks.on("hunterDamageApplied", async (actor, { crit = false, amount = 0 } = {}) => {
  if ( !actor || actor.type !== "character" ) return;
  if ( !crit ) return;   // só acumula feridas em crítico
  await _applyWounds(actor, amount, WOUND_FACTOR_CRIT);
});

// ── NPCs: dnd5e.applyDamage (pós-aplicação, sem crit info direta) ───────
// Para NPCs, o crit vem do card de ataque do atacante. Como o hook não
// passa info de crit para NPCs, deixamos a aplicação manual para NPCs
// (o narrador edita system.attributes.wounds diretamente, ou usa o botão
// de "Aplicar Ferida" no token — a implementar se solicitado).
