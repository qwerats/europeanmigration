import XLSX from 'xlsx';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const files = [
  'c:\\Users\\egemb\\Downloads\\Прогноз по населению.xlsx',
  'c:\\Users\\egemb\\Downloads\\прогноз по населению. Базовые данные.xlsx',
];

for (const p of files) {
  console.log('\n===', p);
  const wb = XLSX.readFile(p, { cellDates: true });
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    console.log('Sheet:', name, 'rows:', rows.length);
    for (let i = 0; i < Math.min(30, rows.length); i++) {
      const r = rows[i];
      if (r?.some((c) => c != null && String(c).trim())) console.log(i, r?.slice(0, 8));
    }
  }
}
