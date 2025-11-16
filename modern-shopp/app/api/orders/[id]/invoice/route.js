import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { PassThrough } from 'stream';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    // Buscar la orden con sus items y productos
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Validación simple: requerir viewToken en query para acceder a la factura
    if (!token || token !== order.viewToken) {
      return NextResponse.json({ error: 'Token inválido o no proporcionado' }, { status: 403 });
    }

    // Intentar requerir pdfkit dinámicamente
    let PDFDocument;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PDFDocument = require('pdfkit');
    } catch (e) {
      return NextResponse.json({ error: 'La dependencia `pdfkit` no está instalada. Ejecuta `npm i pdfkit`.' }, { status: 500 });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = new PassThrough();
    doc.pipe(stream);

    // Encabezado
    doc.fontSize(18).text('Factura / Pedido', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Número de pedido: ${order.id}`);
    doc.text(`Fecha: ${order.createdAt.toISOString().split('T')[0]}`);
    doc.moveDown();

    // Datos de envío
    doc.fontSize(12).text('Dirección de envío:');
    try {
      const sa = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
      if (sa) {
        doc.text(`${sa.firstName || ''} ${sa.lastName || ''}`);
        doc.text(`${sa.address || ''}`);
        doc.text(`${sa.city || ''} ${sa.zipCode || ''}`);
        doc.text(`${sa.country || ''}`);
      }
    } catch (e) {
      // ignore
    }
    doc.moveDown();

    // Tabla de items
    doc.fontSize(12).text('Items:');
    doc.moveDown(0.5);
    const tableTop = doc.y;
    order.items.forEach((it, idx) => {
      const productName = it.product?.name || it.productId;
      const line = `${idx + 1}. ${productName} — ${it.quantity} x ${it.price.toFixed(2)}`;
      doc.text(line);
    });
    doc.moveDown();

    doc.text(`Subtotal: ${order.subtotal.toFixed(2)}`);
    doc.text(`Envío: ${order.shipping.toFixed(2)}`);
    doc.text(`Impuestos: ${order.tax.toFixed(2)}`);
    doc.moveDown();
    doc.fontSize(14).text(`Total: ${order.total.toFixed(2)}`);

    doc.end();

    const filename = `factura-${order.id}.pdf`;
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Error generando factura PDF:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
