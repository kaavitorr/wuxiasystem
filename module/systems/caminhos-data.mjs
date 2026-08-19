/**
 * ─── Caminhos de Cultivo: Corpo e Alma ───────────────────────────────────────
 * 10 níveis em cada caminho. Os efeitos descritos são informativos — a aplicação
 * mecânica real (bônus de atributo, CR, PA, resistências, etc.) fica por conta de
 * Active Effects configurados manualmente, pois muitos efeitos são complexos ou
 * exigem escolha do jogador (avatar de alma, batalha da alma, etc.).
 *
 * Estrutura de cada nível: { level, name, description }.
 */

/**
 * Requisitos para avançar um nível num caminho de cultivo.
 * @param {"body"|"soul"} path
 * @param {number} currentLevel  Nível atual (0–9); tenta alcançar currentLevel+1.
 * @returns {{dias:number, pt:number, pills:number, pillName:string, pillLevel:number}}
 *   - dias: dias de treino gastos.
 *   - pt: Pontos de Cultivo gastos.
 *   - pills: nº de pílulas consumidas.
 *   - pillName: nome da pílula.
 *   - pillLevel: nível de Alquimia exigido da pílula (= nível-alvo).
 */
export function pathRequirement(path, currentLevel) {
  const target = currentLevel + 1;
  if ( path === "body" ) {
    return {
      dias: 5 * currentLevel,
      pt: 5 * target,
      pills: 10,
      pillName: "Pílulas do Sangue Divino",
      pillLevel: target
    };
  }
  // soul
  return {
    dias: 10 * currentLevel,
    pt: 10 * target,
    pills: 20,
    pillName: "Pílulas da Nutrição da Alma",
    pillLevel: target
  };
}

export const BODY_PILL_NAME = "Pílulas do Sangue Divino";
export const SOUL_PILL_NAME = "Pílulas da Nutrição da Alma";

export const BODY_PATH = [
  {
    level: 1, name: "Forjamento do Corpo",
    description: "O primeiro nível de treino do corpo. Permite aumentar um aspecto da sua força física. Ao completar este treinamento, você multiplica sua capacidade de carga por 10."
  },
  {
    level: 2, name: "Temperando a Medula",
    description: "Segundo nível, extremamente doloroso. Ao completá-lo, você pode substituir sua CR por 14, adicionando +2 para cada nível que possuir no Caminho do Corpo, até um máximo de 30."
  },
  {
    level: 3, name: "Portão da Cura",
    description: "Permite usar uma ação [⬢] em qualquer momento do combate para rolar dados de vida até um número igual ao seu bônus de proficiência, curando PV como num descanso curto. Rola 1 dado adicional a cada vez que subir de nível neste treinamento após o Portão da Cura."
  },
  {
    level: 4, name: "Portão do Limite",
    description: "A abertura se localiza na espinha, aumentando muito sua força. Recebe +1 Ponto de Força e Agilidade adicional, +6 em Testes de Atributo de Força e +2 em Salvaguardas de Força."
  },
  {
    level: 5, name: "Portão das Maravilhas",
    description: "A abertura se encontra nos olhos. Recebe +6 de deslocamento passivamente e, até 3 vezes por encontro, pode triplicar seu deslocamento e aparecer a 1,5m de uma criatura à sua escolha de forma instantânea dentro do alcance. Se o fizer, recebe acerto automático na próxima rolagem de acerto."
  },
  {
    level: 6, name: "Portão da Dor",
    description: "Libera uma erupção de força. Recebe +2 de Força e +1 de Atributo de Força adicional a cada vez que abrir um novo portão, até um máximo de 30. Se sua Força já estiver em 30, pode escolher Agilidade ou Constituição."
  },
  {
    level: 7, name: "Portão da Abertura",
    description: "Localizado no cérebro. Especial: não fortalece um aspecto físico, mas a percepção a níveis assustadores. Reduz a CD para aprender qualquer conceito em -4."
  },
  {
    level: 8, name: "Portão da Visão",
    description: "Localizado nas costas. Concede um nível de defesa assustador: recebe 60 Pontos de Armadura adicionais no Foco Defensivo, recebidos no início de cada encontro."
  },
  {
    level: 9, name: "Portão da Vida",
    description: "Localizado no coração. Libera enorme vitalidade. Sempre que estiver com menos da metade dos PV, cura 2 vezes o seu nível (somando múltiplos ranks) no início de cada turno. Não funciona se estiver incapacitado com 0 PV. Pode regenerar membros e se recuperar de qualquer Ferida Brutal ou Ferimento Persistente ao fim de um descanso longo."
  },
  {
    level: 10, name: "Portão da Morte",
    description: "Localizado no mar espiritual. Dobra seus Pontos de Qi e passa a gerar 3 vezes o nível acumulado em Qi por nível (em vez de 2). Toda vez que aumentar seu Qi máximo, recebe o dobro."
  }
];

