# LA FARM DEL GAS deploy

Полная инструкция для деплоя через Git на VPS:

[GIT_VPS_DEPLOY_RU.md](./GIT_VPS_DEPLOY_RU.md)

Краткая схема:

```txt
lafarmdelgas.com -> VPS Nginx 80/443 -> 127.0.0.1:49173 -> Docker web -> Docker backend
```

Основные файлы:

```txt
docker-compose.yml
Dockerfile.web
Dockerfile.backend
.env.production.example
deploy/nginx/app.conf
deploy/nginx/lafarmdelgas.com.http.conf
deploy/nginx/lafarmdelgas.com.ssl.conf
```

На VPS проект ожидается в:

```txt
/opt/lafarmdelgas
```

Данные админки и загрузки хранятся на VPS:

```txt
server/data
server/uploads
```

Эти папки не коммитятся в Git и должны бэкапиться отдельно.
