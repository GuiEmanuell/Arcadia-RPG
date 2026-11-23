import { uid } from './catalog';

// ---------- helpers ----------
const sg = (n) => (n >= 0 ? '+' : '') + n;
const inteiro = (v, min, max, def) => {
  const n = Math.floor(Number(v));
  return Number.isNaN(n) ? def : Math.min(Math.max(n, min), max);
};
const modD = (v) => Math.floor((v - 10) / 2); // modificador do D&D
const P = (nome, attr, extra) => ({ id: uid(), nome, attr, treino: 0, outros: 0, ...extra });
const lista = (pares) => () => pares.map(([n, a, e]) => P(n, a, e));
const SEIS = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
const VERM = '#E0675F', AZUL = '#5B8DEF', ROXO = '#A78BFA';

// ---------- listas de perícias (atributo-chave entre aspas) ----------
const DND = [['Acrobacia','DES'],['Adestrar Animais','SAB'],['Arcanismo','INT'],['Atletismo','FOR'],['Atuação','CAR'],['Enganação','CAR'],['Furtividade','DES'],['História','INT'],['Intimidação','CAR'],['Intuição','SAB'],['Investigação','INT'],['Medicina','SAB'],['Natureza','INT'],['Percepção','SAB'],['Persuasão','CAR'],['Prestidigitação','DES'],['Religião','INT'],['Sobrevivência','SAB']];
const T20 = [['Acrobacia','DES'],['Adestramento','CAR'],['Atletismo','FOR'],['Atuação','CAR'],['Cavalgar','DES'],['Conhecimento','INT'],['Cura','SAB'],['Diplomacia','CAR'],['Enganação','CAR'],['Fortitude','CON'],['Furtividade','DES'],['Guerra','INT'],['Iniciativa','DES'],['Intimidação','CAR'],['Intuição','SAB'],['Investigação','INT'],['Jogatina','CAR'],['Ladinagem','DES'],['Luta','FOR'],['Misticismo','INT'],['Nobreza','INT'],['Ofício','INT'],['Percepção','SAB'],['Pilotagem','DES'],['Pontaria','DES'],['Reflexos','DES'],['Religião','SAB'],['Sobrevivência','SAB'],['Vontade','SAB']];
const OP = [['Acrobacia','AGI'],['Adestramento','PRE'],['Artes','PRE'],['Atletismo','FOR'],['Atualidades','INT'],['Ciências','INT'],['Crime','AGI'],['Diplomacia','PRE'],['Enganação','PRE'],['Fortitude','VIG'],['Furtividade','AGI'],['Iniciativa','AGI'],['Intimidação','PRE'],['Intuição','PRE'],['Investigação','INT'],['Luta','FOR'],['Medicina','INT'],['Ocultismo','INT'],['Percepção','PRE'],['Pilotagem','AGI'],['Pontaria','AGI'],['Profissão','INT'],['Reflexos','AGI'],['Religião','PRE'],['Sobrevivência','INT'],['Tática','INT'],['Tecnologia','INT'],['Vontade','PRE']];
// Call of Cthulhu 7ª ed.: [nome, '', {base em %}]
const COC = [['Antropologia',1],['Arqueologia',1],['Armas de Fogo (Pistola)',20],['Armas de Fogo (Rifle/Espingarda)',25],['Arremessar',20],['Arte/Ofício',5],['Avaliação',5],['Cavalgar',5],['Charme',15],['Chaveiro',1],['Ciência',1],['Contabilidade',5],['Crédito',0],['Direito',5],['Dirigir Automóveis',20],['Disfarce',5],['Encontrar',25],['Escalar',20],['Escutar',20],['Furtividade',20],['História',5],['Intimidação',15],['Lábia',5],['Língua (Outra)',1],['Lutar (Briga)',25],['Mecânica',10],['Medicina',1],['Mitos de Cthulhu',0],['Mundo Natural',10],['Natação',20],['Navegação',10],['Ocultismo',5],['Operar Maquinário Pesado',1],['Persuasão',10],['Pilotar',1],['Prestidigitação',10],['Primeiros Socorros',30],['Psicanálise',1],['Psicologia',10],['Rastrear',10],['Reparos Elétricos',10],['Saltar',20],['Sobrevivência',10],['Usar Bibliotecas',20]];
const cocPericias = () => [
  ...COC.map(([n, b]) => P(n, '', { base: b })),
  P('Esquiva', '', { base: 0, baseAttr: 'DES', baseDiv: 2 }),
  P('Língua (Nativa)', '', { base: 0, baseAttr: 'EDU', baseDiv: 1 }),
];

// ---------- Ordem Paranormal: [base, por nível de NEX] (conferir com o seu livro) ----------
const CLASSES_OP = {
  Combatente: { pv: [20, 4], pe: [2, 2], san: [12, 3] },
  Especialista: { pv: [16, 3], pe: [3, 3], san: [16, 4] },
  Ocultista: { pv: [12, 2], pe: [4, 4], san: [20, 5] },
};
const nivelNex = (nex) => (Number(nex) >= 99 ? 20 : inteiro(Number(nex) / 5, 1, 19, 1));
const nivelCfg = (c) => inteiro(c.nivel, 1, 20, 1);
const prof5e = (n) => 2 + Math.floor((n - 1) / 4);
const treinoT20 = (n) => (n >= 15 ? 6 : n >= 7 ? 4 : 2);

