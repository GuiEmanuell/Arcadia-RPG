import { z } from 'zod';

const texto = (max, rotulo) =>
  z.string({ error: `${rotulo} é obrigatório` }).trim().min(1, `${rotulo} é obrigatório`).max(max, `${rotulo} deve ter no máximo ${max} caracteres`);
const numero = (rotulo) => z.number({ error: `${rotulo} deve ser um número` });

// Regra de barras e atributos: mínimo <= máximo e valor dentro do intervalo
const intervalo = (campoValor) => (o, ctx) => {
  if (o.min > o.max) {
    ctx.addIssue({ code: 'custom', path: ['min'], message: 'O mínimo não pode ser maior que o máximo' });
  } else if (o[campoValor] < o.min || o[campoValor] > o.max) {
    ctx.addIssue({ code: 'custom', path: [campoValor], message: `O valor deve ficar entre ${o.min} e ${o.max}` });
  }
};

const id = z.string().min(1).max(60);

const barra = z
  .object({ id, nome: texto(30, 'Nome da barra'), min: numero('Mínimo'), max: numero('Máximo'), atual: numero('Valor atual'), cor: z.string().max(20).optional() })
  .passthrough()
  .superRefine(intervalo('atual'));

const atributo = z
  .object({ id, nome: texto(30, 'Nome do atributo'), min: numero('Mínimo'), max: numero('Máximo'), valor: numero('Valor') })
  .passthrough()
  .superRefine(intervalo('valor'));

// Habilidades, magias e itens: só o nome é obrigatório, o resto é livre
const entrada = z.object({ id, nome: texto(60, 'Nome') }).passthrough();

export const dadosSchema = z.object({
  barras: z.array(barra).max(30, 'Máximo de 30 barras').default([]),
  atributos: z.array(atributo).max(60, 'Máximo de 60 atributos').default([]),
  habilidades: z.array(entrada).max(200).default([]),
  magias: z.array(entrada).max(200).default([]),
  itens: z.array(entrada).max(300).default([]),
  pericias: z.array(entrada).max(300, 'Máximo de 300 perícias').default([]),
  config: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  notas: z.string().max(20000, 'Notas muito longas').default(''),
});

const nome = texto(60, 'Nome');
const sistema = z.string().trim().max(40, 'Sistema deve ter no máximo 40 caracteres');

export const criarSchema = z.object({
  nome,
  sistema: sistema.optional(),
  dados: dadosSchema.optional(),
});

export const atualizarSchema = z
  .object({ nome: nome.optional(), sistema: sistema.optional(), dados: dadosSchema.optional() })
  .refine((b) => b.nome !== undefined || b.sistema !== undefined || b.dados !== undefined, { message: 'Envie ao menos um campo para atualizar' });

export const idSchema = z.coerce.number({ error: 'ID inválido' }).int('ID inválido').positive('ID inválido');
