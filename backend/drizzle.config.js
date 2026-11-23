import { defineConfig } from 'drizzle-kit';

// Opcional: "npm run db:studio" abre uma tela para ver o banco no navegador
export default defineConfig({ dialect: 'sqlite', schema: './schema.js', dbCredentials: { url: 'file:fichas.db' } });
