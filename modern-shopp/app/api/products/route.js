// ✅ API: /api/products/route.js
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    console.log('Products fetched successfully:', products.length); // 👈 Log para debug
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error); // 👈 Log para debug
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req) {
  let bodyText;
  try {
    bodyText = await req.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Body recibido no es JSON válido:', bodyText);
      return NextResponse.json({ error: 'Body no es JSON válido' }, { status: 400 });
    }
    // Desestructuramos y normalizamos images
    let { images, ...rest } = body;
    if (typeof images === 'string') {
      images = images.split(',').map(url => url.trim()).filter(Boolean);
    }
    const dataToInsert = {
      ...rest,
      images: Array.isArray(images) ? images : [],
    };
    console.log('Intentando insertar producto con data:', dataToInsert);
    try {
      const product = await prisma.product.create({
        data: dataToInsert
      });
      return NextResponse.json(product, { status: 201 });
    } catch (prismaError) {
      console.error('Error de Prisma al crear producto:', prismaError);
      return NextResponse.json({ error: 'Failed to create product', prisma: prismaError.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error inesperado creando producto:', error, 'Body recibido:', bodyText);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

