import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql/index.js';
import * as schema from './schema.js';

// O arquivo fichas.db fica sempre na pasta do backend
process.chdir(dirname(fileURLToPath(import.meta.url)));
const client = createClient({ url: 'file:fichas.db' });

// Cria a tabela na primeira execução (igual ao schema.js)
await client.execute(`
  CREATE TABLE IF NOT EXISTS fichas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    sistema TEXT NOT NULL DEFAULT 'Em branco',
    dados TEXT NOT NULL DEFAULT '{}',
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export const db = drizzle(client, { schema });
