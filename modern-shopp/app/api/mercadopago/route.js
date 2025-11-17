// Endpoint para crear una preferencia de pago en MercadoPago
// Este endpoint recibe los datos del carrito y del comprador desde el frontend,
// crea una preferencia de pago usando la API de MercadoPago y devuelve la URL (init_point)
// para redirigir al usuario a la pasarela de pago.
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import crypto from 'crypto';

async function trySendOrderEmail(toEmail, subject, html) {
  try {
    // Require nodemailer dynamically so server still runs if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.warn('SMTP no configurado: email de confirmación no enviado');
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const from = process.env.SMTP_FROM || user;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      html,
    });
    console.log('Email enviado a', toEmail);
  } catch (err) {
    console.error('Error enviando email de orden:', err && err.message ? err.message : err);
  }
}
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// POST /api/mercadopago
// Espera: { items: [{ productId, quantity }], payer: { email, ... } }
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const payload = await req.json();
    const clientItems = Array.isArray(payload.items) ? payload.items : [];
    const payer = payload.payer || (session?.user ? { email: session.user.email, name: session.user.name } : null);
    const shippingAddress = payload.shippingAddress || null;
    const billingAddress = payload.billingAddress || shippingAddress || null;

    // If no session and no payer email provided, or no shipping address, reject
    if (!session?.user && (!payer || !payer.email)) {
      return NextResponse.json({ error: 'Debe proporcionar un email de contacto para guest checkout' }, { status: 400 });
    }
    if (!shippingAddress) {
      return NextResponse.json({ error: 'Debe proporcionar una dirección de envío' }, { status: 400 });
    }

    if (!clientItems.length) {
      return NextResponse.json({ error: 'Items inválidos' }, { status: 400 });
    }

    // 1) Obtener productos desde la BD usando los productId enviados
    const productIds = clientItems.map(i => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    // 2) Construir items y calcular totales en servidor (ignorar precios enviados por el cliente)
    let subtotal = 0;
    const mpItems = clientItems.map(({ productId, quantity }) => {
      const p = productMap[productId];
      if (!p) throw new Error('Producto no encontrado: ' + productId);
      const unit_price = Number(p.price || 0);
      const qty = Number(quantity || 1);
      const itemTotal = unit_price * qty;
      subtotal += itemTotal;
      return {
        title: p.name,
        quantity: qty,
        currency_id: 'ARS',
        unit_price: parseFloat(unit_price.toFixed(2)),
      };
    });

    // 3) Reglas básicas de impuestos/envío (ajusta según tu lógica)
    const tax = parseFloat((subtotal * 0.0).toFixed(2));
    // Envío fijo solicitado: 9500 (moneda ARS)
    const shipping = 9500;
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    // 4) Crear orden PENDING en la BD (con orderItems) y generar viewToken para invitados
    const viewToken = crypto.randomBytes(16).toString('hex');
    const order = await prisma.order.create({
      data: {
        // Si hay sesión asociada, conectamos la relación user.
        // No usamos userId directamente porque el cliente Prisma espera la forma anidada `user: { connect: { id } }`.
        ...(session?.user?.id ? { user: { connect: { id: session.user.id } } } : {}),
        status: 'PENDING',
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: 'mercadopago',
        paymentStatus: 'PENDING',
        // Guarda detalle de items en la relación OrderItem (no usar campo `items` aquí si está indefinido)
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        viewToken,
        items: {
          create: clientItems.map(({ productId, quantity }) => ({
            productId,
            quantity: Number(quantity || 1),
            price: Number(productMap[productId]?.price || 0),
          })),
        },
      },
    });

    // 5) Crear preferencia en MercadoPago usando el id de la orden como external_reference
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
      return NextResponse.json({ error: 'MERCADOPAGO_ACCESS_TOKEN no configurado' }, { status: 500 });
    }

    // Añadimos un ítem de envío para que MercadoPago muestre correctamente el costo
    if (shipping && shipping > 0) {
      mpItems.push({
        title: 'Envío',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: parseFloat(Number(shipping).toFixed(2)),
      });
    }

    const preference = {
      items: mpItems,
      payer,
      back_urls: {
        success: (process.env.NEXT_PUBLIC_URL || '') + '/checkout/confirmacion',
        failure: (process.env.NEXT_PUBLIC_URL || '') + '/checkout/error',
        pending: (process.env.NEXT_PUBLIC_URL || '') + '/checkout/pending',
      },
      auto_return: 'approved',
      external_reference: order.id,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();
    if (!response.ok) {
      // marcar orden como FAILED y retornar error
      await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
      return NextResponse.json({ error: data.message || JSON.stringify(data) }, { status: 500 });
    }

    if (!data.init_point) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
      return NextResponse.json({ error: 'No se recibió init_point de MercadoPago', data }, { status: 500 });
    }

    // 6) Actualizar la orden con externalReference (order.id ya es el reference) y dejar status PENDING
    await prisma.order.update({ where: { id: order.id }, data: { externalReference: order.id } });

    // Enviar email de confirmación al payer (si hay SMTP configurado)
    try {
      const tenantUrl = process.env.NEXT_PUBLIC_URL || '';
      // const tenantUrl ='http://localhost:3000';
      const orderLink = `${tenantUrl}/checkout/confirmacion?id=${order.id}&token=${viewToken}`;
      const html = `
        <p>Gracias por tu pedido.</p>
        <p>Tu número de pedido es <strong>${order.id}</strong>.</p>
        <p>Puedes ver el estado y los detalles aquí: <a href="${orderLink}">${orderLink}</a></p>
        <p>Si no realizaste esta compra, contacta con soporte.</p>
      `;
      if (payer && payer.email) {
        // fire-and-forget, no bloqueamos el flujo de pago
        trySendOrderEmail(payer.email, `Confirmación de pedido ${order.id}`, html);
      }
    } catch (err) {
      console.error('Error preparando email de confirmación:', err);
    }

    // Devolver también el viewToken para que el frontend pueda mostrarlo o enviarlo por email
    return NextResponse.json({ init_point: data.init_point, preference_id: data.id, orderId: order.id, viewToken });
  } catch (error) {
    console.error('Error en /api/mercadopago:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

