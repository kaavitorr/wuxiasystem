/**
 * ─── Conceitos Elementais (Wuxia) ────────────────────────────────────────────
 * 13 elementos organizados em 3 raridades. Cada elemento pode ser treinado até
 * o nível 10; cada nível concede resistência a um (ou mais) tipos de dano,
 * somada automaticamente em system.traits.resistance (ver prepareDerivedData).
 *
 * O personagem pode desbloquear até CONCEITOS_MAX_ELEMENTOS (9) elementos.
 *
 * Custo de treino por nível: base de NEN_LEVEL_COSTS (mesma tabela do Nen),
 * aplicando multiplicadores por raridade:
 *   - Básico:        sem adicional
 *   - Intermediário: +2 CD, +5×Nível Qi, ×2 dias
 *   - Avançado:      varia por elemento (ver `adicionais` em cada entrada)
 */
import { NEN_LEVEL_COSTS } from "./nen-categories-data.mjs";

export const CONCEITOS_MAX_ELEMENTOS = 9;

/**
 * @typedef {Object} ElementoConceito
 * @property {string} id            Identificador (chave no mapping `conceitos`).
 * @property {string} label         Nome de exibição.
 * @property {"basico"|"intermediario"|"avancado"} raridade
 * @property {string} cor           Cor temática (hex).
 * @property {string} icon          Caminho do ícone.
 * @property {Object<number>} resistencia  Map { tipoDeDano: pontosPorNivel }.
 * @property {{cdAdd?:number, qiAdd?:(lvl:number)=>number, qiMult?:number, diasMult?:number}} adicionais
 *   Multiplicadores/adicionais de custo por raridade. Para Intermediário o padrão
 *   é { cdAdd:2, qiAdd:(l)=>5*l, diasMult:2 }. Avançado é por-elemento.
 */

/** @type {ElementoConceito[]} */
export const CONCEITOS_ELEMENTOS = [
  // ── BÁSICOS ──
  { id: "madeira",  label: "Madeira",   raridade: "basico",   cor: "#4a7c3a", icon: "systems/wuxia-system/icons/svg/conceitos/madeira.svg",
    resistencia: { acid: 3 } },
  { id: "fogo",     label: "Fogo",      raridade: "basico",   cor: "#e8521f", icon: "systems/wuxia-system/icons/svg/conceitos/fogo.svg",
    resistencia: { fire: 3 } },
  { id: "terra",    label: "Terra",     raridade: "basico",   cor: "#a0732a", icon: "systems/wuxia-system/icons/svg/conceitos/terra.svg",
    resistencia: { bludgeoning: 3 } },
  { id: "metal",    label: "Metal",     raridade: "basico",   cor: "#9aa4b0", icon: "systems/wuxia-system/icons/svg/conceitos/metal.svg",
    resistencia: { slashing: 2, piercing: 2 } },
  { id: "agua",     label: "Água",      raridade: "basico",   cor: "#2e86c1", icon: "systems/wuxia-system/icons/svg/conceitos/agua.svg",
    resistencia: { bludgeoning: 2 } },

  // ── INTERMEDIÁRIOS ── (+2 CD, +5×Nível Qi, ×2 dias)
  { id: "relampago", label: "Relâmpago", raridade: "intermediario", cor: "#9b59d0", icon: "systems/wuxia-system/icons/svg/conceitos/relampago.svg",
    resistencia: { lightning: 3 } },
  { id: "vento",     label: "Vento",     raridade: "intermediario", cor: "#85c1e9", icon: "systems/wuxia-system/icons/svg/conceitos/vento.svg",
    resistencia: { thunder: 3 } },
  { id: "gelo",      label: "Gelo",      raridade: "intermediario", cor: "#5dade2", icon: "systems/wuxia-system/icons/svg/conceitos/gelo.svg",
    resistencia: { cold: 3 } },
  { id: "ilusao",    label: "Ilusão",    raridade: "intermediario", cor: "#bb8fce", icon: "systems/wuxia-system/icons/svg/conceitos/ilusao.svg",
    resistencia: { psychic: 3 } },

  // ── AVANÇADOS ── (multiplicadores por-elemento, ver `adicionais`)
  { id: "luz",      label: "Luz",       raridade: "avancado", cor: "#f4d03f", icon: "systems/wuxia-system/icons/svg/conceitos/luz.svg",
    resistencia: { radiant: 3 },
    adicionais: { cdAdd: 3, qiMult: 2, diasMult: 3 } },
  { id: "escuridao", label: "Escuridão", raridade: "avancado", cor: "#4a3a6a", icon: "systems/wuxia-system/icons/svg/conceitos/escuridao.svg",
    resistencia: { corrosion: 3 },
    adicionais: { cdAdd: 3, qiMult: 2, diasMult: 3 } },
  { id: "tempo",    label: "Tempo",     raridade: "avancado", cor: "#7d8c98", icon: "systems/wuxia-system/icons/svg/conceitos/tempo.svg",
    resistencia: { slashing: 2, piercing: 2, bludgeoning: 2 },
    adicionais: { cdAdd: 6, qiMult: 3, diasMult: 3 } },
  { id: "espaco",   label: "Espaço",    raridade: "avancado", cor: "#5d6d7e", icon: "systems/wuxia-system/icons/svg/conceitos/espaco.svg",
    resistencia: { slashing: 2, piercing: 2, bludgeoning: 2 },
    adicionais: { cdAdd: 6, qiMult: 3, diasMult: 3 } },
];

