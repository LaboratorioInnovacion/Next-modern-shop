// app/api/products/[id]/route.js
// import { prisma } from "@/lib/db";
import { prisma } from "../../../../lib/db";
export async function GET(req, { params }) {
  let { id } = params;
  // Convierte el id a string si el modelo lo requiere
  if (typeof id !== 'string') id = String(id);

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        orderItems: true,
        wishlists: true,
        // Si tienes relación con reviews y user, descomenta:
        // reviews: { include: { user: true } },
      },
    });

    if (!product) {
      return new Response(JSON.stringify({ error: "Producto no encontrado" }), {
        status: 404,
      });
    }

    return Response.json(product);
  } catch (error) {
    console.error("[GET PRODUCT BY ID]", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 }
    );
  }
}
