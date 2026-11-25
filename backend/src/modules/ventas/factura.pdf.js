// Genera la factura en PDF.
import PDFDocument from 'pdfkit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../assets');
const EMPRESA = { nombre: 'HealKit Pharmacy', ubicacion: 'Siquirres, Limón, Costa Rica' };
const AZUL = '#083358';
const GRIS = '#5b7a96';
const FONDO_TABLA = '#e6f3fb';

const dinero = (valor) => '₡' + new Intl.NumberFormat('es-CR').format(Number(valor));
const dos = (n) => String(n).padStart(2, '0');
const fechaHora = (valor) => {
  const f = new Date(valor);
  return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()} ${dos(f.getHours())}:${dos(f.getMinutes())}`;
};

export function generarFacturaPdf(venta) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const partes = [];
    doc.on('data', (parte) => partes.push(parte));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);

    doc.registerFont('normal', path.join(assets, 'fonts/DejaVuSans.ttf'));
    doc.registerFont('negrita', path.join(assets, 'fonts/DejaVuSans-Bold.ttf'));

    // Encabezado
    doc.image(path.join(assets, 'healkit-logo-factura.png'), 50, 40, { width: 70 });
    doc.font('negrita').fontSize(18).fillColor(AZUL).text(EMPRESA.nombre, 135, 58, { lineBreak: false });
    doc.font('normal').fontSize(10).fillColor(GRIS).text(EMPRESA.ubicacion, 135, 82, { lineBreak: false });

    doc.font('normal').fontSize(10).fillColor(GRIS).text('Factura', 350, 48, { width: 195, align: 'right' });
    doc.font('negrita').fontSize(15).fillColor(AZUL).text(venta.numeroFactura, 350, 63, { width: 195, align: 'right' });
    doc.font('normal').fontSize(10).fillColor(GRIS).text(fechaHora(venta.fecha), 350, 84, { width: 195, align: 'right' });

    if (venta.estado === 'ANULADA') {
      doc.font('negrita').fontSize(12).fillColor('#b3261e').text('VENTA ANULADA', 350, 106, { width: 195, align: 'right', lineBreak: false });
    }

    // Cliente y pago
    let y = 150;
    doc.font('negrita').fontSize(12).fillColor(AZUL).text('Cliente', 50, y, { lineBreak: false });
    doc.font('negrita').fontSize(12).fillColor(AZUL).text('Pago', 320, y, { lineBreak: false });
    y += 20;
    doc.font('normal').fontSize(10).fillColor('#000');
    doc.text(venta.cliente ?? 'Cliente general', 50, y, { lineBreak: false });
    doc.text(venta.metodoPago.charAt(0) + venta.metodoPago.slice(1).toLowerCase(), 320, y, { lineBreak: false });
    if (venta.vendedor) doc.text(`Atendido por: ${venta.vendedor}`, 320, y + 15, { lineBreak: false });
    if (venta.identificacionCliente) { y += 15; doc.text(`Identificación: ${venta.identificacionCliente}`, 50, y, { lineBreak: false }); }
    if (venta.correoCliente) { y += 15; doc.text(venta.correoCliente, 50, y, { lineBreak: false }); }

    // Productos
    const columnas = [
      { titulo: 'Código', x: 58, ancho: 62, alinear: 'left' },
      { titulo: 'Descripción', x: 125, ancho: 215, alinear: 'left' },
      { titulo: 'Cant.', x: 340, ancho: 40, alinear: 'right' },
      { titulo: 'Precio unitario', x: 385, ancho: 80, alinear: 'right' },
      { titulo: 'Subtotal', x: 470, ancho: 70, alinear: 'right' }
    ];
    y += 40;
    doc.rect(50, y, 495, 24).fill(FONDO_TABLA);
    doc.font('negrita').fontSize(9).fillColor(AZUL);
    for (const c of columnas) doc.text(c.titulo, c.x, y + 8, { width: c.ancho, align: c.alinear, lineBreak: false });
    y += 24;

    doc.font('normal').fontSize(10).fillColor('#000');
    for (const d of venta.detalles) {
      const alto = Math.max(28, doc.heightOfString(d.nombre, { width: columnas[1].ancho }) + 18);
      if (y + alto > 740) { doc.addPage(); y = 50; }
      const valores = [d.codigo, d.nombre, String(d.cantidad), dinero(d.precioUnitario), dinero(d.subtotal)];
      columnas.forEach((c, i) => doc.text(valores[i], c.x, y + 9, { width: c.ancho, align: c.alinear }));
      y += alto;
      doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).strokeColor('#d3e4f0').stroke();
    }

    // Totales
    if (y > 650) { doc.addPage(); y = 50; }
    y += 18;
    const linea = (etiqueta, valor, fuente = 'normal', tamano = 10) => {
      doc.font(fuente).fontSize(tamano).fillColor('#000');
      doc.text(etiqueta, 340, y, { width: 100, lineBreak: false });
      doc.text(valor, 440, y, { width: 105, align: 'right', lineBreak: false });
    };
    linea('Subtotal', dinero(venta.subtotal)); y += 18;
    linea('Impuesto', dinero(venta.impuesto)); y += 22;
    doc.moveTo(340, y - 6).lineTo(545, y - 6).lineWidth(1.5).strokeColor('#d3e4f0').stroke();
    linea('Total', dinero(venta.total), 'negrita', 14);

    doc.font('normal').fontSize(9).fillColor(GRIS)
      .text('Gracias por su compra', 50, 780, { width: 495, align: 'center', lineBreak: false });

    doc.end();
  });
}
