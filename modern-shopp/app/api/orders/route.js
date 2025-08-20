import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true
    }
  });
  return NextResponse.json(orders);
}

export async function POST(req) {
  const data = await req.json();
  // Adaptar los items para la relación anidada de Prisma
  const { items, ...orderData } = data;
  const order = await prisma.order.create({
    data: {
      ...orderData,
      items: {
        create: items.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.price
        }))
      }
    }
  });
  return NextResponse.json(order, { status: 201 });
}

export async function PUT(req) {
  const { id, ...data } = await req.json();
  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json(order);
}

export async function DELETE(req) {
  const { id } = await req.json();
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
