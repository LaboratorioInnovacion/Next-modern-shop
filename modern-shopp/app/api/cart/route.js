// ✅ API: /api/cart/route.js
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  let items = [];
  if (cart && cart.items) {
    try {
      items = JSON.parse(cart.items);
    } catch {
      items = [];
    }
  }
  return NextResponse.json(items);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, quantity } = await req.json();
  let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });

  if (!cart) {
    await prisma.cart.create({
      data: {
        userId: session.user.id,
        items: JSON.stringify([{ productId, quantity }])
      }
    });
  } else {
    let items = [];
    try {
      items = JSON.parse(cart.items);
    } catch {
      items = [];
    }
    const idx = items.findIndex(item => item.productId === productId);
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }
    await prisma.cart.update({
      where: { userId: session.user.id },
      data: { items: JSON.stringify(items) }
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return NextResponse.json({ error: 'No cart found' }, { status: 404 });
  let items = [];
  try {
    items = JSON.parse(cart.items);
  } catch {
    items = [];
  }
  if (body.clearAll) {
    items = [];
  } else if (body.productId) {
    items = items.filter(item => item.productId !== body.productId);
  }
  await prisma.cart.update({
    where: { userId: session.user.id },
    data: { items: JSON.stringify(items) }
  });
  return NextResponse.json({ success: true });
}
