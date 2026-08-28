/**
 * jj/corpo-atributo.mjs
 * Cultivo do Corpo/Alma — a cada nível, o personagem ganha +1 em um atributo
 * (escolha do jogador). Corpo: FOR/AGI/CON. Alma: ESP/SAB/PRE.
 */

const BODY_ATTRS = {
  str: { label: "Força", icon: "fas fa-fist-raised" },
  dex: { label: "Agilidade", icon: "fas fa-wind" },
  con: { label: "Constituição", icon: "fas fa-heart" }
};

const SOUL_ATTRS = {
  int: { label: "Espírito", icon: "fas fa-brain" },
  wis: { label: "Sabedoria", icon: "fas fa-eye" },
  cha: { label: "Presença", icon: "fas fa-crown" }
};

/**
 * Abre o modal de escolha de atributo.
 * @param {Actor} actor
 * @param {number} level  O nível que acabou de ser atingido.
 * @param {"body"|"soul"} path  Qual caminho ("body" = Corpo, "soul" = Alma).
 * @returns {Promise<boolean>} true se um atributo foi escolhido e aplicado.
 */
export async function chooseBodyAttribute(actor, level, path = "body") {
  const attrPool = path === "soul" ? SOUL_ATTRS : BODY_ATTRS;
  const pathLabel = path === "soul" ? "Caminho da Alma" : "Caminho do Corpo";
  const actorAbilities = actor.system.abilities ?? {};

  const buttons = Object.entries(attrPool).map(([key, data]) => ({
    label: data.label,
    action: key,
    icon: data.icon,
    callback: () => key
  }));
  buttons.push({ label: "Depois", action: "later", callback: () => null });

  const escolha = await foundry.applications.api.DialogV2.wait({
    window: { title: `✦ ${pathLabel} — Nível ${level}` },
    content: `
      <div style="padding:8px 0;font-size:13px;color:#ccc;line-height:1.6;">
        <p style="margin:0 0 6px;">
          Você atingiu o <strong>nível ${level}</strong> do ${pathLabel}!
        </p>
        <p style="margin:0;font-size:12px;color:#8aa898;">
          Clique em um atributo para receber <strong>+1</strong>:
        </p>
      </div>`,
    buttons,
    rejectClose: false,
    close: () => null
  });

  if ( !escolha ) return false;

  // Aplica o +1 no atributo escolhido (relê o valor atual — pode ter mudado
  // durante o diálogo aberto).
  const currentValue = actor.system.abilities?.[escolha]?.value ?? 10;
  await actor.update({ [`system.abilities.${escolha}.value`]: currentValue + 1 });

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `${path === "soul" ? "✦" : "💪"} <strong>${actor.name}</strong> aprimorou <strong>${attrPool[escolha].label}</strong> (+1 → ${currentValue + 1}) pelo <strong>${pathLabel} Nv.${level}</strong>.`
  });
  return true;
}
