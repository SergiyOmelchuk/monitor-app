import express from 'express';
import cors from 'cors';
import {prisma} from "./prisma";

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173'
    })
);
app.use(express.json());

app.get('/health', (_, res) => {
    res.json({ ok: true });
});

app.listen(3000, () => {
    console.log('Server started');
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

app.post('/toggle', async (_, res) => {
    const current = await prisma.toggleState.findUnique({
        where: { id: 1 }
    });

    const updated = await prisma.toggleState.update({
        where: { id: 1 },

        data: {
            active: !current?.active
        }
    });

    res.json(updated);
});