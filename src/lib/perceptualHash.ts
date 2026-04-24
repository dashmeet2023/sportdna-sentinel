// Real perceptual fingerprinting (no external model — runs on canvas pixel data).
// Produces a 256-dimensional float embedding per frame using a DCT-inspired
// low-frequency luminance descriptor, then averages frame embeddings to a clip embedding.
// This is the same family of techniques used by pHash / Facebook PDQ.

const GRID = 16; // 16x16 = 256 dim

export function frameEmbedding(canvas: HTMLCanvasElement): Float32Array {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width: W, height: H } = canvas;
  const img = ctx.getImageData(0, 0, W, H).data;

  // Downsample to GRID x GRID by averaging luminance in cells
  const out = new Float32Array(GRID * GRID);
  const cellW = W / GRID;
  const cellH = H / GRID;
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      let sum = 0, n = 0;
      const x0 = Math.floor(gx * cellW);
      const x1 = Math.floor((gx + 1) * cellW);
      const y0 = Math.floor(gy * cellH);
      const y1 = Math.floor((gy + 1) * cellH);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          // ITU-R BT.601 luminance
          const Y = 0.299 * img[i] + 0.587 * img[i + 1] + 0.114 * img[i + 2];
          sum += Y; n++;
        }
      }
      out[gy * GRID + gx] = n ? sum / n : 0;
    }
  }

  // Center on mean (removes overall brightness — robust to exposure shifts)
  let mean = 0;
  for (let i = 0; i < out.length; i++) mean += out[i];
  mean /= out.length;
  for (let i = 0; i < out.length; i++) out[i] -= mean;

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < out.length; i++) norm += out[i] * out[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < out.length; i++) out[i] /= norm;

  return out;
}

export function averageEmbeddings(frames: Float32Array[]): Float32Array {
  if (frames.length === 0) return new Float32Array(GRID * GRID);
  const dim = frames[0].length;
  const out = new Float32Array(dim);
  for (const f of frames) for (let i = 0; i < dim; i++) out[i] += f[i];
  for (let i = 0; i < dim; i++) out[i] /= frames.length;
  // re-normalize
  let n = 0;
  for (let i = 0; i < dim; i++) n += out[i] * out[i];
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < dim; i++) out[i] /= n;
  return out;
}

export function embeddingToHex(emb: Float32Array): string {
  // Quantize each dim to 4 bits → 256 dims = 128 hex chars. We truncate to 48 for display.
  const buf = new Uint8Array(Math.ceil(emb.length / 2));
  for (let i = 0; i < emb.length; i++) {
    const q = Math.max(0, Math.min(15, Math.round((emb[i] + 0.25) * 30)));
    if (i % 2 === 0) buf[i >> 1] = (q << 4);
    else buf[i >> 1] |= q;
  }
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function cosine(a: Float32Array, b: Float32Array): number {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d ? dot / d : 0;
}

export function packEmbedding(emb: Float32Array): string {
  // Base64-encode the float buffer for storage in localStorage / network.
  const bytes = new Uint8Array(emb.buffer.slice(0));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function unpackEmbedding(b64: string): Float32Array {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Float32Array(bytes.buffer);
  } catch {
    return new Float32Array(0);
  }
}
