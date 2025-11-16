export default function useInvoiceDownload(orderDetails) {
  // Devuelve una función que descarga la factura.
  // Intenta primero pedir al endpoint server-side; si responde 404, intenta generar PDF en cliente usando jspdf.
  async function downloadInvoice() {
    try {
      const id = orderDetails?.id;
      if (!id) return alert('ID de orden no disponible');
      const token = new URLSearchParams(window.location.search).get('token');
      const downloadUrl = `/api/orders/${id}/invoice${token ? `?token=${token}` : ''}`;

      const res = await fetch(downloadUrl);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      // Si no existe en servidor, intentar fallback cliente
      if (res.status === 404) {
        // Intentar generar PDF con jspdf
        try {
          const { jsPDF } = await import('jspdf');
          const doc = new jsPDF();
          doc.setFontSize(16);
          doc.text('Factura / Pedido', 14, 20);
          doc.setFontSize(12);
          doc.text(`Número de pedido: ${id}`, 14, 34);
          if (orderDetails?.createdAt) {
            doc.text(`Fecha: ${new Date(orderDetails.createdAt).toLocaleDateString('es-ES')}`, 14, 42);
          }
          doc.text('Items:', 14, 56);
          const items = orderDetails?.items || [];
          let y = 64;
          if (items.length === 0 && orderDetails?.subtotal) {
            // If no items list available, include subtotal/total
            doc.text(`Subtotal: ${orderDetails.subtotal}`, 14, y);
            y += 8;
            doc.text(`Total: ${orderDetails.total}`, 14, y);
          } else {
            items.forEach((it, idx) => {
              const line = `${idx + 1}. ${it.name || it.productId || ''} — ${it.quantity || 1} x ${it.price || ''}`;
              doc.text(line, 14, y);
              y += 8;
              if (y > 270) {
                doc.addPage();
                y = 20;
              }
            });
          }
          doc.save(`factura-${id}.pdf`);
          return;
        } catch (e) {
          console.warn('jspdf no instalado o fallo al generar PDF cliente:', e);
          alert('La factura no está disponible en el servidor y no se pudo generar localmente. Instala `jspdf` con `npm i jspdf` para habilitar generación local.');
          return;
        }
      }

      // Otros errores del servidor
      const err = await res.json().catch(() => null);
      alert(err?.error || 'No se pudo generar la factura');
    } catch (e) {
      console.error('Error descargando/creando factura:', e);
      alert('Error descargando la factura');
    }
  }

  return downloadInvoice;
}
