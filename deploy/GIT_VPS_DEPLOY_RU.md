# Полный деплой LA FARM DEL GAS через Git на VPS

Инструкция рассчитана на новичка. Ниже шаги от создания репозитория до запуска сайта на домене `lafarmdelgas.com`.

Целевая схема:

```txt
Пользователь -> lafarmdelgas.com -> VPS Nginx 80/443 -> Docker 127.0.0.1:49173 -> web container -> backend container
```

Внутри Docker:

```txt
web:     Nginx + собранный React/Vite сайт
backend: Node.js API на 8787
```

Проект занимает только локальный порт VPS `127.0.0.1:49173`, поэтому он не должен конфликтовать с другими проектами на сервере.

## 0. Что должно быть заранее

Нужно иметь:

- VPS с Ubuntu 22.04 или 24.04.
- Доступ к VPS по SSH.
- Домен `lafarmdelgas.com`.
- Аккаунт GitHub.
- Проект на локальном компьютере.

В примерах ниже:

```txt
VPS_IP = IP адрес твоего VPS
GITHUB_USER = твой GitHub username
REPO_NAME = lafarmdelgas
PROJECT_PATH_ON_VPS = /opt/lafarmdelgas
APP_PORT = 49173
```

Заменяй `VPS_IP` и `GITHUB_USER` на свои значения.

## 1. Подготовка проекта локально

Открой терминал в папке проекта:

```bash
cd "LA FARM DEL GAS"
```

Проверь, что важные приватные файлы не попадут в Git. В проекте уже настроено:

```txt
.env
node_modules/
dist/
*.log
server/data/
server/uploads/
```

`server/data` и `server/uploads` не коммитим. Это живые данные сайта и загрузки из админки. На VPS они будут храниться отдельно.

Проверь сборку:

```bash
npm install
npm run build
```

Если сборка прошла, можно готовить Git.

## 2. Создание репозитория на GitHub

Открой GitHub в браузере:

```txt
https://github.com/new
```

Заполни:

```txt
Repository name: lafarmdelgas
Visibility: Private
Initialize this repository with: ничего не отмечать
```

Важно: не добавляй README, `.gitignore` и license на GitHub, потому что проект уже существует локально.

Нажми `Create repository`.

GitHub покажет адрес репозитория. Для SSH он будет выглядеть примерно так:

```txt
git@github.com:GITHUB_USER/lafarmdelgas.git
```

## 3. Первый push проекта в GitHub

В локальной папке проекта выполни:

```bash
git init
git branch -M main
git add .
git commit -m "Initial LA FARM DEL GAS deploy setup"
git remote add origin git@github.com:GITHUB_USER/lafarmdelgas.git
git push -u origin main
```

Если Git ругается на имя/email, задай их:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Потом снова:

```bash
git commit -m "Initial LA FARM DEL GAS deploy setup"
git push -u origin main
```

Если SSH на GitHub локально не настроен, можно временно использовать HTTPS:

```bash
git remote set-url origin https://github.com/GITHUB_USER/lafarmdelgas.git
git push -u origin main
```

Но для VPS ниже лучше использовать SSH Deploy Key.

## 4. Подключение к VPS

С локального компьютера:

```bash
ssh root@VPS_IP
```

Если заходишь не под root, используй своего пользователя:

```bash
ssh username@VPS_IP
```

Дальше все команды выполняются на VPS.

## 5. Базовая подготовка VPS

Обнови пакеты:

```bash
sudo apt update
sudo apt upgrade -y
```

Поставь базовые утилиты:

```bash
sudo apt install -y git curl ca-certificates gnupg nginx ufw snapd
```

Проверь Nginx:

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

В статусе должно быть `active (running)`.

## 6. Установка Docker и Docker Compose

Создай папку для ключа Docker:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
```

Добавь официальный GPG ключ Docker:

```bash
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Добавь репозиторий Docker:

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"${UBUNTU_CODENAME:-$VERSION_CODENAME}\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Установи Docker:

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Проверь:

```bash
sudo docker run hello-world
docker compose version
```

Чтобы запускать Docker без `sudo`, добавь текущего пользователя в группу `docker`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Проверь уже без `sudo`:

```bash
docker ps
```

## 7. Настройка firewall

Сначала разреши SSH, чтобы не потерять доступ:

```bash
sudo ufw allow OpenSSH
```

Разреши Nginx:

```bash
sudo ufw allow 'Nginx Full'
```

Включи firewall:

```bash
sudo ufw enable
sudo ufw status
```

Должны быть разрешены `OpenSSH` и `Nginx Full`.

Порт `49173` наружу открывать не надо. Он будет доступен только на `127.0.0.1`.

## 8. SSH Deploy Key для GitHub на VPS

На VPS создай SSH ключ:

```bash
ssh-keygen -t ed25519 -C "lafarmdelgas-vps"
```

Когда спросит путь, нажми `Enter`.

Когда спросит passphrase, можно нажать `Enter` два раза, чтобы оставить пустым.

Покажи публичный ключ:

```bash
cat ~/.ssh/id_ed25519.pub
```

