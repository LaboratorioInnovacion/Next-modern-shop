// ✅ API: /api/cart/route.js
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cart = await prisma.cart.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });
  return NextResponse.json(cart);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const item = await prisma.cart.create({
    data: {
      userId: session.user.id,
      productId: body.productId,
      quantity: body.quantity,
    },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await prisma.cart.delete({
    where: { id },
  });
  return NextResponse.json({ success: true });
}
