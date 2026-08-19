/**
 * Sistema de Qi (Wuxia)
 *
 * Qi Máximo = derivado no data model (60 + 80/rank + 20/estágio + bônus).
 * Geração por turno = Nível de Cultivo × baseMultiplier, onde
 *   Nível de Cultivo = (rank−1)×3 + estágio (os estágios contam como níveis).
 * Bônus de treinamento é somado UMA VEZ após a geração.
 */
import { nivelCultivoDoAtor } from "./cultivation-data.mjs";

export class EnergySystem {

  /** Qi máximo = o valor já derivado no data model (fonte única). */
  static calculateMaxPA(actor) {
    return actor.system.energy?.max ?? 0;
  }

  static calculateLimit(level, baseMultiplier = 2) {
    return level * baseMultiplier;
  }

  /**
   * Bônus fixo de geração por turno vindo dos treinos de Qi Gerado.
   * = bonuses.generatedEnergy + intensiveTraining.generatedEnergy
   */
  static calculateGenerationBonus(actor) {
    const bonuses = actor.system.energy.bonuses;
    const intensive = actor.system.energy.intensiveTraining;
    return (bonuses.generatedEnergy ?? 0) + (intensive.generatedEnergy ?? 0);
  }

  static calculateCursePointBonus(actor) {
    return actor.system.energy.intensiveTraining.cursePoints ?? 0;
  }

  static async updateMaxPA(actor) {
    const novoMax = this.calculateMaxPA(actor);
    await actor.update({ "system.energy.max": novoMax });
    return novoMax;
  }

  static async processTurnStart(actor) {
    const energy = actor.system.energy;
    const level = nivelCultivoDoAtor(actor);
    const baseMultiplier = energy.generation.baseMultiplier ?? 2;
    const turnMultiplier = energy.generation.turnMultiplier ?? 1;
    const bonusFlat = energy.generation.bonusFlat ?? 0;
    const trainingBonus = this.calculateGenerationBonus(actor);
    const limite = this.calculateLimit(level, baseMultiplier);
    const limiteTotal = limite + trainingBonus;

    if (energy.generated >= limiteTotal) return null;

    // Geração base: limitada ao teto base
    const faltandoBase = Math.max(0, limite - energy.generated);
    const base = level * baseMultiplier;
    const geracaoBase = Math.min((base * turnMultiplier) + bonusFlat, faltandoBase);

    // Bônus de treinamento: aplica apenas se ainda não foi atingido o teto total
    const faltandoTotal = limiteTotal - energy.generated;
    const bonusAplicado = Math.min(trainingBonus, faltandoTotal - geracaoBase);
    const geracao = geracaoBase + Math.max(0, bonusAplicado);

    const transferencia = Math.min(geracao, energy.total);
    // Portão da Morte (Corpo nv.10): todo Qi recebido vem dobrado.
    const qiMult = (actor.system.cultivation?.bodyCultivation ?? 0) >= 10 ? 2 : 1;
    const ganhoReal = Math.min(transferencia * qiMult, energy.max - energy.generated);
    const novoTotal = Math.max(0, energy.total - transferencia);  // reserva gasta normalmente
    const novaGerada = energy.generated + ganhoReal;

    const updates = {
      "system.energy.total": novoTotal,
      "system.energy.generated": novaGerada,
      "system.energy.generation.turnMultiplier": 1
    };

    await actor.update(updates, { isEnergySystem: true });
    return updates;
  }

  static async consumePA(actor, custo) {
    const gerada = actor.system.energy.generated;
    if (gerada < custo) {
      ui.notifications.warn(
        `${actor.name} não tem Qi Gerado suficiente! (${gerada} disponível, ${custo} necessário)`
      );
      return false;
    }
    await actor.update({ "system.energy.generated": gerada - custo }, { isEnergySystem: true });
    return true;
  }