export const SOUL_PATH = [
  {
    level: 1, name: "Avatar da Alma",
    description: "Permite criar um avatar por onde canalizar suas habilidades. Pode usar uma ação [⬢] para manifestá-lo, visível apenas a criaturas de Rank superior ou outros cultivadores da alma. Ative técnicas de dano direto sem se mover e ataque diretamente a alma de um inimigo dentro do alcance do grau da técnica, mudando o dano para Psíquico. Criaturas sem cultivo da alma perdem PV máximo e atual ao sofrer dano Psíquico (recuperáveis ao fim de um descanso longo)."
  },
  {
    level: 2, name: "Primeira Revolução da Alma",
    description: "Permite manifestar um espírito de batalha (forma da sua arma favorita). Sempre que realizar uma jogada de ataque contra um inimigo, causa 3 de dano Psíquico adicional em criaturas com nível de cultivo da alma menor que o seu. Recebe 3 de dano adicional a cada 2 níveis de cultivo da alma."
  },
  {
    level: 3, name: "Segunda Revolução da Alma",
    description: "Sua alma recebe grande resiliência. Recebe +1 em Espírito e Sabedoria, e 30 PV temporários reduzidos apenas por dano sofrido na alma (10 adicionais a cada nova revolução). Recuperados ao fim de um descanso longo."
  },
  {
    level: 4, name: "Terceira Revolução da Alma",
    description: "Grande potencial defensivo. Recebe resistência 10 a dano Psíquico e de Alma, e +2 em Salvaguardas de Espírito, Sabedoria e Presença relacionadas a ataques à mente e alma."
  },
  {
    level: 5, name: "Quarta Revolução da Alma",
    description: "Passa a causar dano de Alma em criaturas inimigas — destruição da própria existência, com Penetração 5. Qualquer dano de Alma causado é retirado dos PV máximos do alvo, recuperáveis apenas ao fim de um descanso longo e apenas 10 de cada vez."
  },
  {
    level: 6, name: "Quinta Revolução da Alma",
    description: "Controle e resiliência tão grandes que pode criar um avatar adicional para controlar um clone de forma perfeita ou colocá-lo no mar espiritual de uma criatura voluntária (ou de, no mínimo, 2 ranks menor que seu nível da alma). Enquanto o avatar existir, sobrevive mesmo que o corpo original morra, mas não pode cultivar até obter um novo corpo. Apenas 1 avatar a cada 10 anos, e só com alma intacta e corpo presente."
  },
  {
    level: 7, name: "Sexta Revolução da Alma",
    description: "Pode enviar seu avatar para dentro da alma de uma criatura e travar uma batalha da alma. Poder e energia do avatar de ambos é definido pelo nível de cultivo da alma: PV 50 por nível, Qi 40 por nível. Habilidades usam-se normalmente, mas Integridade da Alma = PV e Energia Espiritual = Qi acima. Todo dano dentro da batalha converte-se em dano de Alma."
  },
  {
    level: 8, name: "Sétima Revolução da Alma",
    description: "Absorve energia espiritual do mundo para nutrir corpo e alma, com precisão extrema. Multiplica sua velocidade de Absorção de PEQ por 3 e reduz a CD de criações e similares de todas as profissões em -5."
  },
  {
    level: 9, name: "Oitava Revolução da Alma",
    description: "A alma é difícil de ferir. No início de cada turno, recupera 20 PV máximos perdidos por dano de Alma. Recebe +4 Pontos de Atributos distribuídos entre Espírito, Sabedoria e Presença (máx. 30)."
  },
  {
    level: 10, name: "Nona Revolução da Alma — Alma Imortal",
    description: "A alma existe de forma independente sem perder poder; todo Qi e Vitalidade ficam preservados nela. Ao morrer, a alma sobrevive com os PV e Qi do último descanso longo realizado. Pode realizar descansos longos e funcionar como se tivesse corpo até criar um novo."
  }
];
