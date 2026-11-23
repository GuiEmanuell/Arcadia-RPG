import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Tabela "fichas". Barras, atributos, habilidades, magias, itens e notas
// ficam dentro da coluna "dados" (JSON), assim o usuário pode criar campos livres.
export const fichas = sqliteTable('fichas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  sistema: text('sistema').notNull().default('Em branco'),
  dados: text('dados', { mode: 'json' }).notNull(),
  criado_em: text('criado_em').notNull().default(sql`(datetime('now'))`),
  atualizado_em: text('atualizado_em').notNull().default(sql`(datetime('now'))`),
});