  static async processTurnEnd(actor) {
    const energy = actor.system.energy;
    const level = nivelCultivoDoAtor(actor);
    const trainingBonus = this.calculateGenerationBonus(actor);
    const limite = this.calculateLimit(level, energy.generation.baseMultiplier) + trainingBonus;
    if (energy.generated > limite) {
      await actor.update({ "system.energy.generated": limite }, { isEnergySystem: true });
    }
  }

  /**
   * Sacrifica parte da economia de ações para GERAR PA além do limite do turno.
   * O PA NÃO surge do nada: é transferido da reserva (energy.total) para a PA
   * gerada (energy.generated), como uma geração normal — só que sem respeitar o
   * teto por turno. Limitado ao que existe em `total`.
   * @returns {Promise<number>} quanto foi efetivamente gerado (0 se sem reserva).
   */
  static async sacrificeAction(actor, tipo = "action") {
    const level = nivelCultivoDoAtor(actor);
    const desejado = tipo === "action" ? level : 2;
    const total = actor.system.energy.total ?? 0;
    const transferencia = Math.min(desejado, total);

    if ( transferencia <= 0 ) {
      ui.notifications.warn(
        `${actor.name} não tem Qi na reserva (Total) para sacrificar uma ação.`
      );
      return 0;
    }

    await actor.update({
      "system.energy.total": total - transferencia,
      "system.energy.generated": actor.system.energy.generated + transferencia
    }, { isEnergySystem: true });

    const acao = tipo === "action" ? "ação" : (tipo === "bonus" ? "ação bônus" : "reação");
    ui.notifications.info(
      `${actor.name} sacrificou uma ${acao} e gerou ${transferencia} de Qi (da reserva, acima do limite).`
    );
    return transferencia;
  }

  static async processTurnStartWithChoices(actor, choices) {
    const energy = actor.system.energy;
    const level = nivelCultivoDoAtor(actor);
    const abilities = actor.system.energyAbilities;

    let baseMultiplier = parseInt(choices.baseMultiplier ?? 2);

    if ( choices.useLiberation && abilities.liberation.uses > 0 ) {
      baseMultiplier = 3;
      await actor.update({
        "system.energyAbilities.liberation.uses": abilities.liberation.uses - 1
      }, { isEnergySystem: true });
    }

    const trainingBonus = this.calculateGenerationBonus(actor);
    const limite = this.calculateLimit(level, baseMultiplier);
    const limiteTotal = limite + trainingBonus;
    const faltandoTotal = limiteTotal - energy.generated;
    if ( faltandoTotal <= 0 ) return;

    // Geração base: limitada ao teto base
    const faltandoBase = Math.max(0, limite - energy.generated);
    const base = level * baseMultiplier;
    let geracaoBase = Math.min(base, faltandoBase);

    if ( choices.useAccumulation && abilities.accumulation.uses > 0 ) {
      geracaoBase = Math.min(geracaoBase + level, faltandoBase);
      await actor.update({
        "system.energyAbilities.accumulation.uses": abilities.accumulation.uses - 1
      }, { isEnergySystem: true });
    }

    const flatBonus = parseInt(choices.flatBonus ?? 0);
    if ( flatBonus > 0 ) geracaoBase = Math.min(geracaoBase + flatBonus, faltandoBase);

    // Bônus de treinamento: aplica apenas o que falta para o teto total
    const bonusAplicado = Math.min(trainingBonus, faltandoTotal - geracaoBase);
    const totalGerar = geracaoBase + Math.max(0, bonusAplicado);

    const transferencia = Math.min(totalGerar, energy.total);
    // Portão da Morte (Corpo nv.10): todo Qi recebido vem dobrado.
    const qiMult = (actor.system.cultivation?.bodyCultivation ?? 0) >= 10 ? 2 : 1;
    const ganhoReal = Math.min(transferencia * qiMult, energy.max - energy.generated);
    const novoTotal = Math.max(0, energy.total - transferencia);
    const novaGerada = energy.generated + ganhoReal;

    await actor.update({
      "system.energy.total": novoTotal,
      "system.energy.generated": novaGerada,
      "system.energy.generation.turnMultiplier": 1
    }, { isEnergySystem: true });
  }
}
