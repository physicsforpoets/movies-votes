import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, logoUrl } = req.body;
  try {
    const service = await prisma.service.create({ data: { name, logoUrl } });
    res.status(200).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router
