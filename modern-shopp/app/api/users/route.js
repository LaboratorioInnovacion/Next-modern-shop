import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// Solo para admin, ejemplo básico
export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  return NextResponse.json(users);
}

export async function PUT(req) {
  const { id, ...data } = await req.json();
  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(user);
}

export async function DELETE(req) {
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
