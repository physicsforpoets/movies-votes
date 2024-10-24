import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await prisma.user.create({ data: { username } });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
