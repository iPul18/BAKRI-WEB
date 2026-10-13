import { Question, QuestionType, SpokBreakdown } from '../types';

export const DEFAULT_RAW_QUESTIONS = `PG | Susun kata menjadi urutan S-P-O-K yang tepat: [membaca] [Ayah] [koran] [di teras] | Ayah membaca koran di teras | Membaca Ayah koran di teras | Koran membaca Ayah di teras | Di teras koran Ayah membaca | 1 | 100
PG | Susun kata menjadi kalimat logis: [menyapu] [Ibu] [halaman] [setiap pagi] | Menyapu Ibu halaman setiap pagi | Ibu menyapu halaman setiap pagi | Halaman Ibu menyapu setiap pagi | Setiap pagi halaman menyapu Ibu | 2 | 100
BS | Kata "menulis" dalam kalimat "Adik menulis surat" berfungsi sebagai predikat (P). | B | 100
CB | Pilih SEMUA kata yang berfungsi sebagai SUBJEK (S): "Ibu dan Ayah membaca buku cerita di ruang tamu." | Ibu | Ayah | membaca | ruang tamu | 1,2 | 150
SK | Susun kata menjadi kalimat S-P-O-K yang runtut: | Kakak membeli buku di toko alat tulis | 150
ES | Tuliskan kata yang berfungsi sebagai PREDIKAT dalam kalimat "Burung merpati terbang tinggi di angkasa". | terbang | 100
PG | Tentukan pola kalimat: "Dokter memeriksa pasien di rumah sakit pagi tadi." | S - P - O | S - P - K | S - P - O - K | S - P - Pel | 3 | 120
CB | Manakah bagian yang merupakan KETERANGAN (K)? "Petani menanam padi di sawah pada musim hujan." | Petani | menanam padi | di sawah | pada musim hujan | 3,4 | 150
BS | Kalimat "Kucing tidur di bawah meja" memiliki unsur Objek (O). | S | 100
SK | Susun kata menjadi kalimat yang padu: | Guru menjelaskan materi tata bahasa di depan kelas | 150
ES | Tuliskan OBJEK (O) dari kalimat "Paman memperbaiki sepeda motor di bengkel". | sepeda motor | 100
CB | Manakah kalimat yang berpola lengkap S-P-O-K? | Adik makan kue di teras | Ibu memasak rendang kemarin | Budi belajar giat | Siti mencuci piring di dapur tadi malam | 1,4 | 150
SK | Susun kata menjadi kalimat S-P-O-K yang tepat: | Kami menyanyikan lagu Indonesia Raya di lapangan sekolah | 150
BS | Dalam kalimat "Rina membelikan adiknya sepatu baru", kata "sepatu baru" adalah Objek. | B | 100
ES | Tuliskan KETERANGAN TEMPAT dari kalimat "Nelayan mencari ikan di laut luas pada malam hari". | di laut luas | 100`;