Скопируй весь вывод. Он начинается с `ssh-ed25519`.

Теперь в GitHub:

```txt
Repository -> Settings -> Deploy keys -> Add deploy key
```

Заполни:

```txt
Title: lafarmdelgas-vps
Key: вставь публичный ключ
Allow write access: выключено
```

Нажми `Add key`.

На VPS проверь доступ:

```bash
ssh -T git@github.com
```

Если увидишь сообщение про успешную аутентификацию или что GitHub не дает shell access, это нормально.

## 9. Клонирование проекта на VPS

Создай папку:

```bash
sudo mkdir -p /opt/lafarmdelgas
sudo chown -R $USER:$USER /opt/lafarmdelgas
```

Клонируй репозиторий:

```bash
git clone git@github.com:GITHUB_USER/lafarmdelgas.git /opt/lafarmdelgas
```

Перейди в проект:

```bash
cd /opt/lafarmdelgas
```

Проверь файлы:

```bash
ls -la
```

Ты должен увидеть:

```txt
docker-compose.yml
Dockerfile.web
Dockerfile.backend
deploy/
server/
src/
package.json
```

## 10. Настройка `.env` на VPS

Создай `.env` из примера:

```bash
cp .env.production.example .env
```

Сгенерируй пароль для админки:

```bash
openssl rand -hex 24
```

Скопируй результат.

Открой `.env`:

```bash
nano .env
```

Пример содержимого:

```env
ADMIN_TOKEN=сюда-вставь-сгенерированный-токен
LAFARM_HOST_PORT=49173
```

Сохрани:

```txt
Ctrl + O
Enter
Ctrl + X
```

Важно:

- Логин админки: `admin`
- Пароль админки: значение `ADMIN_TOKEN`
- Если меняешь `ADMIN_TOKEN`, нужно пересобрать контейнеры через `docker compose up -d --build`.

## 11. Подготовка папок данных

Создай папки, куда backend будет писать товары, настройки, контакты и загрузки:

```bash
mkdir -p server/data server/uploads
chmod -R 755 server
```

При первом запуске backend сам создаст JSON-файлы в `server/data`.

## 12. Если нужно перенести текущие товары и загрузки с локальной машины

Этот шаг нужен, если ты уже редактировал товары, контакты, логотип или медиа через локальную админку.

Почему это отдельный шаг:

```txt
server/data
server/uploads
```

не коммитятся в Git, потому что это живые данные сайта.

Выполни на локальном компьютере из папки проекта:

```bash
scp -r server/data root@VPS_IP:/opt/lafarmdelgas/server/
scp -r server/uploads root@VPS_IP:/opt/lafarmdelgas/server/
```

Если на VPS заходишь не под root, замени `root` на своего пользователя:

```bash
scp -r server/data username@VPS_IP:/opt/lafarmdelgas/server/
scp -r server/uploads username@VPS_IP:/opt/lafarmdelgas/server/
```

После переноса на VPS проверь:

```bash
ls -la /opt/lafarmdelgas/server/data
ls -la /opt/lafarmdelgas/server/uploads
```

Если переносить нечего, просто пропусти этот шаг. Backend сам создаст стартовые данные при первом запуске.

## 13. Первый запуск Docker

Из папки проекта:

```bash
cd /opt/lafarmdelgas
docker compose up -d --build
```

Проверь контейнеры:

```bash
docker compose ps
```

Оба сервиса должны быть `running` или `healthy`:

```txt
lafarmdelgas-web
lafarmdelgas-backend
```

Проверь локально на VPS:

```bash
curl http://127.0.0.1:49173/health
curl http://127.0.0.1:49173/api/health
```

Ожидаемо:

```txt
ok
{"ok":true,"service":"la-farm-del-gas-api"}
```

Если не работает, смотри логи:

```bash
docker compose logs -f web
docker compose logs -f backend
```

## 14. DNS домена

В панели регистратора домена создай A-записи:

```txt
Type: A
Name: @
Value: VPS_IP

Type: A
Name: www
Value: VPS_IP
```

Проверить на VPS можно так:

```bash
sudo apt install -y dnsutils
dig +short lafarmdelgas.com
dig +short www.lafarmdelgas.com
```

Оба должны вернуть IP твоего VPS.

DNS может обновляться от нескольких минут до нескольких часов.

## 15. Настройка системного Nginx для домена

Скопируй HTTP-конфиг:

```bash
cd /opt/lafarmdelgas
sudo cp deploy/nginx/lafarmdelgas.com.http.conf /etc/nginx/sites-available/lafarmdelgas.com
```

Включи сайт:

```bash
sudo ln -sfn /etc/nginx/sites-available/lafarmdelgas.com /etc/nginx/sites-enabled/lafarmdelgas.com
```

Проверь Nginx:

```bash
sudo nginx -t
```

Если написано `syntax is ok` и `test is successful`, перезагрузи:

```bash
sudo systemctl reload nginx
```

Проверь сайт:

```bash
curl -I http://lafarmdelgas.com
```

В браузере открой:

```txt
http://lafarmdelgas.com
```

## 16. SSL сертификат HTTPS

Установи Certbot:

