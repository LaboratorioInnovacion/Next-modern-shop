// ✅ /app/api/wishlist/route.js
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  return NextResponse.json(wishlist);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId } = await req.json();

  const exists = await prisma.wishlist.findFirst({
    where: { userId: session.user.id, productId },
  });

  if (exists) {
    return NextResponse.json({ error: 'Ya está en wishlist' }, { status: 409 });
  }

  const item = await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      productId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId } = await req.json();

  await prisma.wishlist.deleteMany({
    where: { userId: session.user.id, productId },
  });

  return NextResponse.json({ success: true });
}
