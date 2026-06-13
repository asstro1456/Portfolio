import fs from 'node:fs/promises';

const url = 'https://script.google.com/macros/s/AKfycbyR7kMLzYOAijbXmb4B7TEguwGv6wHwVhG7V26HvpJIkX1qljHNuDW3S7fuVs_8nvoV/exec';
const payloadPath = process.argv[2] || './tmp/gamejob_payload_2026-06-04.json';
const secret = process.env.GAMEJOB_AUTOMATION_SECRET;

if (!secret) {
  throw new Error('GAMEJOB_AUTOMATION_SECRET is required');
}

const payload = JSON.parse(await fs.readFile(payloadPath, 'utf8'));
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...payload, secret }),
});
const text = await res.text();
const result = { ok: res.ok, status: res.status, text: text.slice(0, 1000) };
await fs.writeFile('./tmp/gamejob_post_result_2026-06-04.json', JSON.stringify(result, null, 2), 'utf8');
console.log(JSON.stringify(result, null, 2));