export const PRESET_THEMES: Record<string, string> = {
  'Campuran Lengkap (Default)': DEFAULT_RAW_QUESTIONS,
  'Tingkat SD (Aktivitas Sehari-hari)': `PG | Susun kata: [makan] [Adik] [roti] [pagi ini] | Adik makan roti pagi ini | Makan Adik roti pagi ini | Roti makan Adik pagi ini | Pagi ini roti makan Adik | 1 | 100
BS | Dalam kalimat "Ibu menggoreng ikan", kata "Ibu" adalah Subjek. | B | 100
CB | Pilih kata yang termasuk KETERANGAN: "Kakek minum teh hangat di teras setiap sore." | teh hangat | di teras | setiap sore | Kakek | 2,3 | 150
SK | Susun kata menjadi kalimat yang benar: | Budi meminjam pensil warna di kelas | 150
ES | Tuliskan kata kerja (Predikat) dari kalimat "Kucing itu mengejar tikus kecil". | mengejar | 100
PG | "Siti menyiram bunga di kebun." Pola kalimat tersebut adalah... | S - P - O - K | S - P - K | S - P - O | S - P | 1 | 100`,
  'Tingkat SMP (Lingkungan & Sains)': `PG | Susun kata: [mengolah] [Masyarakat] [sampah plastik] [secara mandiri] | Masyarakat mengolah sampah plastik secara mandiri | Mengolah Masyarakat sampah plastik secara mandiri | Sampah plastik mengolah Masyarakat | Secara mandiri mengolah sampah Masyarakat | 1 | 120
CB | Pilih frasa yang berfungsi sebagai OBJEK dan KETERANGAN: "Peneliti mengamati perkembangbiakan tanaman langka di laboratorium botani." | Peneliti | mengamati | perkembangbiakan tanaman langka | di laboratorium botani | 3,4 | 150
BS | Kalimat "Gunung berapi itu meletus dengan dahsyat" berpola S-P-K tanpa unsur Objek. | B | 100
SK | Susun kata menjadi kalimat ilmiah yang baku: | Siswa meneliti kadar keasaman air di sungai tercemar | 150
ES | Tuliskan PREDIKAT dalam kalimat "Pohon bakau menahan abrasi pantai setiap waktu". | menahan | 100
PG | "Pemerintah melestarikan hutan lindung di Kalimantan." Unsur Keterangannya adalah... | Pemerintah | melestarikan | hutan lindung | di Kalimantan | 4 | 100`,
  'Tingkat SMA (Kebudayaan & Sastra)': `PG | Susun kata: [mempertunjukkan] [Seniman] [tari tradisional] [di panggung megah] | Seniman mempertunjukkan tari tradisional di panggung megah | Mempertunjukkan Seniman tari tradisional di panggung megah | Tari tradisional mempertunjukkan Seniman di panggung megah | Di panggung megah tari Seniman mempertunjukkan | 1 | 150
CB | Manakah kata/frasa yang TIDAK berfungsi sebagai Predikat? "Para budayawan mendiskusikan naskah kuno nusantara di balai pustaka." | Para budayawan | mendiskusikan | naskah kuno nusantara | di balai pustaka | 1,3,4 | 150
BS | Dalam kalimat pasif "Naskah kuno diteliti oleh sejarawan", kata "Naskah kuno" menduduki posisi Subjek. | B | 100
SK | Susun kata menjadi kalimat yang padu: | Maestro melukis panorama alam Nusantara dengan cat minyak | 150
ES | Sebutkan OBJEK dari kalimat "Generasi muda melestarikan warisan leluhur melalui festival seni budaya". | warisan leluhur | 100`
};

export async function fetchAiGeneratedQuestions(
  topic: string,
  level: string,
  count: number = 6
): Promise<{ success: boolean; text: string; error?: string }> {
  try {
    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, level, count })
    });

    if (!res.ok) {
      throw new Error(`Server status ${res.status}`);
    }

    const data = await res.json();
    if (data.rawQuestions) {
      return { success: true, text: data.rawQuestions };
    }

    // If fallback flag or empty, use matching preset theme
    const fallbackPreset = PRESET_THEMES[topic] || PRESET_THEMES['Campuran Lengkap (Default)'];
    return { success: true, text: fallbackPreset };
  } catch (err: any) {
    console.warn('AI generator fallback to preset:', err);
    const fallbackPreset = PRESET_THEMES[topic] || PRESET_THEMES['Campuran Lengkap (Default)'];
    return { success: true, text: fallbackPreset };
  }
}

export function normalizeText(s: string): string {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (copy.length > 1 && copy.join(' ') === arr.join(' ')) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}

