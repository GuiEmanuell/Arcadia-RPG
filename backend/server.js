import express from 'express';
import cors from 'cors';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from './db.js';
import { fichas } from './schema.js';
import { atualizarSchema, criarSchema, dadosSchema, idSchema } from './validation.js';

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Valida e devolve 400 com a lista de problemas
const erro400 = (res, error) =>
  res.status(400).json({
    erro: 'Dados inválidos',
    detalhes: error.issues.map((i) => ({ campo: i.path.join('.') || 'corpo', mensagem: i.message })),
  });

const lerId = (req, res) => {
  const r = idSchema.safeParse(req.params.id);
  if (!r.success) { erro400(res, r.error); return null; }
  return r.data;
};

app.get('/fichas', async (_req, res) => {
  res.json(await db.select().from(fichas).orderBy(desc(fichas.atualizado_em), desc(fichas.id)));
});

app.get('/fichas/:id', async (req, res) => {
  const id = lerId(req, res);
  if (id === null) return;
  const [ficha] = await db.select().from(fichas).where(eq(fichas.id, id));
  if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
  res.json(ficha);
});

app.post('/fichas', async (req, res) => {
  const r = criarSchema.safeParse(req.body ?? {});
  if (!r.success) return erro400(res, r.error);
  const { nome, sistema, dados } = r.data;
  const [ficha] = await db
    .insert(fichas)
    .values({ nome, sistema: sistema || 'Em branco', dados: dados ?? dadosSchema.parse({}) })
    .returning();
  res.status(201).json(ficha);
});

app.put('/fichas/:id', async (req, res) => {
  const id = lerId(req, res);
  if (id === null) return;
  const r = atualizarSchema.safeParse(req.body ?? {});
  if (!r.success) return erro400(res, r.error);
  const campos = Object.fromEntries(Object.entries(r.data).filter(([, v]) => v !== undefined && v !== ''));
  const [ficha] = await db
    .update(fichas)
    .set({ ...campos, atualizado_em: sql`datetime('now')` })
    .where(eq(fichas.id, id))
    .returning();
  if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
  res.json(ficha);
});

app.delete('/fichas/:id', async (req, res) => {
  const id = lerId(req, res);
  if (id === null) return;
  const apagadas = await db.delete(fichas).where(eq(fichas.id, id)).returning({ id: fichas.id });
  if (apagadas.length === 0) return res.status(404).json({ erro: 'Ficha não encontrada' });
  res.status(204).end();
});

app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

// Tratamento de erros: JSON quebrado, corpo grande demais e erros inesperados
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ erro: 'Corpo da requisição grande demais' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`API das fichas rodando na porta ${PORT}`));
