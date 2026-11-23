export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

// Sugestões rápidas (opcionais). O usuário pode sempre criar as dele.
export const SUGESTOES = {
  habilidades: [
    { nome: 'Ataque Furtivo', descricao: 'Dano extra ao atacar com vantagem.', uso: 'Uma vez por turno' },
    { nome: 'Fúria', descricao: 'Ganha bônus de dano e resistência por alguns turnos.', uso: '2x por descanso' },
    { nome: 'Visão no Escuro', descricao: 'Enxerga na penumbra até 18 m.', uso: 'Passiva' },
    { nome: 'Ataque Extra', descricao: 'Faz dois ataques na mesma ação.', uso: 'Passiva' },
  ],
  magias: [
    { nome: 'Bola de Fogo', nivel: 3, custo: '3 PM', descricao: 'Explosão em área que causa dano de fogo.' },
    { nome: 'Cura', nivel: 1, custo: '1 PM', descricao: 'Recupera pontos de vida de um aliado.' },
    { nome: 'Escudo Arcano', nivel: 1, custo: '1 PM', descricao: 'Aumenta a defesa por um turno.' },
    { nome: 'Invisibilidade', nivel: 2, custo: '2 PM', descricao: 'Torna o alvo invisível até atacar.' },
  ],
  itens: [
    { nome: 'Poção de Cura', quantidade: 1, descricao: 'Recupera vida ao beber.' },
    { nome: 'Corda (15 m)', quantidade: 1, descricao: '' },
    { nome: 'Tocha', quantidade: 3, descricao: 'Ilumina por 1 hora.' },
    { nome: 'Adaga', quantidade: 1, descricao: 'Arma leve.' },
  ],
};

// Campos de cada tipo de lista (usados pelo formulário de criar/editar)
export const CAMPOS = {
  habilidades: [
    { key: 'nome', label: 'Nome' },
    { key: 'uso', label: 'Uso (ex.: 1x por descanso)' },
    { key: 'descricao', label: 'Descrição', type: 'multiline' },
  ],
  magias: [
    { key: 'nome', label: 'Nome' },
    { key: 'nivel', label: 'Nível / círculo', type: 'number', def: '0' },
    { key: 'custo', label: 'Custo (ex.: 3 PM)' },
    { key: 'descricao', label: 'Descrição', type: 'multiline' },
  ],
  itens: [
    { key: 'nome', label: 'Nome' },
    { key: 'quantidade', label: 'Quantidade', type: 'number', def: '1' },
    { key: 'descricao', label: 'Descrição', type: 'multiline' },
  ],
};
export const TITULOS = { habilidades: 'Habilidade', magias: 'Magia', itens: 'Item' };
export const RESUMO = {
  habilidades: (x) => x.uso || '',
  magias: (x) => [x.nivel !== undefined ? `Nível ${x.nivel}` : '', x.custo].filter(Boolean).join(' · '),
  itens: (x) => `x${x.quantidade ?? 1}`,
};
