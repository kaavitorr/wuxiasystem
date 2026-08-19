import BaseConfigSheet from "../api/base-config-sheet.mjs";

/**
 * Wuxia Legacy — Configuração unificada de Resistência E Vulnerabilidade.
 * Mostra os dois lado a lado em uma única janela com duas colunas.
 * Salva em system.traits.resistance e system.traits.weakness.
 */
export default class PF2eTraitConfig extends BaseConfigSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["pf2e-trait-config"],
    position: { width: 640 }
  };

  /** @override */
  static PARTS = {
    config: {
      template: "systems/wuxia-system/templates/actors/config/pf2e-trait-config.hbs"
    }
  };

  /** @override */
  get title() {
    return "Resistências & Vulnerabilidades";
  }

  /* -------------------------------------------- */

  /** Monta a lista de choices para uma key (resistance ou weakness). */
  _buildChoices(key) {
    const stored = this.document.system._source.traits?.[key] ?? {};
    const choices = [];
    choices.push({
      key: "ALL",
      label: game.i18n.localize("DND5E.DAMAGE.All"),
      value: stored.ALL ?? ""
    });
    for ( const [type, cfg] of Object.entries(CONFIG.DND5E.damageTypes) ) {
      choices.push({
        key: type,
        label: game.i18n.localize(cfg.label),
        icon: cfg.icon,
        value: stored[type] ?? ""
      });
    }
    return choices;
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    context.resistanceChoices = this._buildChoices("resistance");
    context.weaknessChoices = this._buildChoices("weakness");
    context.resHint = game.i18n.localize("WUXIA.Resistance.Hint");
    context.weakHint = game.i18n.localize("WUXIA.Weakness.Hint");
    return context;
  }

  /* -------------------------------------------- */

  /** Limpa um mapa de valores (remove 0/vazio, ALL vence). */
  _cleanMap(map, key) {
    const cleaned = {};
    let hasAll = false;
    for ( const [type, raw] of Object.entries(map) ) {
      const val = Number(raw);
      if ( Number.isFinite(val) && val > 0 ) {
        if ( type === "ALL" ) { cleaned.ALL = val; hasAll = true; }
        else cleaned[type] = val;
      }
    }
    if ( hasAll ) for ( const t of Object.keys(cleaned) ) if ( t !== "ALL" ) delete cleaned[t];
    // Remove chaves que sumiram via -=type=null.
    const finalMap = { ...cleaned };
    for ( const oldType of Object.keys(this.document.system._source.traits?.[key] ?? {}) ) {
      if ( !(oldType in cleaned) ) finalMap[`-=${oldType}`] = null;
    }
    return finalMap;
  }

  /** @inheritDoc */
  _processFormData(event, form, formData) {
    const submitData = super._processFormData(event, form, formData);
    submitData.system ??= {};
    submitData.system.traits ??= {};

    const resMap = submitData.system.traits?.resistance ?? {};
    const weakMap = submitData.system.traits?.weakness ?? {};
    submitData.system.traits.resistance = this._cleanMap(resMap, "resistance");
    submitData.system.traits.weakness = this._cleanMap(weakMap, "weakness");
    return submitData;
  }
}
