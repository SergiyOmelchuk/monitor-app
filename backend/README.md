backend/
├── src/
│   ├── config/          # Конфігурація (db.js для Neon, env змінні)
│   ├── controllers/     # Логіка обробки запитів (request/response)
│   ├── routes/          # Маршрути API (Express/Fastify Router)
│   ├── models/          # SQL-запити або схеми таблиць БД
│   ├── middlewares/     # Валідація, авторизація, CORS
│   └── app.js (or index.js) # Точка входу (ініціалізація сервера)
├── .env.example         # Зразок змінних оточення (DATABASE_URL тощо)
├── .gitignore
├── package.json
└── README.md