```bash
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sfn /snap/bin/certbot /usr/bin/certbot
```

Выпусти сертификат:

```bash
sudo certbot --nginx -d lafarmdelgas.com -d www.lafarmdelgas.com
```

Certbot спросит email и согласие с условиями.

После успешного выпуска проверь:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Открой:

```txt
https://lafarmdelgas.com
```

Проверь автоматическое обновление сертификата:

```bash
sudo certbot renew --dry-run
```

## 17. Как обновлять сайт после правок

На локальном компьютере:

```bash
git add .
git commit -m "Update site"
git push
```

На VPS:

```bash
cd /opt/lafarmdelgas
git pull
docker compose up -d --build
docker image prune -f
```

Проверка:

```bash
docker compose ps
curl http://127.0.0.1:49173/api/health
```

Если менял только товары/контакты через админку, `git pull` не нужен. Эти данные уже лежат на VPS в `server/data`.

## 18. Бэкап данных

Перед крупными обновлениями делай бэкап:

```bash
cd /opt/lafarmdelgas
tar -czf lafarmdelgas-backup-$(date +%F).tar.gz server/data server/uploads .env
```

Скачать бэкап с VPS на локальный компьютер:

```bash
scp root@VPS_IP:/opt/lafarmdelgas/lafarmdelgas-backup-YYYY-MM-DD.tar.gz .
```

Если заходишь не под root, замени `root` на своего пользователя.

## 19. Полезные команды

Статус контейнеров:

```bash
docker compose ps
```

Логи frontend/Nginx контейнера:

```bash
docker compose logs -f web
```

Логи backend:

```bash
docker compose logs -f backend
```

Перезапуск:

```bash
docker compose restart
```

Остановить проект:

```bash
docker compose down
```

Запустить обратно:

```bash
docker compose up -d
```

Проверить, кто занял порт:

```bash
sudo ss -tulpn | grep 49173
```

Проверить Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
```

## 20. Если порт 49173 занят

Выбери другой высокий порт, например `49231`.

В `.env`:

```env
LAFARM_HOST_PORT=49231
```

В Nginx-конфигах замени:

```txt
127.0.0.1:49173
```

на:

```txt
127.0.0.1:49231
```

Команды:

```bash
cd /opt/lafarmdelgas
nano .env
sudo nano /etc/nginx/sites-available/lafarmdelgas.com
docker compose up -d --build
sudo nginx -t
sudo systemctl reload nginx
```

## 21. Частые ошибки

### `502 Bad Gateway`

Системный Nginx не может достучаться до Docker.

Проверь:

```bash
cd /opt/lafarmdelgas
docker compose ps
curl http://127.0.0.1:49173/health
docker compose logs -f web
docker compose logs -f backend
```

### `413 Request Entity Too Large`

Файл слишком большой для Nginx.

В проектных конфигах уже стоит:

```nginx
client_max_body_size 50m;
```

Если надо больше, поменяй `50m` на `100m` в:

```txt
deploy/nginx/app.conf
/etc/nginx/sites-available/lafarmdelgas.com
```

Потом:

```bash
docker compose up -d --build
sudo nginx -t
sudo systemctl reload nginx
```

### Админка не логинится

Проверь `.env`:

```bash
cat /opt/lafarmdelgas/.env
```

Логин:

```txt
admin
```

Пароль:

```txt
значение ADMIN_TOKEN из .env
```

После изменения `ADMIN_TOKEN` обязательно:

```bash
cd /opt/lafarmdelgas
docker compose up -d --build
```

### GitHub не дает клонировать репозиторий

Проверь SSH ключ:

```bash
ssh -T git@github.com
```

Проверь, что публичный ключ добавлен именно в:

```txt
Repository -> Settings -> Deploy keys
```

Если репозиторий приватный, Deploy Key должен быть добавлен обязательно.

### Домен не открывается

Проверь DNS:

```bash
dig +short lafarmdelgas.com
dig +short www.lafarmdelgas.com
```

Проверь Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
```

Проверь firewall:

```bash
sudo ufw status
```

Должно быть разрешено:

```txt
OpenSSH
Nginx Full
```

## 22. Короткий чеклист запуска

На локальном компьютере:

```bash
git init
git branch -M main
git add .
git commit -m "Initial deploy"
git remote add origin git@github.com:GITHUB_USER/lafarmdelgas.git
git push -u origin main
```

На VPS:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates gnupg nginx ufw snapd
```

Установить Docker, добавить Deploy Key, потом:

```bash
git clone git@github.com:GITHUB_USER/lafarmdelgas.git /opt/lafarmdelgas
cd /opt/lafarmdelgas
cp .env.production.example .env
nano .env
mkdir -p server/data server/uploads
docker compose up -d --build
```

Nginx:

```bash
sudo cp deploy/nginx/lafarmdelgas.com.http.conf /etc/nginx/sites-available/lafarmdelgas.com
sudo ln -sfn /etc/nginx/sites-available/lafarmdelgas.com /etc/nginx/sites-enabled/lafarmdelgas.com
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d lafarmdelgas.com -d www.lafarmdelgas.com
```
