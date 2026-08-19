import HitDice from "../../documents/actor/hit-dice.mjs";
import Proficiency from "../../documents/actor/proficiency.mjs";
import { CONCEITOS_ELEMENTOS } from "../../systems/conceitos-data.mjs";
import { defaultUnits, simplifyBonus } from "../../utils.mjs";
import FormulaField from "../fields/formula-field.mjs";
import LocalDocumentField from "../fields/local-document-field.mjs";
import CreatureTypeField from "../shared/creature-type-field.mjs";
import RollConfigField from "../shared/roll-config-field.mjs";
import SensesField from "../shared/senses-field.mjs";
import SimpleTraitField from "./fields/simple-trait-field.mjs";
import AttributesFields from "./templates/attributes.mjs";
import CreatureTemplate from "./templates/creature.mjs";
import DetailsFields from "./templates/details.mjs";
import TraitsFields from "./templates/traits.mjs";

const {
  ArrayField, BooleanField, HTMLField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;
import MappingField from "../fields/mapping-field.mjs";

/**
 * @import { ActorFavorites5e, CharacterActorSystemData, ResourceData } from "./_types.mjs";
 */

/**
 * System data definition for Characters.
 * @extends {CreatureTemplate<CharacterActorSystemData>}
 * @mixes CharacterActorSystemData
 */
export default class CharacterData extends CreatureTemplate {

  /* -------------------------------------------- */
  /*  Model Configuration                         */
  /* -------------------------------------------- */

  /** @override */
  static LOCALIZATION_PREFIXES = ["DND5E.BONUSES"];

  /* -------------------------------------------- */

  /** @inheritDoc */
  static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
    supportsAdvancement: true
  }, { inplace: false }));

  /* -------------------------------------------- */

  /** @inheritDoc */
  static _systemType = "character";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      attributes: new SchemaField({
        ...AttributesFields.common,
        ...AttributesFields.creature,
        hp: new SchemaField({
          ...AttributesFields.hitPoints,
          max: new NumberField({
            nullable: true, integer: true, min: 0, initial: null, label: "DND5E.HitPointsOverride",
            hint: "DND5E.HitPointsOverrideHint"
          }),
          bonuses: new SchemaField({
            level: new FormulaField({ deterministic: true, label: "DND5E.HitPointsBonusLevel" }),
            overall: new FormulaField({ deterministic: true, label: "DND5E.HitPointsBonusOverall" })
          })
        }, { label: "DND5E.HitPoints" }),
        death: new RollConfigField({
          ability: false,
          success: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "DND5E.DeathSaveSuccesses"
          }),
          failure: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "DND5E.DeathSaveFailures"
          }),
          bonuses: new SchemaField({
            save: new FormulaField({ required: true, label: "DND5E.DeathSaveBonus" })
          })
        }, { label: "DND5E.DeathSave" }),
        inspiration: new BooleanField({ required: true, label: "DND5E.Inspiration" })
      }, { label: "DND5E.Attributes" }),
      bastion: new SchemaField({
        name: new StringField({ required: true }),
        description: new HTMLField()
      }),
      details: new SchemaField({
        ...DetailsFields.common,
        ...DetailsFields.creature,
        background: new LocalDocumentField(foundry.documents.BaseItem, {
          required: true, fallback: true, label: "DND5E.Background"
        }),
        originalClass: new StringField({ required: true, label: "DND5E.ClassOriginal" }),
        xp: new SchemaField({
          value: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "DND5E.ExperiencePoints.Current"
          })
        }, { label: "DND5E.ExperiencePoints.Label" }),
        appearance: new StringField({ required: true, label: "DND5E.Appearance" }),
        trait: new StringField({ required: true, label: "DND5E.PersonalityTraits" }),
        gender: new StringField({ label: "DND5E.Gender" }),
        eyes: new StringField({ label: "DND5E.Eyes" }),
        height: new StringField({ label: "DND5E.Height" }),
        faith: new StringField({ label: "DND5E.Faith" }),
        hair: new StringField({ label: "DND5E.Hair" }),
        skin: new StringField({ label: "DND5E.Skin" }),
        age: new StringField({ label: "DND5E.Age" }),
        weight: new StringField({ label: "DND5E.Weight" })
      }, { label: "DND5E.Details" }),
      traits: new SchemaField({
        ...TraitsFields.common,
        ...TraitsFields.creature,
        weaponProf: new SimpleTraitField({
          mastery: new SchemaField({
            value: new SetField(new StringField()),
            bonus: new SetField(new StringField())
          })
        }, { label: "DND5E.TraitWeaponProf" }),
        armorProf: new SimpleTraitField({}, { label: "DND5E.TraitArmorProf" })
      }, { label: "DND5E.Traits" }),
      resources: new SchemaField({
        primary: makeResourceField({ label: "DND5E.ResourcePrimary" }),
        secondary: makeResourceField({ label: "DND5E.ResourceSecondary" }),
        tertiary: makeResourceField({ label: "DND5E.ResourceTertiary" })
      }, { label: "DND5E.Resources" }),
      energy: new SchemaField({
        max: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.Energy.Max"
        }),
        total: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.Energy.Total"
        }),
        generated: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.Energy.Generated"
        }),
        bonuses: new SchemaField({
          overall: new FormulaField({ deterministic: true, label: "JUJUTSU.Energy.BonusOverall" }),
          level: new FormulaField({ deterministic: true, label: "JUJUTSU.Energy.BonusLevel" }),
          temp: new NumberField({
            required: true, nullable: false, integer: true, initial: 0,
            label: "JUJUTSU.Energy.BonusTemp"
          }),
          generatedEnergy: new NumberField({
            required: true, nullable: false, integer: true, initial: 0,
            label: "JUJUTSU.Energy.BonusGenerated"
          })
        }, { label: "JUJUTSU.Energy.Bonuses" }),
        intensiveTraining: new SchemaField({
          maxEnergy: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0,
            label: "JUJUTSU.IntensiveTraining.MaxEnergy"
          }),
          generatedEnergy: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0,
            label: "JUJUTSU.IntensiveTraining.GeneratedEnergy"
          }),
          cursePoints: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0,
            label: "JUJUTSU.IntensiveTraining.CursePoints"
          })
        }, { label: "JUJUTSU.IntensiveTraining.Label" }),
        generation: new SchemaField({
          baseMultiplier: new NumberField({
            required: true, nullable: false, integer: true, min: 1, initial: 2,
            label: "JUJUTSU.Energy.BaseMultiplier"
          }),
          turnMultiplier: new NumberField({
            required: true, nullable: false, integer: true, min: 1, initial: 1,
            label: "JUJUTSU.Energy.TurnMultiplier"
          }),
          bonusFlat: new NumberField({
            required: true, nullable: false, integer: true, initial: 0,
            label: "JUJUTSU.Energy.BonusFlat"
          })
        }, { label: "JUJUTSU.Energy.Generation" }),
        restrictions: new SchemaField({
          quarter: new BooleanField({ required: true, initial: false, label: "JUJUTSU.Energy.RestrictionQuarter" }),
          half: new BooleanField({ required: true, initial: false, label: "JUJUTSU.Energy.RestrictionHalf" }),
          flat: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0,
            label: "JUJUTSU.Energy.RestrictionFlat"
          })
        }, { label: "JUJUTSU.Energy.Restrictions" })
      }, { label: "JUJUTSU.Energy.Label" }),
      curseResources: new SchemaField({
        cursePoints: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.CursePoints"
        }),
        trainingPoints: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.TrainingPoints"
        }),
        lostTrainingPoints: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.LostTrainingPoints"
        }),
        narratorTrainingPoints: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.NarratorTrainingPoints"
        }),
        spentTrainingPoints: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.SpentTrainingPoints"
        })
      }, { label: "JUJUTSU.CurseResources" }),
      energyAbilities: new SchemaField({
        accumulation: new SchemaField({
          uses: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 3 }),
          max: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 3 }),
          enabled: new BooleanField({ initial: false })
        }),
        liberation: new SchemaField({
          uses: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 1 }),
          max: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 1 }),
          enabled: new BooleanField({ initial: false })
        })
      }, { label: "JUJUTSU.EnergyAbilities" }),

      // Princípios de Nen (Skill Tree — Cap. 7.5)
      manipulation: new SchemaField({
        // Pontos investidos em habilidades de manipulação (determina estágio)
        pointsInvested: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.Manipulation.PointsInvested"
        }),
        // Princípios desbloqueados: { [id]: { unlocked } }
        principles: new MappingField(new SchemaField({
          unlocked: new BooleanField({ initial: false })
        }), { label: "JUJUTSU.Manipulation.Abilities" }),
        // Habilidades desbloqueadas: { [id]: { unlocked, dcReduction, count } }
        // IMPORTANTE: required:false nos numéricos — entradas antigas na FONTE não têm esses
        // campos (schema evoluiu depois delas) e um campo required ausente faz a validação
        // descartar em silêncio updates parciais da entrada (bug do desfazer/estorno infinito).
        abilities: new MappingField(new SchemaField({
          unlocked: new BooleanField({ initial: false }),
          dcReduction: new NumberField({ required: false, nullable: false, integer: true, min: 0, initial: 0 }),
          // Nº de vezes adquirida (habilidades repetíveis, ex.: Expansão de Aura). 0 = não possui.
          count: new NumberField({ required: false, nullable: false, integer: true, min: 0, initial: 0 })
        }), { label: "JUJUTSU.Manipulation.Abilities" })
      }, { label: "JUJUTSU.Manipulation.Label" }),

      // Categorias Nen (HxH) — habilidades desbloqueadas por categoria
      nenCategories: new SchemaField({
        aprimorador: new SchemaField({
          level: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 }),
          unlockedMajor: new MappingField(new BooleanField({ initial: false })),
          dcReductions: new MappingField(new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }))
        }),
        emissor: new SchemaField({
          level: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 }),
          unlockedMajor: new MappingField(new BooleanField({ initial: false })),
          dcReductions: new MappingField(new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }))
        }),
        transmutador: new SchemaField({
          level: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 }),
          unlockedMajor: new MappingField(new BooleanField({ initial: false })),
          dcReductions: new MappingField(new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }))
        }),
        conjurador: new SchemaField({
          level: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 }),
          unlockedMajor: new MappingField(new BooleanField({ initial: false })),
          dcReductions: new MappingField(new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }))
        }),
        manipulador: new SchemaField({
          level: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 }),
          unlockedMajor: new MappingField(new BooleanField({ initial: false })),
          dcReductions: new MappingField(new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }))
        }),
        especialista: new SchemaField({
          level: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 }),
          unlockedMajor: new MappingField(new BooleanField({ initial: false })),
          dcReductions: new MappingField(new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }))
        })
      }),
      // Contador de habilidades principais desbloqueadas
      nenMajorCount: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
      // Categoria Híbrida — definida SÓ pelo Narrador. "" = nenhuma (categoria pura).
      nenHybrid: new StringField({ required: true, blank: true, initial: "" }),
      // Revelar a híbrida ao jogador (só o Narrador alterna). Se false, o jogador
      // não vê o rótulo; os efeitos mecânicos (treino) valem assim que definida.
      nenHybridRevealed: new BooleanField({ required: true, initial: false }),
      energyDice: new SchemaField({
        value: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.EnergyDice.Current"
        }),
        max: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.EnergyDice.Max"
        }),
        bonus: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "JUJUTSU.EnergyDice.Bonus"
        }),
        denomination: new StringField({
          required: true, initial: "d4", blank: false,
          label: "JUJUTSU.EnergyDice.Denomination"
        })
      }, { label: "JUJUTSU.EnergyDice.Label" }),
      // Pontos de Armadura (Foco Defensivo). Máximo é derivado das habilidades;
      // valor atual armazenado aqui. A resistência (2:1) é aplicada apenas na
      // camada de PA ao receber dano (damage application) — NÃO entra em traits.dr.
      armorPoints: new SchemaField({
        value: new NumberField({
          required: true, nullable: false, integer: true, min: 0, initial: 0,
          label: "Pontos de Armadura"
        })
      }, { label: "Pontos de Armadura" }),
      // Cultivo (Wuxia): Rank (1–10, Condensação de Qi → Divindade) + Estágio (1–3)
      // + Essência de Qi acumulada (setável). Tabela de custos em systems/cultivation-data.mjs.
      // + Pontos de Iluminação (recurso raro de acaso; gasto em avanços/entendimento).
      cultivation: new SchemaField({
        rank: new NumberField({ required: true, nullable: false, integer: true, min: 1, max: 10, initial: 1, label: "Rank de Cultivo" }),
        stage: new NumberField({ required: true, nullable: false, integer: true, min: 1, max: 3, initial: 1, label: "Estágio" }),
        essence: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0, label: "Essência de Qi" }),
        illumination: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0, label: "Pontos de Iluminação" }),
        bodyCultivation: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0, label: "Caminho do Corpo" }),
        soulCultivation: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0, label: "Caminho da Alma" }),
        bodyPills: new MappingField(new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }), { label: "Pílulas do Sangue Divino" }),
        soulPills: new MappingField(new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }), { label: "Pílulas da Nutrição da Alma" })
      }, { label: "Cultivo" }),
      // Conceitos Elementais (Wuxia): elementos treináveis (Madeira, Fogo, ...).
      // Cada entrada { level, unlocked }. A resistência concedida é DERIVADA em
      // prepareDerivedData (soma em traits.resistance) — não persistida aqui.
      conceitos: new MappingField(new SchemaField({
        level: new NumberField({ required: true, nullable: false, integer: true, min: 0, max: 10, initial: 0 }),
        unlocked: new BooleanField({ initial: false }),
        // Falhas de treino por nível-alvo. Após 3 falhas, PC não é mais consumido.
        failures: new MappingField(new NumberField({ required: false, nullable: false, integer: true, min: 0, initial: 0 }))
      }), { label: "Conceitos" }),
      // Habilidades Elementais: { [elemento_id]: { [habilidade_id]: { tier: 0-3 } } }
      // tier 0 = não adquirida, 1 = base (★), 2 = dominado (★★), 3 = perfeição (★★★)
      elementAbilities: new MappingField(new MappingField(new NumberField({
        required: true, nullable: false, integer: true, min: 0, max: 3, initial: 0
      })), { label: "Habilidades Elementais" }),
      favorites: new ArrayField(new SchemaField({
        type: new StringField({ required: true, blank: false }),
        id: new StringField({ required: true, blank: false }),
        sort: new IntegerSortField()
      }), { label: "DND5E.Favorites" })
    });
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  get isCharacter() {
    return true;
  }

  /* -------------------------------------------- */
  /*  Data Migration                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static _migrateData(source) {
    super._migrateData(source);
    AttributesFields._migrateInitiative(source.attributes);
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareBaseData() {
    this.attributes.hd = new HitDice(this.parent);
    this.details.level = 0;
    this.attributes.attunement.value = 0;

    for ( const item of this.parent.items ) {
      if ( item.type === "class" ) this.details.level += item.system.levels;
    }

    this.attributes.prof = Proficiency.calculateMod(this.details.level);

    const { xp, level } = this.details;
    xp.max = level >= CONFIG.DND5E.maxLevel ? Infinity : this.parent.getLevelExp(level || 1);
    xp.min = level ? this.parent.getLevelExp(level - 1) : 0;
    if ( Number.isFinite(xp.max) ) {
      const required = xp.max - xp.min;
      const pct = Math.round((xp.value - xp.min) * 100 / required);
      xp.pct = Math.clamp(pct, 0, 100);
    } else if ( game.settings.get("wuxia-system", "levelingMode") === "xpBoons" ) {
      const overflow = xp.value - this.parent.getLevelExp(CONFIG.DND5E.maxLevel);
      xp.boonsEarned = Math.max(0, Math.floor(overflow / CONFIG.DND5E.epicBoonInterval));
      const progress = overflow - (CONFIG.DND5E.epicBoonInterval * xp.boonsEarned);
      xp.pct = Math.clamp(Math.round((progress / CONFIG.DND5E.epicBoonInterval) * 100), 0, 100);
    } else {
      xp.pct = 100;
    }

    AttributesFields.prepareBaseArmorClass.call(this);
    AttributesFields.prepareBaseEncumbrance.call(this);
    SensesField._shim(this.attributes.senses);
  }

  /* -------------------------------------------- */

  prepareEmbeddedData() {
    super.prepareEmbeddedData();
    if ( this.details.race instanceof Item ) {
      AttributesFields.prepareRace.call(this, this.details.race);
      this.details.type = this.details.race.system.type;
    } else {
      this.details.type = new CreatureTypeField({ swarm: false }).initialize({ value: "humanoid" }, this);
    }
    for ( const key of Object.keys(CONFIG.DND5E.movementTypes) ) this.attributes.movement[key] ??= 0;
    for ( const key of Object.keys(CONFIG.DND5E.senses) ) this.attributes.senses.ranges[key] ??= 0;
    this.attributes.movement.units ??= defaultUnits("length");
    this.attributes.senses.units ??= defaultUnits("length");
  }

  /* -------------------------------------------- */

  prepareDerivedData() {
    const rollData = this.parent.getRollData({ deterministic: true });
    const { originalSaves, originalSkills } = this.parent.getOriginalStats();

    this.details.tier = Math.ceil((this.details.level - 4) / 6) + 1;

    AttributesFields.prepareExhaustionLevel.call(this);
    this.prepareAbilities({ rollData, originalSaves });
    this.prepareSkills({ rollData, originalSkills });
    this.prepareTools({ rollData });
    AttributesFields.prepareArmorClass.call(this, rollData);
    AttributesFields.prepareConcentration.call(this, rollData);
    AttributesFields.prepareEncumbrance.call(this, rollData);
    AttributesFields.prepareInitiative.call(this, rollData);
    AttributesFields.prepareMovement.call(this, rollData);
    AttributesFields.prepareSpellcastingAbility.call(this);
    TraitsFields.prepareLanguages.call(this);
    TraitsFields.prepareResistImmune.call(this);

    const hpOptions = {};
    if ( this.attributes.hp.max === null ) {
      // Vida (Wuxia): 12 + CON (inicial) + 3 por Nível/estágio + (20 + CON) por Rank.
      // Nível = estágio de cultivo. Cada rank inteiro = 3+3+(20+CON) = 26+CON.
      const conMod = this.abilities[CONFIG.DND5E.defaultAbilities.hitPoints ?? "con"]?.mod ?? 0;
      const rank = this.cultivation?.rank ?? 1;
      const stg = this.cultivation?.stage ?? 1;
      const baseVida = (12 + conMod) + ((rank - 1) * (26 + conMod)) + ((stg - 1) * 3);
      // Cultivo do Corpo: +5 PV por nível treinado.
      const bodyBonus = (this.cultivation?.bodyCultivation ?? 0) * 5;
      hpOptions.bonus = baseVida + bodyBonus
        + (simplifyBonus(this.attributes.hp.bonuses.level, rollData) * (this.details.level || 1))
        + simplifyBonus(this.attributes.hp.bonuses.overall, rollData);
    }
    AttributesFields.prepareHitPoints.call(this, this.attributes.hp, hpOptions);

    const level = this.details?.level ?? 1;
    // Dados de Qi: 2 por Nível de Cultivo ((rank−1)×3 + estágio) — os estágios contam
    // como níveis de verdade. Ex.: Condensação nv3 → nível 3 → 6 dados.
    const cRank = this.cultivation?.rank ?? 1;
    const cStage = this.cultivation?.stage ?? 1;
    const nivelCult = ((cRank - 1) * 3) + cStage;
    this.energyDice.max = (nivelCult * 2) + (this.energyDice.bonus ?? 0);

    // Pontos de Armadura (Foco Defensivo) — máximo derivado das habilidades:
    //  • Foco Defensivo desbloqueado → 20
    //  • Fluxo Constante desbloqueado → +20 adicionais
    //  • Resistência Aprimorada → +3 × nível de Aprimorador
    const ab = this.manipulation?.abilities ?? {};
    let armorMax = 0;
    if ( ab.focoDefensivo?.unlocked ) {
      armorMax += 20;
      if ( ab.fluxoConstante?.unlocked ) armorMax += 20;
      const resistUnlocked = !!this.nenCategories?.aprimorador?.unlockedMajor?.resistenciaAprimorada;
      const aprimLvl = this.nenCategories?.aprimorador?.level ?? 0;
      if ( resistUnlocked && aprimLvl > 0 ) armorMax += aprimLvl * 3;
    }
    this.armorPoints ??= {};
    // Portão da Visão (Corpo nv.8): +60 PA no Foco Defensivo.
    const bodyLvl = this.cultivation?.bodyCultivation ?? 0;
    if ( bodyLvl >= 8 ) armorMax += 60;
    this.armorPoints.max = armorMax;
    this.armorPoints.value = Math.min(this.armorPoints.value ?? 0, armorMax);

    const bonusOverall = simplifyBonus(this.energy.bonuses?.overall, rollData);
    const bonusLevel = simplifyBonus(this.energy.bonuses?.level, rollData) * level;
    const bonusTemp = this.energy.bonuses?.temp ?? 0;
    const intensiveBonus = (this.energy.intensiveTraining?.maxEnergy ?? 0) * 5;
    // Qi (Wuxia): 60 (inicial) + 20 por Nível/estágio + 40 por Rank de Cultivo.
    // Nível = estágio de cultivo (não o nível de classe). Casa com a tabela do livro.
    // (cRank/cStage já declarados acima, no bloco dos Dados de Qi.)
    let energyMax = 60 + (80 * (cRank - 1)) + (20 * (cStage - 1))
      + bonusOverall + bonusLevel + bonusTemp + intensiveBonus;
    // Portão da Morte (Corpo nv.10): dobra o Qi máximo.
    if ( bodyLvl >= 10 ) energyMax *= 2;
    // Restrições permanentes de aura em DEGRAUS: perde 5 a cada 20 COMPLETADOS (1/4)
    // ou 5 a cada 10 COMPLETADOS (metade). Ganhos parciais (ex.: +5 do Treinamento
    // Intenso) ficam inteiros até fechar o degrau. A perda fixa sai por último.
    const restr = this.energy.restrictions ?? {};
    if ( restr.quarter ) energyMax -= Math.floor(energyMax / 20) * 5;
    if ( restr.half ) energyMax -= Math.floor(energyMax / 10) * 5;
    this.energy.max = Math.max(0, energyMax - (restr.flat ?? 0));

    // Acúmulo de Energia disponível a partir do nível 5
    if ( level >= 5 ) this.energyAbilities.accumulation.enabled = true;

    // ── Wuxia Legacy: efeitos derivados do Caminho do Corpo ─────────────
    // Portão da Abertura (nv.7): -4 CD para treinar conceitos elementais.
    this.bodyConceitoCdReduction = (bodyLvl >= 7) ? 4 : 0;
    // Portão da Morte (nv.10): gera 3× nível em Qi por turno (em vez de 2×).
    if ( bodyLvl >= 10 ) this.energy.generation.baseMultiplier = 3;

    // Estágio de Manipulação (baseado em PM investidos em habilidades de manipulação)
    const invested = this.manipulation?.pointsInvested ?? 0;
    if ( invested >= 61 ) this.manipulation.stage = "master";
    else if ( invested >= 21 ) this.manipulation.stage = "expert";
    else this.manipulation.stage = "beginner";

    // Nível de Maestria (baseado em Pontos de Treinamento investidos)
    const mp = this.masteryPoints ?? 0;
    const masteryTable = [
      { level: 10, pts: 150, sorcerer: "special", die: null, evolution: "expansionSemBarreiras" },
      { level: 9,  pts: 115, sorcerer: "special", die: null, evolution: null },
      { level: 7,  pts: 100, sorcerer: "1º",     die: "d12", evolution: "expansaoDominio" },
      { level: 6,  pts: 75,  sorcerer: "1º",     die: null, evolution: null },
      { level: 5,  pts: 60,  sorcerer: "2º",     die: "d10", evolution: "feiticoMaximo" },
      { level: 4,  pts: 35,  sorcerer: "2º",     die: null, evolution: null },
      { level: 3,  pts: 20,  sorcerer: "3º",     die: "d8",  evolution: "feiticoEstendido" },
      { level: 2,  pts: 10,  sorcerer: "3º",     die: null, evolution: null },
      { level: 1,  pts: 1,   sorcerer: "4º",     die: "d6",  evolution: "feiticoBasico" }
    ];
    const mastery = masteryTable.find(m => mp >= m.pts) ?? { level: 0, pts: 0, sorcerer: "4th", die: null };
    this.masteryLevel = mastery.level;
    this.masterySorcerer = mastery.sorcerer;
    this.masteryDie = mastery.die;
    this.masteryEvolution = mastery.evolution;

    // Perito em Fuga (Habilidade Básica): concede 15m de deslocamento e ergue o TETO.
    // Sozinho, o máximo é 15. Se OUTRA fonte também der deslocamento com limite ≥15m
    // (no sistema: Agilidade Avançada do Emissor, limite ≥15 em todos os ranks), o teto
    // passa a 21 — e o deslocamento cresce a partir dos 15 com o bônus dessa fonte, sem
    // estourar 21. Ex.: 15 + 1,5 = 16,5 · 15 + 3 = 18 · 15 + 6 = 21. Cláusula condicional
    // que Active Effect não expressa (o valor colide com outros efeitos), resolvida aqui,
    // após os efeitos aplicarem — este cálculo é a palavra final do deslocamento.
    const temPeritoFuga = this.parent?.items?.some(i => /perito\s+em\s+fuga/i.test(i.name ?? ""));
    if ( temPeritoFuga ) {
      const lvl = this.nenCategories?.emissor?.level ?? 0;
      const rank = lvl >= 8 ? 3 : lvl >= 5 ? 2 : lvl >= 2 ? 1 : 0;   // Agilidade Avançada ★/★★/★★★
      const bonusAgilidade = rank === 1 ? 1.5 : rank === 2 ? 3 : rank === 3 ? 6 : 0;
      const teto = bonusAgilidade > 0 ? 21 : 15;                     // outra fonte (limite ≥15) → teto 21
      this.attributes.movement.walk = Math.min(15 + bonusAgilidade, teto);
    }

    // Conceitos Elementais: cada nível treinado soma resistência ao tipo(s) de
    // dano associado ao elemento. Roda no FIM do prepareDerivedData, após
    // prepareResistImmune (da superclasse) ter normalizado ALL — assim a soma
    // dos elementos se acumula por cima, sem ser limpa.
    const conceitos = this.conceitos ?? {};
    for ( const [id, data] of Object.entries(conceitos) ) {
      const el = CONCEITOS_ELEMENTOS.find(e => e.id === id);
      if ( !el?.resistencia || !data?.level ) continue;
      for ( const [type, perNivel] of Object.entries(el.resistencia) ) {
        const bonus = perNivel * data.level;
        this.traits.resistance ??= {};
        this.traits.resistance[type] = (this.traits.resistance[type] ?? 0) + bonus;
      }
    }
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ( (await super._preCreate(data, options, user)) === false ) return false;
    await TraitsFields.preCreateSize.call(this, data, options, user);

    if ( this.parent._stats?.compendiumSource?.startsWith("Compendium.") ) return;
    this.parent.updateSource({
      prototypeToken: {
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        sight: { enabled: true }
      }
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    if ( (await super._preUpdate(changes, options, user)) === false ) return false;
    await AttributesFields.preUpdateHP.call(this, changes, options, user);
    await TraitsFields.preUpdateSize.call(this, changes, options, user);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    AttributesFields.onUpdateHP.call(this, changed, options, userId);
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  cantripLevel(spell) {
    return this.details.level;
  }

  hasFavorite(favoriteId) {
    return !!this.favorites.find(f => f.id === favoriteId);
  }

  addFavorite(favorite) {
    if ( this.hasFavorite(favorite.id) ) return Promise.resolve(this.parent);

    if ( favorite.id.startsWith(".") && fromUuidSync(favorite.id, { relative: this.parent }) === null ) {
      throw new Error(`The item with id ${favorite.id} is not owned by actor ${this.parent.id}`);
    }

    let maxSort = 0;
    const favorites = this.favorites.map(f => {
      if ( f.sort > maxSort ) maxSort = f.sort;
      return { ...f };
    });
    favorites.push({ ...favorite, sort: maxSort + CONST.SORT_INTEGER_DENSITY });
    return this.parent.update({ "system.favorites": favorites });
  }

  removeFavorite(favoriteId) {
    if ( favoriteId.startsWith("resources.") ) return this.parent.update({ [`system.${favoriteId}.max`]: 0 });
    const favorites = this.favorites.filter(f => f.id !== favoriteId);
    return this.parent.update({ "system.favorites": favorites });
  }
}

/* -------------------------------------------- */

function makeResourceField(schemaOptions={}) {
  return new SchemaField({
    value: new NumberField({required: true, integer: true, initial: 0, labels: "DND5E.ResourceValue"}),
    max: new NumberField({required: true, integer: true, initial: 0, labels: "DND5E.ResourceMax"}),
    sr: new BooleanField({required: true, labels: "DND5E.REST.Short.Recovery"}),
    lr: new BooleanField({required: true, labels: "DND5E.REST.Long.Recovery"}),
    label: new StringField({required: true, labels: "DND5E.ResourceLabel"})
  }, schemaOptions);
}