export function printOrderReceipt(order, locale = 'si-LK') {
  if (!order) return;
  const dateStr = new Date(order.orderDate || Date.now()).toLocaleString(locale);
  const rows = (order.items || []).map((it) => {
    const name = it.product?.name || 'Item';
    const qty = it.quantity || 0;
    const price = it.price || 0;
    const total = it.total || price * qty;
    return `<tr><td style="padding:4px 0;">${name}</td><td style="text-align:right;">${qty}</td><td style="text-align:right;">${price}</td><td style="text-align:right;">${total}</td></tr>`;
  }).join('');
  const cash = order.cashAmount || (order.paymentMethod === 'cash' ? order.total : 0);
  const card = order.cardAmount || (order.paymentMethod === 'card' ? order.total : 0);
  const discount = order.discount || 0;

  const html = `<!doctype html><html><head><meta charset="utf-8" /><title>Receipt ${order.orderNumber || ''}</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, Noto Sans, Arial, sans-serif; }
    .small { font-size: 12px; }
    .center { text-align:center; }
    table { width: 100%; border-collapse: collapse; }
    th, td { font-size: 12px; }
    @media print { .no-print { display:none } }
  </style>
  </head><body>
  <div class="center"><div><strong>නිල්මිණි බේකර්ස්</strong></div><div class="small">${dateStr}</div><div class="small">Order: ${order.orderNumber || ''}</div></div>
  <hr/>
  <table>
    <thead><tr><th style="text-align:left">Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <hr/>
  <table>
    <tbody>
      <tr><td>Subtotal</td><td></td><td></td><td style="text-align:right">${order.subtotal?.toLocaleString() || order.total?.toLocaleString() || 0}</td></tr>
      <tr><td>Discount</td><td></td><td></td><td style="text-align:right">${discount.toLocaleString()}</td></tr>
      <tr><td><strong>Total</strong></td><td></td><td></td><td style="text-align:right"><strong>${order.total?.toLocaleString() || 0}</strong></td></tr>
      <tr><td>Cash</td><td></td><td></td><td style="text-align:right">${cash.toLocaleString()}</td></tr>
      <tr><td>Card</td><td></td><td></td><td style="text-align:right">${card.toLocaleString()}</td></tr>
    </tbody>
  </table>
  <div class="center small">අපෙන් ගන්නා ලද සේවයට ස්තුතියි!</div>
  <div class="center no-print" style="margin-top:8px"><button onclick="window.print()">Print</button></div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=400,height=600');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  // auto print for thermal printers
  setTimeout(() => { try { w.print(); } catch(e) {} }, 300);
}

export function exportToCsv(filename, rows) {
  if (!rows || rows.length === 0) return;
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v).replaceAll('"', '""');
    return `"${s}"`;
  };
  const headers = Object.keys(rows[0]);
  const csv = [headers.map(esc).join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


