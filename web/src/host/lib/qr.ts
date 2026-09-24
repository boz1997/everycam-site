import qrcode from 'qrcode-generator';

// QR codes for the dashboard. qrcode-generator (already a dependency of the web
// project) computes the matrix only; drawing is ours: an SVG path for the page,
// and a 1024 px PNG for printing (plan §3.2) — with the face-matching notice line
// under the code when face matching is on (face-grouping.html §7 promises guests
// an invitation and a sign; the app's cards print the same line, face.cardNotice).

export interface QrMatrix { size: number; dark: (r: number, c: number) => boolean }

export function qrMatrix(text: string): QrMatrix {
  const q = qrcode(0, 'M');
  q.addData(text);
  q.make();
  return { size: q.getModuleCount(), dark: (r, c) => q.isDark(r, c) };
}

/** One SVG path for every dark module; quiet zone of `margin` modules. */
export function qrPath(m: QrMatrix, margin = 2): { d: string; total: number } {
  let d = '';
  for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.dark(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`;
  return { d, total: m.size + margin * 2 };
}

const INK = '#1F3D2E';

/** Printable PNG: 1024 px wide, white, QR in Verde Pipona; optional caption lines. */
export async function qrPng(text: string, lines: string[] = []): Promise<Blob> {
  const m = qrMatrix(text);
  const W = 1024;
  const margin = 4; // print quiet zone
  const cell = Math.floor(W / (m.size + margin * 2));
  const qrW = cell * (m.size + margin * 2);
  const lineH = 40;
  const captionH = lines.length ? 32 + lines.length * lineH + 24 : 0;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = qrW + captionH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const off = Math.floor((W - qrW) / 2);
  ctx.fillStyle = INK;
  for (let r = 0; r < m.size; r++) {
    for (let c = 0; c < m.size; c++) {
      if (m.dark(r, c)) ctx.fillRect(off + (c + margin) * cell, (r + margin) * cell, cell, cell);
    }
  }
  if (lines.length) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? INK : '#2B2B2B';
      ctx.font = `${i === 0 ? 600 : 400} ${i === 0 ? 30 : 26}px Inter, "Helvetica Neue", Arial, sans-serif`;
      let s = line;
      while (ctx.measureText(s).width > W - 80 && s.length > 8) s = `${s.slice(0, -2)}…`;
      ctx.fillText(s, W / 2, qrW + 24 + i * lineH + lineH / 2);
    });
  }
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
  if (!blob) throw new Error('encode-failed');
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export const safeFileName = (s: string): string =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'sharecam';
