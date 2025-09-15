// app/api/products/slug/[slug]/route.js
import { prisma } from "../../../../lib/db";


export async function GET(req, { params }) {
  const { slug } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
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
    console.error('[GET PRODUCT BY SLUG]', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}
