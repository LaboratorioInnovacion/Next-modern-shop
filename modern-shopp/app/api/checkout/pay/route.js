// Procesar el pago real con MercadoPago más adelante
export async function POST(req) {
  const { paymentData } = await req.json();

  // Aquí conectarás con MercadoPago u otro gateway

  // Simular éxito por ahora
  return Response.json({
    success: true,
    transactionId: `TXN_${Date.now()}`,
    message: "Pago procesado con éxito",
  });
}
