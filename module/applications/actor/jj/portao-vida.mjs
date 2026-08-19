/**
 * jj/portao-vida.mjs
 * Portão da Vida (Cultivo do Corpo nv.9): sempre que o personagem estiver com
 * menos da metade dos PV, recupera 2 × nível de cultivo (soma dos ranks) em PV
 * no início de cada um de seus turnos.
 */

Hooks.on("combatTurnChange", async (combat, prior, current) => {
  const combatant = combat.combatants.get(current?.combatantId);
  const actor = combatant?.actor;
  if ( !actor || !game.user.isGM ) return;

  const bodyLvl = actor.system.cultivation?.bodyCultivation ?? 0;
  if ( bodyLvl < 9 ) return;   // requer Portão da Vida (nv.9)

  const hp = actor.system.attributes?.hp;
  if ( !hp ) return;
  // Só ativa se estiver com menos da metade dos PV e vivo.
  if ( (hp.value ?? 0) >= Math.floor((hp.max ?? 1) / 2) ) return;
  if ( (hp.value ?? 0) <= 0 ) return;   // incapacitado não regenera

  // Cura = 2 × nível de cultivo acumulado ((rank−1)×3 + estágio).
  const rank = actor.system.cultivation?.rank ?? 1;
  const stage = actor.system.cultivation?.stage ?? 1;
  const nivel = ((rank - 1) * 3) + stage;
  const cura = nivel * 2;

  const novoHp = Math.min((hp.value ?? 0) + cura, hp.max ?? (hp.value + cura));
  await actor.update({ "system.attributes.hp.value": novoHp });

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `🩸 <strong>${actor.name}</strong> regenerou <strong>${cura} PV</strong> pelo <strong>Portão da Vida</strong> (${hp.value + cura > hp.max ? hp.max : hp.value + cura}/${hp.max}).`
  });
});
