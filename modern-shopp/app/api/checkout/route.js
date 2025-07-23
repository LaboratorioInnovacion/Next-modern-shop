import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const address = await prisma.address.create({
    data: {
      ...body,
      userId: session.user.id,
    },
  });

  return NextResponse.json(address, { status: 201 });
}

// // Guardar shipping + billing info en la sesión o temporalmente
// export async function POST(req) {
//   const body = await req.json();
//   // Validar con Zod más adelante

//   // Aquí podrías guardar temporalmente en sesión, Redis, o BDD
//   return Response.json({ success: true, data: body });
// }