// ---------- Regras de cada sistema ----------
// barras: [nome, chaveAuto, cor, máximo inicial, atual inicial]   atributos: [chave, valor, mín, máx]
export const SISTEMAS = {
  'D&D 5e': {
    desc: 'PV automático, bônus dos atributos e 18 perícias',
    attrPadrao: 10,
    config: [
      { key: 'nivel', curto: 'Nível', label: 'Nível', type: 'number', def: 1 },
      { key: 'dado', curto: 'Dado de vida', label: 'Dado de vida da classe', type: 'choice', def: 8, options: [6, 8, 10, 12].map((n) => ({ l: `d${n}`, v: n })) },
    ],
    barras: [['PV', 'pv', VERM, 8]],
    atributos: SEIS.map((k) => [k, 10, 1, 30]),
    pericias: lista(DND),
    bonusAttr: (v) => sg(modD(v)),
    maxBarras: (a, c) => {
      const n = nivelCfg(c), d = Number(c.dado) || 8, m = modD(a.CON ?? 10);
      return { pv: Math.max(n, d + m + (n - 1) * (Math.floor(d / 2) + 1 + m)) };
    },
    treino: { tipo: 'tier', rotulos: ['—', 'Prof.', 'Esp.'] },
    pericia: (sk, av, c) => ({ texto: sg(modD(av) + (sk.treino || 0) * prof5e(nivelCfg(c)) + (sk.outros || 0)), sub: '' }),
  },
  Tormenta20: {
    desc: 'PV e PM automáticos, 6 atributos e 29 perícias',
    attrPadrao: 0,
    config: [
      { key: 'nivel', curto: 'Nível', label: 'Nível', type: 'number', def: 1 },
      { key: 'pvBase', curto: 'PV inicial', label: 'PV iniciais da classe (sem Constituição)', type: 'number', def: 12 },
      { key: 'pvNivel', curto: 'PV/nível', label: 'PV por nível da classe (sem Constituição)', type: 'number', def: 3 },
      { key: 'pmNivel', curto: 'PM/nível', label: 'PM por nível da classe', type: 'number', def: 3 },
    ],
    barras: [['PV', 'pv', VERM, 12], ['PM', 'pm', AZUL, 3]],
    atributos: SEIS.map((k) => [k, 0, -5, 20]),
    pericias: lista(T20),
    bonusAttr: (v) => sg(v),
    maxBarras: (a, c) => {
      const n = nivelCfg(c), con = a.CON ?? 0;
      return { pv: Math.max(1, (Number(c.pvBase) || 0) + con + (n - 1) * ((Number(c.pvNivel) || 0) + con)), pm: Math.max(0, n * (Number(c.pmNivel) || 0)) };
    },
    treino: { tipo: 'tier', rotulos: ['—', 'Treinada'] },
    pericia: (sk, av, c) => {
      const n = nivelCfg(c);
      return { texto: sg(Math.floor(n / 2) + av + (sk.treino ? treinoT20(n) : 0) + (sk.outros || 0)), sub: '' };
    },
  },
  'Call of Cthulhu': {
    desc: 'PV e PM automáticos, 8 características e 45 perícias',
    attrPadrao: 0,
    config: [],
    barras: [['PV', 'pv', VERM, 10], ['PM', 'pm', AZUL, 10], ['Sanidade', null, ROXO, 99, 50]],
    atributos: ['FOR', 'CON', 'TAM', 'DES', 'APA', 'INT', 'POD', 'EDU'].map((k) => [k, 50, 0, 99]),
    pericias: cocPericias,
    bonusAttr: (v) => `½ ${Math.floor(v / 2)} · ⅕ ${Math.floor(v / 5)}`,
    maxBarras: (a) => ({ pv: Math.floor(((a.CON ?? 0) + (a.TAM ?? 0)) / 10), pm: Math.floor((a.POD ?? 0) / 5) }),
    treino: { tipo: 'numero', rotulo: 'Pontos' },
    pericia: (sk, av, c, a) => {
      const base = sk.baseAttr ? Math.floor((a[sk.baseAttr] ?? 0) / (sk.baseDiv || 1)) : sk.base || 0;
      const t = Math.max(0, base + (sk.treino || 0) + (sk.outros || 0));
      return { texto: `${t}%`, sub: `½ ${Math.floor(t / 2)} · ⅕ ${Math.floor(t / 5)}` };
    },
  },
  'Ordem Paranormal': {
    desc: 'PV, PE e Sanidade automáticos por classe e NEX, 28 perícias',
    attrPadrao: 0,
    config: [
      { key: 'classe', curto: 'Classe', label: 'Classe', type: 'choice', def: 'Combatente', options: Object.keys(CLASSES_OP).map((n) => ({ l: n, v: n })) },
      { key: 'nex', curto: 'NEX', label: 'NEX (%): 5, 10, 15 ... 95, 99', type: 'number', def: 5 },
    ],
    barras: [['PV', 'pv', VERM, 21], ['PE', 'pe', AZUL, 3], ['SAN', 'san', ROXO, 12]],
    atributos: ['AGI', 'FOR', 'INT', 'PRE', 'VIG'].map((k) => [k, 1, 0, 5]),
    pericias: lista(OP),
    bonusAttr: (v) => (v <= 0 ? '2d20 (menor)' : `${v}d20`),
    maxBarras: (a, c) => {
      const t = CLASSES_OP[c.classe] || CLASSES_OP.Combatente, n = nivelNex(c.nex), vig = a.VIG ?? 0, pre = a.PRE ?? 0;
      return {
        pv: t.pv[0] + vig + (n - 1) * (t.pv[1] + vig),
        pe: t.pe[0] + pre + (n - 1) * (t.pe[1] + pre),
        san: t.san[0] + (n - 1) * t.san[1],
      };
    },
    treino: { tipo: 'tier', rotulos: ['Destreinado', 'Treinado', 'Veterano', 'Expert'], valores: [0, 5, 10, 15] },
    pericia: (sk, av, c) => {
      const t = [0, 5, 10, 15][sk.treino || 0] + (sk.outros || 0);
      return { texto: sg(t), sub: sk.attr ? (av <= 0 ? '2d20 (menor)' : `${av}d20`) : '' };
    },
  },
  'Em branco': {
    desc: 'Só uma barra de vida. Monte o resto do seu jeito',
    attrPadrao: 0,
    config: [],
    barras: [['Vida', null, VERM, 10]],
    atributos: [],
    pericias: () => [],
    bonusAttr: null,
    maxBarras: null,
    treino: { tipo: 'numero', rotulo: 'Treino' },
    pericia: (sk) => ({ texto: sg((sk.treino || 0) + (sk.outros || 0)), sub: '' }),
  },
};

