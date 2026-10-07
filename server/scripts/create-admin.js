// Cria o primeiro administrador (sem rota pública de cadastro).
// Uso: npm run create-admin -- --email admin@exemplo.com --nome "Admin" --senha "senha-forte-123"
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, migrate } from '../db/index.js';

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

migrate();
const existe = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
if (existe) { console.error('E-mail já cadastrado'); process.exit(1); }
const hash = await bcrypt.hash(senha, 12);
db.prepare(`INSERT INTO users (email, nome, senha_hash, role, trocar_senha) VALUES (?, ?, ?, 'admin', 1)`).run(email, nome, hash);
console.log(`Administrador criado: ${email} (troca de senha obrigatória no 1º acesso)`);
