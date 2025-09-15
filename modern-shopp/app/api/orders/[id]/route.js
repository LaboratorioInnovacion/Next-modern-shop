import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Falta el parámetro id' }, { status: 400 });
  }
  // Buscar por externalReference
  const order = await prisma.order.findUnique({
    where: { externalReference: id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true
    }
  });
  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
  }
  return NextResponse.json(order);
}
