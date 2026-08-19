/**
 * ─── Habilidades Mortais e Imortais (Wuxia) ──────────────────────────────────
 * Habilidades de Qi divididas por Rank de Cultivo. Mortais são aprendidas
 * automaticamente ao atingir o rank ou compradas com PT + PC. Imortais são
 * aprendidas automaticamente no rank ou compradas antecipadamente com 4 PT
 * (requer no mínimo Mar Divino).
 *
 * IDs focoAgressivo, focoDefensivo, explosaoDefensiva, fluxoVeloz, fluxoConstante
 * são compatíveis com o que a sidebar já lê em manipulation.abilities.
 *
 * Estrutura de cada habilidade:
 *   { id, name, tier: "mortal"|"imortal", rankReq, description, cost: {pt,pc},
 *     autoLearn: bool, prereq?: string[], repeatable?: bool }
 */

export const MORTAL_ABILITIES = [

  // ═════════ RANK 1 — CONDENSAÇÃO DE QI (auto-aprendidas) ═════════
  { id: "armaduraQi", name: "Armadura de Qi", tier: "mortal", rankReq: 1, autoLearn: true,
    cost: { pt: 0, pc: 0 },
    description: "Você recebe resistência 5 para cada nível de cultivo contra ataques que não possuem Qi." },

  { id: "explosaoOfensiva", name: "Explosão Ofensiva", tier: "mortal", rankReq: 1, autoLearn: true,
    cost: { pt: 0, pc: 0 },
    description: "Você pode adicionar até um número de d4 no seu próximo ataque ou dados de dano de sua técnica até um valor igual ao seu bônus de proficiência. Você consome 1 PA para cada dado aumentado. Esse aumento não é afetado por críticos, sendo aplicado ao fim da rolagem. Esse efeito pode ser utilizado em técnicas e habilidades de cura, mas você gasta 2 PA para cada dado." },

  { id: "explosaoDefensiva", name: "Explosão Defensiva", tier: "mortal", rankReq: 1, autoLearn: true,
    cost: { pt: 0, pc: 0 },
    description: "Você pode gastar 1 PA para reduzir 3 de dano sofrido ou 5 a sua próxima técnica de redução, até um máximo igual ao valor do seu Qi disponível na rodada. A versão de 5 de redução não funciona em técnicas similares ao Transferência Rápida, que reduz o dano de cada ataque em 5 fixo." },

  // ═════════ RANK 2 — FORMAÇÃO DE NÚCLEO ═════════
  { id: "focoAgressivo", name: "Foco Agressivo", tier: "mortal", rankReq: 2,
    cost: { pt: 2, pc: 6 },
    description: "Suas jogadas de ataque (Comuns) recebem 3 de dano adicional." },

  { id: "focoDefensivo", name: "Foco Defensivo", tier: "mortal", rankReq: 2,
    cost: { pt: 2, pc: 6 },
    description: "Você envolve seu corpo com uma camada extra de Qi, criando 20 Pontos de Armadura. Funcionam como PV temporários, mas são consumidos antes destes e duram até o fim do encontro. Enquanto ativos, você adquire resistência 1 a todos os tipos de dano para cada nível de cultivo. Restaurados após 10 minutos de descanso sem usar Qi. Não pode usar com Foco Agressivo ativo." },

  // ═════════ RANK 3 — NÚCLEO ROTATIVO ═════════
  { id: "protecaoQi", name: "Proteção de Qi", tier: "mortal", rankReq: 3,
    cost: { pt: 2, pc: 3 },
    description: "Você pode envolver objetos ou criaturas com seu Qi para desencadear efeitos: tornar a CR igual a sua, dobrar dano em objetos/estruturas, conceder 50 Pontos de Armadura, ou tornar o dano base do objeto 6 e poder arremessá-lo." },

  { id: "explosaoCultivo", name: "Explosão de Cultivo", tier: "mortal", rankReq: 3,
    cost: { pt: 2, pc: 3 },
    description: "Ao usar três ações [⬢⬢⬢], você pode explodir todo seu cultivo de uma vez, cometendo suicídio. Causa 35 de dano Verdadeiro + 35 por Rank acima do Núcleo Rotativo + PV e Qi restantes, em área de 18 metros (dobrando a cada Rank acima). Dobra o alcance anterior a cada Rank." },

  { id: "sentidoDivino", name: "Sentido Divino", tier: "mortal", rankReq: 3,
    cost: { pt: 2, pc: 3 },
    description: "Envia seus sentidos para fora do corpo, permitindo ver sem olhar, atravessando roupas, carne, rochas e metais. +2 em Testes de Espírito (Percepção, Intuição) e Sabedoria (Investigação). Alcance de 12 metros de raio (+12 por re-aprendizado)." },

  { id: "mensagemQi", name: "Mensagem de Qi", tier: "mortal", rankReq: 3, prereq: ["sentidoDivino"],
    cost: { pt: 2, pc: 3 },
    description: "Gasta 1 PQ para enviar uma mensagem (até 20 palavras) a uma criatura que você toque com seu sentido divino. A criatura precisa ter essa habilidade para responder. Ou gaste 10 PQ para falar à vontade por 5 minutos." },

  // ═════════ RANK 4 — MAR DIVINO ═════════
  { id: "pressaoCultivo", name: "Pressão de Cultivo", tier: "mortal", rankReq: 4,
    cost: { pt: 2, pc: 3 },
    description: "Ao gastar 5 PQ, libera uma onda de pressão dentro do seu Sentido Divino. Mesmo Rank ou maior: sem efeito. 1 Rank abaixo: Salvaguarda de Espírito. 2 Ranks abaixo: Salvaguarda com desvantagem. 3+ Ranks abaixo: Paralisado automaticamente." },

  { id: "vooConjunto", name: "Voo Conjunto", tier: "mortal", rankReq: 4,
    cost: { pt: 2, pc: 3 },
    description: "Envolve uma criatura com seu Qi para fazê-la levitar junto enquanto usa Levitação de Qi, consumindo o dobro de Qi. +1 pessoa por Rank acima do Núcleo Rotativo, multiplicando por 10 a partir do Lorde Divino." },

  { id: "fluxoVeloz", name: "Fluxo Veloz", tier: "mortal", rankReq: 4,
    cost: { pt: 2, pc: 6 },
    description: "Você pode manter o Foco Agressivo e Foco Defensivo ativos ao mesmo tempo." },

  { id: "fluxoPerfeito", name: "Fluxo Perfeito", tier: "mortal", rankReq: 4,
    cost: { pt: 2, pc: 10 },
    description: "Suas jogadas de ataque (Comuns e de Técnica) recebem +3 de acerto." },

  { id: "fluxoConstante", name: "Fluxo Constante", tier: "mortal", rankReq: 4,
    cost: { pt: 2, pc: 10 },
    description: "O dano do seu Foco Agressivo aumenta em um passo e seu Foco Defensivo recebe 20 PV temporários adicionais." },

  { id: "ativacaoFluxo", name: "Ativação de Fluxo", tier: "mortal", rankReq: 4,
    cost: { pt: 2, pc: 15 },
    description: "Enquanto estiver com Fluxo Veloz ativo, você pode aumentar um número de dados de dano da Explosão Ofensiva igual ao dobro do bônus de proficiência no lugar do original." },

  // ═════════ HABILIDADES IMORTAIS (Rank 5+) ═════════
  { id: "dominio", name: "Domínio", tier: "imortal", rankReq: 5,
    cost: { pt: 4, pc: 15 },
    description: "Um domínio é uma área de autoridade que incorpora todos os elementos que você controla. Apenas o domínio de outro cultivador pode enfrentá-lo. Enquanto ativo via Expansão de Domínio, todas as criaturas sem domínio causam -10 de dano em cada ataque ou técnica. Auto-aprendido na Transformação Divina; pode ser aprendido antes com 4 PT (mínimo Mar Divino)." },

  { id: "encarnacaoCultivo", name: "Encarnação de Cultivo", tier: "imortal", rankReq: 6,
    cost: { pt: 4, pc: 15 },
    description: "Ao sacrificar 1 nível do seu Cultivo, cria um avatar de Formação de Núcleo até 2 Ranks abaixo do seu nível atual. O avatar tem 25 PV por Rank, Qi referente ao Rank e pode usar seus Conceitos com a mesma proficiência. Demais estatísticas seguem o Rank do avatar. Não recupera Qi. Se absorvido de volta, recupera o nível gasto. Máximo 3 avatares por vez. Auto-aprendido no Lorde Divino; pode ser aprendido antes com 4 PT (mínimo Mar Divino)." },

];

/** Mapa id → habilidade para lookup rápido. */
export const ABILITY_POR_ID = Object.fromEntries(MORTAL_ABILITIES.map(a => [a.id, a]));
