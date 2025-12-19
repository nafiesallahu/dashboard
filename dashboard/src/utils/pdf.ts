function escapePdfText(value: string) {
  // Escape backslashes and parens for PDF literal strings.
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function toText(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}


export function buildTablePdf<T extends Record<string, unknown>>(input: {
  title: string;
  columns: Array<{
    key: keyof T;
    header: string;
   
    width?: number;
    align?: 'left' | 'center' | 'right';
  }>;
  rows: T[];
}): Uint8Array {
  // This is a deliberately lightweight PDF generator implemented directly with
  // PDF objects/content streams (no external PDF dependency).
  const pageW = 595; 
  const pageH = 842;

  const marginX = 40;
  const marginTop = 46;
  const marginBottom = 40;

  const fontSizeTitle = 16;
  const fontSize = 10;
  const fontSizeHeader = 11;
  const lineH = 14;
  const cellPadding = 5;
  const borderWidth = 0.5;

  const usableW = pageW - marginX * 2;

  function normalizeCol(c: (typeof input.columns)[number]) {
    const key = String(c.key).toLowerCase();
    const header = c.header.toLowerCase();

    const width =
      c.width ??
      (key.includes('email') || header.includes('email')
        ? 2.8
        : key.includes('name') || header.includes('name')
          ? 2.2
          : key.includes('country') || header.includes('country')
            ? 1.0
            : key.includes('status') || header.includes('status')
              ? 0.9
              : key.includes('sales') || header.includes('sales') || key.includes('amount')
                ? 0.8
                : 1);

    const align: 'left' | 'center' | 'right' =
      c.align ??
      (key.includes('sales') || header.includes('sales') || key.includes('amount')
        ? 'right'
        : key.includes('country') || header.includes('country') || key.includes('status') || header.includes('status')
          ? 'center'
          : 'left');

    return { ...c, width, align };
  }

  const columns = input.columns.map(normalizeCol);
  const colWeights = columns.map((c) => Math.max(0.1, c.width ?? 1));
  const totalWeight = Math.max(0.1, colWeights.reduce((a, b) => a + b, 0));
  const colWs = colWeights.map((w) => (usableW * w) / totalWeight);
  const colXs = colWs.reduce<number[]>(
    (xs, w) => {
      xs.push(xs[xs.length - 1] + w);
      return xs;
    },
    [marginX],
  ); 

  const lines: string[] = [];
  const pushLine = (s: string) => lines.push(s);

  const pages: string[] = [];

  function startPage() {
    lines.length = 0;
    pushLine('BT');
    pushLine('/F1 ' + fontSize + ' Tf');
    pushLine('0 0 0 rg');
  }

  function endPage() {
    pushLine('ET');
    pages.push(lines.join('\n'));
  }

  function textAt(x: number, y: number, text: string, sizeOverride?: number) {
    const safe = escapePdfText(text);
    if (sizeOverride) pushLine(`/F1 ${sizeOverride} Tf`);
    pushLine(`${x.toFixed(2)} ${y.toFixed(2)} Td (${safe}) Tj`);
    if (sizeOverride) pushLine(`/F1 ${fontSize} Tf`);
  }

  function drawRect(x: number, y: number, w: number, h: number, fill?: string) {
    pushLine('ET'); 
    pushLine(`${borderWidth} w`); 
    if (fill) {
      pushLine(fill + ' rg'); 
      pushLine(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
      pushLine('0 0 0 rg'); 
    }
    pushLine('0 0 0 RG');
    pushLine(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`); 
    pushLine('BT'); 
    pushLine(`/F1 ${fontSize} Tf`);
  }

  function wrapCellText(text: string, maxChars: number) {
    if (text.length <= maxChars) return [text];

    const out: string[] = [];
    let rest = text;

    // Prefer breaking on "nice" delimiters for common fields (email, names, URLs).
    const breakChars = new Set([' ', '/', '-', '_', '@', '.']);
    while (rest.length > maxChars) {
      let cut = maxChars;
      for (let j = maxChars; j >= Math.max(1, Math.floor(maxChars * 0.55)); j -= 1) {
        const ch = rest[j - 1];
        if (breakChars.has(ch)) {
          cut = j;
          break;
        }
      }

      const headRaw = rest.slice(0, cut);
      const tailRaw = rest.slice(cut);

      const head = headRaw.endsWith(' ') ? headRaw.trimEnd() : headRaw;
      const tail = headRaw.endsWith(' ') ? tailRaw.trimStart() : tailRaw;

      out.push(head);
      rest = tail;
    }

    if (rest.length) out.push(rest);
    return out;
  }

  const maxCharsPerCol = colWs.map((w) => Math.max(8, Math.floor((w / fontSize) * 1.8)));

  function estimateTextW(text: string, size: number) {
    return text.length * size * 0.52;
  }

  function cellTextX(opts: { colIdx: number; text: string; fontSize: number }) {
    const { colIdx, text, fontSize } = opts;
    const colLeft = colXs[colIdx];
    const w = colWs[colIdx];
    const align = columns[colIdx]?.align ?? 'left';
    if (align === 'center') {
      const tw = estimateTextW(text, fontSize);
      const x = colLeft + (w - tw) / 2;
      return Math.max(colLeft + cellPadding, x);
    }
    if (align === 'right') {
      const tw = estimateTextW(text, fontSize);
      const x = colLeft + w - cellPadding - tw;
      return Math.max(colLeft + cellPadding, x);
    }
    return colLeft + cellPadding;
  }

  function textAtBold(x: number, y: number, text: string, sizeOverride?: number) {
    pushLine('1 0 0 1 0 0 Tm');
    textAt(x, y, text, sizeOverride);
    pushLine('1 0 0 1 0 0 Tm');
    textAt(x + 0.35, y, text, sizeOverride);
  }

  function drawHeaderRow(yTop: number) {
    const headerRowH = lineH + cellPadding * 2;
    const headerY = yTop - headerRowH;

    drawRect(marginX, headerY, usableW, headerRowH, '0.92 0.92 0.92');

    pushLine('ET');
    pushLine(`${borderWidth} w`);
    pushLine('0 0 0 RG');
    for (let c = 1; c < columns.length; c += 1) {
      const x = colXs[c];
      pushLine(`${x.toFixed(2)} ${headerY.toFixed(2)} m ${x.toFixed(2)} ${(headerY + headerRowH).toFixed(2)} l S`);
    }
    pushLine('BT');
    pushLine(`/F1 ${fontSize} Tf`);

    for (let c = 0; c < columns.length; c += 1) {
      const col = columns[c];
      const x = cellTextX({ colIdx: c, text: col.header, fontSize: fontSizeHeader });
      const textY = headerY + cellPadding + fontSizeHeader;
      textAtBold(x, textY, col.header, fontSizeHeader);
    }

    return { headerY, headerRowH };
  }

  startPage();
  let y = pageH - marginTop;

  pushLine('1 0 0 1 0 0 Tm'); 
  textAt(marginX, y, input.title, fontSizeTitle);
  y -= lineH * 2.2;

  const firstHeader = drawHeaderRow(y);
  y = firstHeader.headerY;

  function ensureRoom(linesNeeded: number) {
    const minY = marginBottom + linesNeeded * lineH;
    if (y < minY) {
      endPage();
      startPage();
      y = pageH - marginTop;
      const hdr = drawHeaderRow(y);
      y = hdr.headerY;
    }
  }

  for (const row of input.rows) {
    const wrapped = columns.map((col, idx) =>
      wrapCellText(toText(row[col.key]), maxCharsPerCol[idx] ?? 12),
    );
    const rowLines = Math.max(1, ...wrapped.map((w) => w.length));
    const rowH = rowLines * lineH + cellPadding * 2;

    ensureRoom(Math.ceil(rowH / lineH) + 1);

    const rowY = y - rowH;
    drawRect(marginX, rowY, usableW, rowH);
    
    pushLine('ET');
    pushLine(`${borderWidth} w`);
    pushLine('0 0 0 RG');
    for (let c = 1; c < columns.length; c += 1) {
      const x = colXs[c];
      pushLine(`${x.toFixed(2)} ${rowY.toFixed(2)} m ${x.toFixed(2)} ${(rowY + rowH).toFixed(2)} l S`);
    }
    pushLine('BT');
    pushLine(`/F1 ${fontSize} Tf`);

    for (let l = 0; l < rowLines; l += 1) {
      pushLine('1 0 0 1 0 0 Tm');
      for (let c = 0; c < columns.length; c += 1) {
        const textY = rowY + cellPadding + fontSize + (rowLines - 1 - l) * lineH;
        const cellLine = wrapped[c][l] ?? '';
        const cellX = cellTextX({ colIdx: c, text: cellLine, fontSize });
        pushLine('1 0 0 1 0 0 Tm');
        textAt(cellX, textY, cellLine);
      }
    }
    y = rowY;
  }

  endPage();

  const objects: string[] = [];
  const offsets: number[] = [];

  const addObj = (body: string) => {
    objects.push(body);
  };

  addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  const pageObjects: Array<{ page: string; content: string }> = pages.map((contentStream) => {
    const stream = contentStream;
    const len = new TextEncoder().encode(stream).length;
    return {
      content: `<< /Length ${len} >>\nstream\n${stream}\nendstream`,
      page: '', 
    };
  });

  const firstPageObjId = 4; 
  const pageCount = pageObjects.length;
  const pageObjIds = Array.from({ length: pageCount }, (_, i) => firstPageObjId + i * 2);
  const contentObjIds = Array.from({ length: pageCount }, (_, i) => firstPageObjId + i * 2 + 1);

  const kids = pageObjIds.map((id) => `${id} 0 R`).join(' ');
  const pagesObj = `<< /Type /Pages /Count ${pageCount} /Kids [ ${kids} ] >>`;

  const catalogObj = `<< /Type /Catalog /Pages 2 0 R >>`;

  const allObjects: string[] = [];
  allObjects[0] = catalogObj; 
  allObjects[1] = pagesObj; 
  allObjects[2] = objects[0]; 

  for (let i = 0; i < pageCount; i += 1) {
    const pageObj = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjIds[i]} 0 R >>`;
    allObjects[pageObjIds[i] - 1] = pageObj;
    allObjects[contentObjIds[i] - 1] = pageObjects[i].content;
  }

  let out = '%PDF-1.3\n';

  for (let i = 0; i < allObjects.length; i += 1) {
    const objBody = allObjects[i];
    if (!objBody) continue;
    offsets[i + 1] = new TextEncoder().encode(out).length;
    out += `${i + 1} 0 obj\n${objBody}\nendobj\n`;
  }

  const xrefStart = new TextEncoder().encode(out).length;
  const maxObj = allObjects.length;
  out += `xref\n0 ${maxObj + 1}\n`;
  out += `0000000000 65535 f \n`;
  for (let i = 1; i <= maxObj; i += 1) {
    const off = offsets[i] ?? 0;
    out += `${String(off).padStart(10, '0')} 00000 n \n`;
  }

  out += `trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new TextEncoder().encode(out);
}

export function downloadPdf(filename: string, bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


