// Endpoint compatible con Next.js (pages/api) para MercadoPago usando require

const mercadopago = require('mercadopago');

console.log('MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN);
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.warn('⚠️  No se encontró la variable MERCADOPAGO_ACCESS_TOKEN en el entorno.');
}

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { items, payer } = req.body;
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
    return res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
