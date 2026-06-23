import express from 'express';
import cors from 'cors';
import {prisma} from "./prisma";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
    res.json({ ok: true });
});

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
            name: name
        }
    });

    res.json(updated);
});