import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic = 'Kehidupan Sehari-hari', level = 'SD/SMP', count = 6 } = req.body;

    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY present, will use curated pedagogical packs'
      });
    }

    const prompt = `Anda adalah ahli bahasa dan guru Bahasa Indonesia spesialis materi struktur kalimat S-P-O-K (Subjek, Predikat, Objek, Keterangan).
Buat ${count} soal kuis bervariasi dengan tema "${topic}" untuk tingkat "${level}".
WAJIB mencakup format-format berikut:
1. PG (Pilihan Ganda 4 opsi): PG | Soal | Opsi1 | Opsi2 | Opsi3 | Opsi4 | Nomor Benar (1-4) | Bobot (100)
2. CB (Checkbox pilihan ganda lebih dari 1 benar): CB | Soal (misal: cari semua subjek/objek) | Opsi1 | Opsi2 | Opsi3 | Opsi4 | Kunci Benar (misal: 1,2) | Bobot (150)
3. BS (Benar atau Salah): BS | Pernyataan tentang fungsi kata S/P/O/K | B atau S | Bobot (100)
4. SK (Susun Kata acak jadi kalimat padu): SK | Susun kata menjadi kalimat S-P-O-K yang tepat: | Kalimat lengkap yang baku dan tepat | Bobot (150)
5. ES (Esai / Isian singkat): ES | Pertanyaan meminta kata kunci (misal: Sebutkan objek dari kalimat...) | kata kunci | Bobot (100)

ATURAN KETAT:
- Tuliskan HANYA baris-baris soal dengan format pipa (|) di atas.
- Jangan tambahkan nomor baris, tanda kutip ekstra, markdown code block backticks (\`\`\`), atau teks pengantar/penutup apa pun.
- Setiap baris harus satu soal mandiri yang valid.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const generatedText = response.text || '';
    // Clean up code block ticks if any
    const cleanLines = generatedText
      .replace(/^```[a-z]*\n?/gm, '')
      .replace(/```$/gm, '')
      .trim();

    return res.json({
      success: true,
      rawQuestions: cleanLines
    });
  } catch (error: any) {
    console.error('Gemini generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal menghasilkan soal dengan AI'
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
