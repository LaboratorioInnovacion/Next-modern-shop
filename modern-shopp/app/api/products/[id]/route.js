// app/api/products/[id]/route.js
import {prisma} from '@/lib/db.js';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        reviews: {
          include: { user: true }
        }
      }
    });

    if (!product) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error('[GET PRODUCT BY ID]', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}
