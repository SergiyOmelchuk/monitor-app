import express from 'express';
import cors from 'cors';
import {prisma} from "./prisma.js";
import authRoutes from "./routes/auth.routes.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Monitor API',
            version: '1.0.0',
            description: 'Документація нашого API для фронтенд-розробників',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Локальний сервер розробки',
            },
        ],
    },
    // Шлях до файлів, де ви будете описувати ендпоїнти (можна вказати окремі роути)
    apis: ['./src/docs/**/*.yml'],
};

// 2. Генерація специфікації
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// 3. Підключення UI сторінки Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/health', (_, res) => {
    res.json({ ok: true });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});

app.get('/toggle', async (_, res) => {
    let state = await prisma.toggleState.findUnique({
        where: { id: 1 }
    });

    if (!state) {
        state = await prisma.toggleState.create({
            data: {
                id: 1,
                active: false
            }
        });
    }

    res.json(state);
});

app.post('/toggle', async (req, res) => {
    const { name } = req.body;

    const current = await prisma.toggleState.findUnique({
        where: { id: 1 }
    });

    const updated = await prisma.toggleState.update({
        where: { id: 1 },

        data: {
            active: !current?.active,
            name: name ? name : 'test',
        }
    });

    res.json(updated);
});

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED:", err);
});