// ✅ API: /api/products/route.js
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error); // 👈 Log para debug
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    // Desestructuramos y normalizamos images
    let { images, ...rest } = body;
    if (typeof images === 'string') {
      images = images.split(',').map(url => url.trim()).filter(Boolean);
    }
    const product = await prisma.product.create({
      data: {
        ...rest,
        images: Array.isArray(images) ? images : [],
      }
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const product = await prisma.product.create({
//       data: body
//     });
//     return NextResponse.json(product, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
//   }
// }