export function parseQuestions(text: string): Question[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));
  const questions: Question[] = [];

  lines.forEach((line, index) => {
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length === 0) return;

    const firstUpper = (parts[0] || '').toUpperCase();
    const isTyped = ['PG', 'CB', 'BS', 'SK', 'ES'].includes(firstUpper);
    const type: QuestionType = isTyped ? (firstUpper as QuestionType) : 'PG';
    const fields = isTyped ? parts.slice(1) : parts;

    const id = `q_${index + 1}_${Date.now() % 10000}`;

    if (type === 'PG') {
      if (fields.length < 7 || !fields[0]) return;
      const q = fields[0];
      const opts = fields.slice(1, 5);
      const rawCorrect = parseInt(fields[5], 10);
      const c = Math.max(0, Math.min(3, (isNaN(rawCorrect) ? 1 : rawCorrect) - 1));
      const w = Math.max(10, parseInt(fields[6], 10) || 100);

      questions.push({
        id,
        t: 'PG',
        q,
        o: opts,
        c,
        k: [],
        w,
        explanation: `Pilihan yang tepat adalah "${opts[c]}" sesuai dengan aturan Subjek, Predikat, Objek, dan Keterangan.`
      });
    } else if (type === 'CB') {
      if (fields.length < 7 || !fields[0]) return;
      const q = fields[0];
      const opts = fields.slice(1, 5);
      const rawIndices = fields[5]
        .split(',')
        .map((x) => parseInt(x.trim(), 10) - 1)
        .filter((x) => !isNaN(x) && x >= 0 && x < 4);
      const w = Math.max(10, parseInt(fields[6], 10) || 150);

      if (rawIndices.length > 0) {
        questions.push({
          id,
          t: 'CB',
          q,
          o: opts,
          c: rawIndices,
          k: [],
          w,
          explanation: `Jawaban benar mencakup: ${rawIndices.map((i) => opts[i]).join(', ')}.`
        });
      }
    } else if (type === 'BS') {
      if (fields.length < 3 || !fields[0]) return;
      const q = fields[0];
      const isBenar = /^b/i.test(fields[1]);
      const w = Math.max(10, parseInt(fields[2], 10) || 100);

      questions.push({
        id,
        t: 'BS',
        q,
        o: ['Benar', 'Salah'],
        c: isBenar ? 0 : 1,
        k: [],
        w,
        explanation: isBenar ? 'Pernyataan tersebut BENAR.' : 'Pernyataan tersebut SALAH.'
      });
    } else if (type === 'SK') {
      if (fields.length < 3 || !fields[1]) return;
      const q = fields[0];
      const targetSentence = fields[1];
      const words = targetSentence.split(/\s+/).filter(Boolean);
      const shuffledWords = shuffleArray(words);
      const w = Math.max(10, parseInt(fields[2], 10) || 150);

      questions.push({
        id,
        t: 'SK',
        q,
        o: shuffledWords,
        c: 0,
        k: [targetSentence],
        w,
        explanation: `Susunan yang padu: "${targetSentence}".`
      });
    } else if (type === 'ES') {
      if (fields.length < 3 || !fields[0]) return;
      const q = fields[0];
      const keywords = (fields[1] || '')
        .split(';')
        .map((k) => k.trim())
        .filter(Boolean);
      const w = Math.max(10, parseInt(fields[2], 10) || 100);

      if (keywords.length > 0) {
        questions.push({
          id,
          t: 'ES',
          q,
          o: [],
          c: 0,
          k: keywords,
          w,
          explanation: `Jawaban harus memuat kata kunci: "${keywords.join('", "')}".`
        });
      }
    }
  });

  return questions;
}

export function checkAnswer(q: Question, answer: any): boolean {
  if (answer === undefined || answer === null) return false;

  if (q.t === 'PG') {
    return Number(answer) === q.c;
  }

  if (q.t === 'BS') {
    return Number(answer) === q.c;
  }

  if (q.t === 'CB') {
    if (!Array.isArray(answer)) return false;
    const expected = Array.isArray(q.c) ? [...q.c].sort((a, b) => a - b) : [q.c];
    const actual = [...answer].sort((a, b) => a - b);
    return expected.length === actual.length && expected.every((val, idx) => val === actual[idx]);
  }

  if (q.t === 'SK') {
    const expectedSentence = q.k[0] || '';
    return normalizeText(String(answer)) === normalizeText(expectedSentence);
  }

  if (q.t === 'ES') {
    const userText = normalizeText(String(answer));
    if (!userText) return false;
    return q.k.every((keyword) => userText.includes(normalizeText(keyword)));
  }

  return false;
}

export function getCorrectAnswerDisplay(q: Question): string {
  if (q.t === 'PG') {
    return q.o[q.c as number] || '';
  }
  if (q.t === 'BS') {
    return q.c === 0 ? 'Benar' : 'Salah';
  }
  if (q.t === 'CB') {
    const indices = Array.isArray(q.c) ? q.c : [q.c];
    return indices.map((i) => q.o[i]).join(', ');
  }
  if (q.t === 'SK') {
    return q.k[0] || '';
  }
  if (q.t === 'ES') {
    return q.k.join(' / ');
  }
  return '';
}
