// Endpoint para recibir notificaciones (webhooks) de MercadoPago
// Documentación oficial: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/webhooks

import { NextResponse } from 'next/server';

// POST: MercadoPago envía notificaciones de eventos de pago
export async function POST(req) {
  try {
    // MercadoPago envía los datos en req.body (puede ser JSON o x-www-form-urlencoded)
    const body = await req.json().catch(() => null);
    // También puede enviar los datos por query params (topic, id, etc.)
    // const { searchParams } = new URL(req.url);
    // const topic = searchParams.get('topic');
    // const id = searchParams.get('id');

    // Puedes loguear todo para depuración
    console.log('Webhook MercadoPago recibido:', body);

    // Si es un pago, consulta el estado del pago a la API de MercadoPago
    if (body && (body.type === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated')) {
      const paymentId = body.data && body.data.id ? body.data.id : body['data.id'];
      if (paymentId) {
        // Consulta el pago a la API de MercadoPago
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
          }
        });
        const payment = await mpRes.json();
        console.log('Detalle del pago consultado:', payment);

        // Aquí deberías actualizar la orden en tu base de datos según el payment.external_reference o payment.status
        // Ejemplo (pseudocódigo):
        // await prisma.order.update({
        //   where: { externalId: payment.external_reference },
        //   data: { paymentStatus: payment.status, mpPaymentId: payment.id }
        // });
      }
    }

    // Siempre responde 200 para que MercadoPago no reintente
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en webhook MercadoPago:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Otros métodos de webhook que podrías implementar en el futuro:
// export async function GET(req) {
//   // MercadoPago puede enviar notificaciones por GET (raro, pero posible)
//   // Útil para pruebas o validaciones
//   return NextResponse.json({ message: 'Webhook GET recibido' });
// }
//
// export async function PUT(req) {
//   // Si algún día necesitas actualizar recursos vía webhook
//   return NextResponse.json({ message: 'Webhook PUT recibido' });
// }
//
// export async function DELETE(req) {
//   // Si MercadoPago o tu sistema envía notificaciones de borrado
//   return NextResponse.json({ message: 'Webhook DELETE recibido' });
// }
