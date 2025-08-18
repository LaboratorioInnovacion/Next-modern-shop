import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json([], { status: 200 });
  const addresses = await prisma.address.findMany({ where: { userId } });
  return NextResponse.json(addresses);
}

export async function POST(req) {
  const data = await req.json();
  const address = await prisma.address.create({ data });
  return NextResponse.json(address, { status: 201 });
}

export async function PUT(req) {
  const { id, ...data } = await req.json();
  const address = await prisma.address.update({ where: { id }, data });
  return NextResponse.json(address);
}

export async function DELETE(req) {
  const { id } = await req.json();
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
