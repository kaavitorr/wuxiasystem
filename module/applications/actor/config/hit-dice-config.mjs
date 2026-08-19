import BaseConfigSheet from "../api/base-config-sheet.mjs";

/**
 * Configuration application for adjusting hit dice amounts and rolling.
 */
export default class HitDiceConfig extends BaseConfigSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["hit-dice"],
    actions: {
      decrease: HitDiceConfig.#stepValue,
      increase: HitDiceConfig.#stepValue,
      roll: HitDiceConfig.#rollDie
    },
    position: {
      width: 420
    }
  };

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    config: {
      template: "systems/wuxia-system/templates/actors/config/hit-dice-config.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** @override */
  get title() {
    return game.i18n.localize("DND5E.HitDice");
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);

    // Wuxia Legacy: sem classes tradicionais, os dados de vida vêm do nível de
    // cultivo. Monta uma entrada "virtual" para o config funcionar igual.
    const hdClasses = this.document.system.attributes?.hd?.classes;
    if ( hdClasses && hdClasses.size > 0 ) {
      // Personagem com classes — comportamento padrão do dnd5e.
      context.classes = Array.from(hdClasses).map(cls => ({
        data: { ...cls.system.hd },
        denomination: Number(cls.system.hd.denomination.slice(1)),
        id: cls.id,
        label: `${cls.name} (${cls.system.hd.denomination})`
      })).sort((lhs, rhs) => rhs.denomination - lhs.denomination);
    } else {
      // Sem classes — usa dados de vida baseados em cultivo (d8).
      const hd = this.document.system.attributes?.hd;
      context.classes = [{
        data: { value: hd?.value ?? 0, max: hd?.max ?? 0, denomination: "d8" },
        denomination: 8,
        id: "cultivo",   // id fictício (não corresponde a um Item)
        label: "Cultivo (d8)"
      }];
    }
    return context;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle rolling a specific hit die.
   * @this {HitDiceConfig}
   * @param {PointerEvent} event  The triggering click event.
   * @param {HTMLElement} target  The button that was clicked.
   */
  static async #rollDie(event, target) {
    const hdClasses = this.document.system.attributes?.hd?.classes;
    if ( hdClasses && hdClasses.size > 0 ) {
      // Personagem com classes — rola via sistema nativo.
      await this.document.rollHitDie({ denomination: target.dataset.denomination });
    } else {
      // Sem classes — rola d8 manualmente e consome via flag hdGastos.
      const roll = await new Roll("1d8 + @abilities.con.mod", this.document.getRollData()).evaluate();
      if ( game.dice3d ) await game.dice3d.showForRoll(roll, game.user, true);
      const hp = this.document.system.attributes.hp;
      const heal = Math.max(0, roll.total);
      const novoHp = Math.min((hp.value ?? 0) + heal, hp.effectiveMax ?? hp.max ?? heal);
      await this.document.update({ "system.attributes.hp.value": novoHp });
      const hdGastos = (this.document.getFlag("wuxia-system", "hdGastos") ?? 0) + 1;
      await this.document.setFlag("wuxia-system", "hdGastos", hdGastos);
      ChatMessage.create({
        speaker: { actor: this.document.id },
        content: `🎲 <strong>${this.document.name}</strong> rolou um dado de vida: ${roll.total} (cura ${heal} PV).`
      });
    }
    this.render();
  }

  /* -------------------------------------------- */

  /**
   * Handle stepping a hit die count up or down.
   * @this {HitDiceConfig}
   * @param {PointerEvent} event  The triggering click event.
   * @param {HTMLElement} target  The button that was clicked.
   */
  static #stepValue(event, target) {
    const valueField = target.closest(".form-group").querySelector("input");
    if ( target.dataset.action === "increase" ) valueField?.stepUp();
    else valueField?.stepDown();
    this.submit();
  }

  /* -------------------------------------------- */
  /*  Form Submission                             */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _processFormData(event, form, formData) {
    if ( form.reportValidity() ) {
      const submitData = super._processFormData(event, form, formData);
      // Caso especial: sem classes, o id é "cultivo" — controla via flag.
      if ( "cultivo" in submitData ) {
        const newValue = Number(submitData.cultivo) || 0;
        const maxHd = this.document.system.attributes?.hd?.max ?? 0;
        const spent = Math.max(0, maxHd - newValue);
        this.document.setFlag("wuxia-system", "hdGastos", spent);
        return {};
      }
      // Personagem com classes — atualiza o hd.spent nos itens de classe.
      const classUpdates = Object.entries(submitData).map(([_id, value]) => {
        const item = this.document.items.get(_id);
        if ( !item ) return null;
        return { _id, "system.hd.spent": item.system.levels - value };
      }).filter(Boolean);
      if ( classUpdates.length ) this.document.updateEmbeddedDocuments("Item", classUpdates);
    }
    return {};
  }
}
