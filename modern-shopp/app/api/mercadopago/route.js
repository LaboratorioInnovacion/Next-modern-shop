import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { items, payer } = await req.json();
    const preference = {
      items: items.map(item => ({
        title: item.name,
        quantity: item.quantity,
        currency_id: 'ARS',
        unit_price: Number(item.price)
      })),
      payer,
      back_urls: {
        success: process.env.NEXT_PUBLIC_URL + '/checkout/confirmacion',
        failure: process.env.NEXT_PUBLIC_URL + '/checkout/error',
        pending: process.env.NEXT_PUBLIC_URL + '/checkout/pending'
      },
      auto_return: 'approved'
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Error en MercadoPago' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ init_point: data.init_point });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
