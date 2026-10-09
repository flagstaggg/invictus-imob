# Deploy na VPS (Debian + Docker) — guia para iniciantes

Este guia leva o site do zero até rodar em uma VPS Debian com Docker, Nginx, PostgreSQL e HTTPS.

## 1. Preparar o servidor

1. Acesse a VPS por SSH com uma chave (não use senha):
   ```bash
   ssh -i sua-chave.pem root@IP_DA_VPS
   ```
2. Atualize o sistema e ative atualizações automáticas de segurança:
   ```bash
   apt update && apt upgrade -y
   apt install -y unattended-upgrades
   dpkg-reconfigure -plow unattended-upgrades
   ```
3. Firewall (libere só SSH, HTTP e HTTPS):
   ```bash
   apt install -y ufw
   ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
   ufw enable
   ```
4. Proteja o SSH e o servidor contra força bruta:
   ```bash
   apt install -y fail2ban
   systemctl enable --now fail2ban
   ```
   No arquivo `/etc/ssh/sshd_config`, defina `PermitRootLogin no`, `PasswordAuthentication no` e reinicie: `systemctl restart ssh`.
5. Instale o Docker:
   ```bash
   apt install -y docker.io docker-compose-v2
   systemctl enable --now docker
   ```

## 2. Subir o projeto

```bash
git clone SEU_REPO /var/www/invictus && cd /var/www/invictus
cp .env.example .env
nano .env
```

Preencha no `.env`:

```
POSTGRES_DB=invictus
POSTGRES_USER=invictus_app
POSTGRES_PASSWORD=<senha forte gerada com: openssl rand -base64 24>
DATABASE_URL=postgres://invictus_app:<mesma senha>@db:5432/invictus
COOKIE_SECRET=<outro segredo: openssl rand -hex 32>
CORS_ORIGIN=https://SEU_DOMINIO.com.br
NODE_ENV=production
```

Edite `nginx.conf` trocando `SEU_DOMINIO.com.br` pelo seu domínio e suba:

```bash
docker compose up -d --build
docker compose exec app node server/scripts/seed.js
docker compose exec app node server/scripts/create-admin.js --email=voce@empresa.com --nome="Seu Nome" --senha="senha-forte-12+"
```

O banco PostgreSQL roda em um container interno (`db`), **sem porta publicada**: só a rede do Docker alcança ele.

## 3. HTTPS (obrigatório para o login do painel)

Os cookies de sessão são `Secure`: sem HTTPS o login do painel não funciona.

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d SEU_DOMINIO.com.br -d www.SEU_DOMINIO.com.br
```

Depois troque o bloco HTTP do `nginx.conf` por HTTPS:

```nginx
server {
  listen 443 ssl;
  server_name SEU_DOMINIO.com.br;
  ssl_certificate /etc/letsencrypt/live/SEU_DOMINIO.com.br/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/SEU_DOMINIO.com.br/privkey.pem;
  location /.well-known/acme-challenge/ { root /var/www/certbot; }
  location / {
    proxy_pass http://app:3333;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    client_max_body_size 25m;
  }
}
```

Adicione ao `docker-compose.yml` um serviço `certbot` (imagem `certbot/certbot`) e renove semanalmente no cron:
`0 3 * * 1 docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload`.

## 4. Backups do banco e das fotos

```bash
chmod +x server/scripts/backup.sh
crontab -e
# 0 3 * * * PGPASSWORD=<senha> PGUSER=invictus_app PGDATABASE=invictus PGHOST=localhost /var/www/invictus/server/scripts/backup.sh
```

O script usa `pg_dump` (formato custom, comprimido) e um `.tar.gz` das fotos, guardando 14 dias em `/var/backups/invictus`.

Para restaurar:

```bash
PGPASSWORD=<senha> pg_restore -h localhost -U invictus_app -d invictus --clean --if-exists /var/backups/invictus/invictus-AAAA-MM-DD.dump
tar -xzf /var/backups/invictus/uploads-AAAA-MM-DD.tar.gz -C /var/www/invictus
```

## 5. Checklist de segurança antes de ir ao ar

- [ ] UFW ativo liberando apenas 22/80/443
- [ ] SSH só com chave, root desabilitado, fail2ban ativo
- [ ] `POSTGRES_PASSWORD` e `COOKIE_SECRET` fortes e fora do git
- [ ] `CORS_ORIGIN` com o domínio real (HTTPS)
- [ ] HTTPS ativo e renovação do certificado no cron
- [ ] Container do Postgres sem portas publicadas
- [ ] Testes: login com senha errada 10× (bloqueio), upload de `.exe` (recusado), `/api/admin/imoveis` sem sessão (401), descrição com `<script>` (sanitizado)