/** Mapa id → elemento, p/ lookup rápido. */
export const CONCEITO_POR_ID = Object.fromEntries(CONCEITOS_ELEMENTOS.map(e => [e.id, e]));

/**
 * Multiplicadores/adicionais de custo por raridade (padrão; entradas avançadas
 * sobrescrevem via campo `adicionais`).
 */
const ADICIONAIS_POR_RARIDADE = {
  basico: {},
  intermediario: { cdAdd: 2, qiAdd: lvl => 5 * lvl, diasMult: 2 },
};

/**
 * Custo final para treinar `elemento` até `nivel` (nivel-alvo, 1–10).
 * Retorna { cd, qi, dias, pt } já com multiplicadores de raridade aplicados.
 * @param {ElementoConceito|string} elemento  Elemento ou seu id.
 * @param {number} nivel                       Nível-alvo (1–10).
 * @returns {{cd:number, qi:number, dias:number, pt:number}|null}
 */
export function custoConceito(elemento, nivel) {
  const el = typeof elemento === "string" ? CONCEITO_POR_ID[elemento] : elemento;
  if ( !el ) return null;
  const base = NEN_LEVEL_COSTS[nivel];
  if ( !base ) return null;

  // Adicionais: os do elemento (avançado) vencem; senão o padrão da raridade.
  const ad = { ...(ADICIONAIS_POR_RARIDADE[el.raridade] ?? {}), ...(el.adicionais ?? {}) };

  const cd = base.cd + (ad.cdAdd ?? 0);

  // Qi: base + qiAdd(lvl) (intermediário) ou base × qiMult (avançado).
  let qi = base.pa;
  if ( typeof ad.qiAdd === "function" ) qi += ad.qiAdd(nivel);
  if ( Number.isFinite(ad.qiMult) ) qi *= ad.qiMult;

  // Dias base: nível × 3 (tabela do livro: 3,6,9,12,15,18,21,24,27,30).
  const diasBase = nivel * 3;
  const dias = diasBase * (ad.diasMult ?? 1);

  return { cd, qi: Math.round(qi), dias, pt: base.pt };
}

/**
 * Conta quantos elementos o ator já desbloqueou (unlocked: true).
 * @param {object} conceitosData  O mapping system.conceitos do ator.
 * @returns {number}
 */
export function contarDesbloqueados(conceitosData = {}) {
  return Object.values(conceitosData).filter(c => c?.unlocked).length;
}
