# Deploy na VPS (Debian + Docker) — guia para iniciantes

Este guia leva o site do zero até rodar em uma VPS Debian com Docker, Nginx e HTTPS.

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
nano .env   # preencha COOKIE_SECRET com uma string aleatória longa
```

Edite `nginx.conf` trocando `SEU_DOMINIO.com.br` pelo seu domínio.

```bash
docker compose up -d --build
docker compose exec app node server/scripts/seed.js
docker compose exec app node server/scripts/create-admin.js --email=voce@empresa.com --nome="Seu Nome" --senha="senha-forte-12+"
```

## 3. HTTPS (obrigatório para o login do painel)

Os cookies de sessão são `Secure`: sem HTTPS o login do painel não funciona.

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d SEU_DOMINIO.com.br -d www.SEU_DOMINIO.com.br
```

Depois edite `nginx.conf` trocando o bloco HTTP pelo HTTPS:

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

Adicione ao `docker-compose.yml` um serviço certbot (imagem `certbot/certbot`) e renove com cron: `0 3 * * 1 docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload`.

No `.env`, ajuste `CORS_ORIGIN=https://SEU_DOMINIO.com.br` e reinicie: `docker compose up -d`.

## 4. Backups

```bash
chmod +x server/scripts/backup.sh
crontab -e
# adicione: 0 3 * * * /var/www/invictus/server/scripts/backup.sh
```

Para restaurar: copie `invictus-AAAA-MM-DD.db` de volta para `data/invictus.db` e extraia `uploads-AAAA-MM-DD.tar.gz`.

## 5. O que revisar manualmente

- [ ] UFW ativo liberando apenas 22/80/443
- [ ] SSH só com chave, root desabilitado, fail2ban ativo
- [ ] `.env` com COOKIE_SECRET forte (não commite)
- [ ] HTTPS ativo e renovação do certificado no cron
- [ ] No banco e nas pastas, apenas o usuário da aplicação tem acesso
- [ ] Testar: login com senha errada 10× (deve bloquear), upload de arquivo `.exe` (deve recusar), acesso a `/api/admin/imoveis` sem login (deve dar 401)
