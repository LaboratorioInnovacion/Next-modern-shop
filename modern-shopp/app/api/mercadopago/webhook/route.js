
// Endpoint para recibir notificaciones (webhooks) de MercadoPago
// MercadoPago envía notificaciones a este endpoint cuando cambia el estado de un pago u otro evento.
// Sirve para actualizar el estado de la orden en tu base de datos aunque el usuario cierre la ventana.
// Documentación oficial: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/webhooks


import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';


// POST: MercadoPago envía notificaciones de eventos de pago
export async function POST(req) {
  try {
    // 1. MercadoPago envía los datos en el body (puede ser JSON o x-www-form-urlencoded)
    //    Aquí intentamos parsear como JSON, si falla, body será null
    const body = await req.json().catch(() => null);

    // 2. También puede enviar datos por query params (topic, id, etc.)
    //    Ejemplo:
    //    const { searchParams } = new URL(req.url);
    //    const topic = searchParams.get('topic');
    //    const id = searchParams.get('id');

    // 3. Log para depuración: muestra todo lo recibido
    console.log('Webhook MercadoPago recibido:', body);

    // 4. Si la notificación es de un pago, consulta el estado del pago a la API de MercadoPago
    //    Esto es importante porque el webhook puede llegar antes que el usuario vuelva a tu web
    if (body && (body.type === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated')) {
      // El ID del pago puede venir en diferentes formatos
      const paymentId = body.data && body.data.id ? body.data.id : body['data.id'];
      if (paymentId) {
        // Consulta el pago a la API de MercadoPago para obtener el estado actualizado
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
          }
        });
        const payment = await mpRes.json();
        console.log('Detalle del pago consultado:', payment);

        // Actualiza la orden en la base de datos según el external_reference y el status del pago
        if (payment.external_reference) {
          try {
            await prisma.order.update({
              where: { externalReference: payment.external_reference },
              data: {
                paymentStatus: payment.status,
                trackingNumber: payment.id ? payment.id.toString() : undefined,
                status: payment.status === 'approved' ? 'COMPLETED' : 'PENDING',
              },
            });
            console.log('Orden actualizada correctamente:', payment.external_reference, payment.status);
          } catch (err) {
            console.error('Error actualizando la orden en la base de datos:', err);
          }
        } else {
          console.warn('No se encontró external_reference en el pago, no se puede actualizar la orden.');
        }
      }
    }

    // 5. Siempre responde 200 para que MercadoPago no reintente el webhook
    return NextResponse.json({ received: true });
  } catch (error) {
    // 6. Si hay error, lo loguea y responde 500
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



////////codigo anterior

// Endpoint para recibir notificaciones (webhooks) de MercadoPago
// MercadoPago envía notificaciones a este endpoint cuando cambia el estado de un pago u otro evento.
// Sirve para actualizar el estado de la orden en tu base de datos aunque el usuario cierre la ventana.
// Documentación oficial: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/webhooks


// import { NextResponse } from 'next/server';


// // POST: MercadoPago envía notificaciones de eventos de pago
// export async function POST(req) {
//   try {
//     // 1. MercadoPago envía los datos en el body (puede ser JSON o x-www-form-urlencoded)
//     //    Aquí intentamos parsear como JSON, si falla, body será null
//     const body = await req.json().catch(() => null);

//     // 2. También puede enviar datos por query params (topic, id, etc.)
//     //    Ejemplo:
//     //    const { searchParams } = new URL(req.url);
//     //    const topic = searchParams.get('topic');
//     //    const id = searchParams.get('id');

//     // 3. Log para depuración: muestra todo lo recibido
//     console.log('Webhook MercadoPago recibido:', body);

//     // 4. Si la notificación es de un pago, consulta el estado del pago a la API de MercadoPago
//     //    Esto es importante porque el webhook puede llegar antes que el usuario vuelva a tu web
//     if (body && (body.type === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated')) {
//       // El ID del pago puede venir en diferentes formatos
//       const paymentId = body.data && body.data.id ? body.data.id : body['data.id'];
//       if (paymentId) {
//         // Consulta el pago a la API de MercadoPago para obtener el estado actualizado
//         const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
//           headers: {
//             'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
//           }
//         });
//         const payment = await mpRes.json();
//         console.log('Detalle del pago consultado:', payment);

//         // Aquí deberías actualizar la orden en tu base de datos según el payment.external_reference o payment.status
//         // Por ejemplo, podrías marcar la orden como pagada, rechazada, pendiente, etc.
//         // Ejemplo (pseudocódigo):
//         // await prisma.order.update({
//         //   where: { externalId: payment.external_reference },
//         //   data: { paymentStatus: payment.status, mpPaymentId: payment.id }
//         // });
//       }
//     }

//     // 5. Siempre responde 200 para que MercadoPago no reintente el webhook
//     return NextResponse.json({ received: true });
//   } catch (error) {
//     // 6. Si hay error, lo loguea y responde 500
//     console.error('Error en webhook MercadoPago:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

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
