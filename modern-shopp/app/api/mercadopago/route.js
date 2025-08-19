// Endpoint para crear una preferencia de pago en MercadoPago
// Este endpoint recibe los datos del carrito y del comprador desde el frontend,
// crea una preferencia de pago usando la API de MercadoPago y devuelve la URL (init_point)
// para redirigir al usuario a la pasarela de pago.
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // 1. Recibe los datos del frontend (items del carrito y datos del comprador)
    const { items, payer } = await req.json();

  // 2. Verifica el valor de la variable de entorno para depuración
  console.log('Valor de process.env.NEXT_PUBLIC_URL:', process.env.NEXT_PUBLIC_URL);
  // 3. Construye la preferencia de pago para MercadoPago
    //    - items: productos a pagar
    //    - payer: datos del comprador (email, etc.)
    //    - back_urls: URLs a donde MercadoPago redirige según el resultado
    //    - auto_return: retorna automáticamente si el pago es aprobado
    //    - currency_id: moneda (debe ser válida para tu cuenta)
    console.log('Preferencia enviada a MercadoPago:', JSON.stringify({ items, payer }, null, 2));
    const preference = {
      items: items.map(item => ({
        title: item.name,
        quantity: item.quantity,
        currency_id: 'ARS', // ¡IMPORTANTE! Solo monedas válidas para tu cuenta
        unit_price: Number(item.price)
      })),
      payer,
      back_urls: {
        success: process.env.NEXT_PUBLIC_URL + '/checkout/confirmacion', // Pago exitoso
        failure: process.env.NEXT_PUBLIC_URL + '/checkout/error',       // Pago fallido
        pending: process.env.NEXT_PUBLIC_URL + '/checkout/pending'      // Pago pendiente
      },
    };
    console.log('Objeto preference enviado a MercadoPago:', preference);

    // 3. Llama a la API de MercadoPago para crear la preferencia
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` // Token de tu cuenta MP
      },
      body: JSON.stringify(preference)
    });

    // 4. Si hay error, lo muestra y responde con error
    if (!response.ok) {
      const error = await response.json();
      console.error('Error de MercadoPago:', error); // Log para depuración
      return NextResponse.json({ error: error.message || JSON.stringify(error) || 'Error en MercadoPago' }, { status: 500 });
    }

    // 5. Si todo va bien, responde con el init_point (URL de pago)
    const data = await response.json();
    console.log('Respuesta de MercadoPago:', data); // Log para depuración
    if (!data.init_point) {
      return NextResponse.json({ error: 'No se recibió init_point de MercadoPago', data }, { status: 500 });
    }
    // Devolver también el preference_id (data.id) para el frontend
    return NextResponse.json({ init_point: data.init_point, preference_id: data.id });
  } catch (error) {
    // 6. Manejo de errores generales
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