export const mapaAtributos = (atributos = []) => Object.fromEntries(atributos.map((a) => [a.chave || a.nome, a.valor]));

// Recalcula o máximo das barras "automáticas" a partir dos atributos e da configuração.
// Se a barra estava cheia, continua cheia; senão, o valor atual só é limitado ao novo máximo.
export function aplicarRegras(d, sistema) {
  const S = SISTEMAS[sistema];
  if (!S || !S.maxBarras) return d;
  const maxes = S.maxBarras(mapaAtributos(d.atributos), d.config || {});
  const barras = (d.barras || []).map((b) => {
    if (!b.auto || b.manual || maxes[b.auto] === undefined) return b;
    const max = Math.max(b.min, Math.floor(maxes[b.auto]));
    if (max === b.max) return b;
    const atual = b.atual >= b.max ? max : Math.min(b.atual, max);
    return { ...b, max, atual: Math.max(b.min, atual) };
  });
  return { ...d, barras };
}

export function criarDados(sistema) {
  const S = SISTEMAS[sistema];
  return aplicarRegras(
    {
      barras: S.barras.map(([nome, auto, cor, max, atual]) => ({ id: uid(), nome, ...(auto ? { auto } : {}), min: 0, max, atual: atual ?? max, cor })),
      atributos: S.atributos.map(([k, v, mn, mx]) => ({ id: uid(), nome: k, chave: k, valor: v, min: mn, max: mx })),
      pericias: S.pericias(),
      habilidades: [], magias: [], itens: [], notas: '',
      config: Object.fromEntries(S.config.map((f) => [f.key, f.def])),
    },
    sistema
  );
}

// Fichas criadas antes desta versão: adiciona perícias, configuração e vínculos automáticos
export function migrar(d, sistema) {
  const S = SISTEMAS[sistema];
  if (!S) return d;
  const chaves = S.atributos.map((x) => x[0]);
  const autos = Object.fromEntries(S.barras.filter((b) => b[1]).map((b) => [b[0], b[1]]));
  return aplicarRegras(
    {
      ...d,
      config: { ...Object.fromEntries(S.config.map((f) => [f.key, f.def])), ...(d.config || {}) },
      atributos: (d.atributos || []).map((a) => (!a.chave && chaves.includes(a.nome) ? { ...a, chave: a.nome } : a)),
      barras: (d.barras || []).map((b) => (!b.auto && autos[b.nome] && b.manual === undefined ? { ...b, auto: autos[b.nome] } : b)),
      pericias: d.pericias || S.pericias(),
    },
    sistema
  );
}

export function calcPericia(sistema, sk, a, c = {}) {
  const S = SISTEMAS[sistema] || SISTEMAS['Em branco'];
  const av = sk.attr ? a[sk.attr] ?? S.attrPadrao : S.attrPadrao;
  return S.pericia(sk, av, c, a);
}

export const resumoConfig = (S, cfg = {}) =>
  S.config.map((f) => { const v = cfg[f.key] ?? f.def; const o = f.options?.find((x) => x.v === v); return `${f.curto}: ${o ? o.l : v}`; }).join(' · ');
