// Cria o primeiro administrador (sem rota pública de cadastro).
// Uso: npm run create-admin -- --email=admin@exemplo.com --nome "Admin" --senha "senha-forte-123"
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, pool, migrate } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
    const [k, ...v] = a.slice(2).split('=');
    return [k, v.join('=')];
  }),
);

const email = (args.email || '').trim().toLowerCase();
const nome = (args.nome || 'Administrador').trim();
const senha = args.senha || '';

if (!email || !email.includes('@')) { console.error('Informe --email válido'); process.exit(1); }
if (senha.length < 12) { console.error('A senha deve ter pelo menos 12 caracteres'); process.exit(1); }

await migrate();
const [existe] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
if (existe) { console.error('E-mail já cadastrado'); await pool.end(); process.exit(1); }
await db.insert(users).values({
  email,
  nome,
  senhaHash: await bcrypt.hash(senha, 12),
  role: 'admin',
  trocaSenha: true,
});
console.log(`Administrador criado: ${email} (troca de senha obrigatória no 1º acesso)`);
await pool.end();