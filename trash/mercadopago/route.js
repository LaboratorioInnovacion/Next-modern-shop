import { NextResponse } from 'next/server';
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

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

    const response = await mercadopago.preferences.create(preference);
    return NextResponse.json({ init_point: response.body.init_point });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
