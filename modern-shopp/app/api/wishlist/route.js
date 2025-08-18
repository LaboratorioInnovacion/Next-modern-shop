import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
    })
    return NextResponse.json(wishlist.map(item => item.product), { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Error fetching wishlist" }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id
  const { productId } = await req.json()
  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 })
  }
  try {
    await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    })
    return NextResponse.json({ message: "Product added to wishlist" }, { status: 201 })
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Already in wishlist" }, { status: 200 })
    }
    return NextResponse.json({ error: "Error adding to wishlist" }, { status: 500 })
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id
  const { productId } = await req.json()
  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 })
  }
  try {
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })
    return NextResponse.json({ message: "Product removed from wishlist" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Error removing from wishlist" }, { status: 500 })
  }
}

// // ✅ /app/api/wishlist/route.js
// import { prisma } from '@/lib/db';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { NextResponse } from 'next/server';

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const wishlist = await prisma.wishlist.findMany({
//     where: { userId: session.user.id },
//     include: { product: true },
//   });

//   return NextResponse.json(wishlist);
// }

// export async function POST(req) {
//   const session = await getServerSession(authOptions);
//   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const { productId } = await req.json();

//   const exists = await prisma.wishlist.findFirst({
//     where: { userId: session.user.id, productId },
//   });

//   if (exists) {
//     return NextResponse.json({ error: 'Ya está en wishlist' }, { status: 409 });
//   }

//   const item = await prisma.wishlist.create({
//     data: {
//       userId: session.user.id,
//       productId,
//     },
//   });

//   return NextResponse.json(item, { status: 201 });
// }

// export async function DELETE(req) {
//   const session = await getServerSession(authOptions);
//   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const { productId } = await req.json();

//   await prisma.wishlist.deleteMany({
//     where: { userId: session.user.id, productId },
//   });

//   return NextResponse.json({ success: true });
// }
