// POST /api/addresses - Crear dirección para usuario autenticado
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/db';
import { NextResponse } from 'next/server';

// POST para crear dirección asociada al usuario autenticado

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const userId = session.user.id;
  const data = await req.json();
  try {
    const address = await prisma.address.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json([], { status: 200 });
  const addresses = await prisma.address.findMany({ where: { userId } });
  return NextResponse.json(addresses);
}

// export async function POST(req) {
//   const data = await req.json();
//   const address = await prisma.address.create({ data });
//   return NextResponse.json(address, { status: 201 });
// }

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
