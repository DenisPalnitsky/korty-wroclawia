/**
 * Generates a golden JSON snapshot of CourtPricingSystem outputs for production
 * courts data. Must match CI/test timezone (Europe/Warsaw) because pricing uses
 * local getHours()/getDay().
 *
 *   npm run generate-pricing-golden
 *
 * Or: TZ=Europe/Warsaw node scripts/generateCourtPricingGoldenSnapshot.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import CourtPricingSystem from '../src/CourtPricingSystem.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COURTS_YAML = path.join(ROOT, 'src/assets/courts.yaml');
const OUT_JSON = path.join(ROOT, 'src/tests/fixtures/courtPricingGoldenProduction.json');

const SAMPLE_HOURS = [8, 10, 14, 18, 21];

function ymd(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** First date in [from, to] with getDay() === want (0=Sun .. 6=Sat) */
function firstDayOfWeekInRange(from, to, wantDay) {
  const cur = new Date(from);
  cur.setHours(12, 0, 0, 0);
  const end = new Date(to);
  end.setHours(12, 0, 0, 0);
  for (let i = 0; i < 400 && cur <= end; i++) {
    if (cur.getDay() === wantDay) return new Date(cur);
    cur.setDate(cur.getDate() + 1);
  }
  return null;
}

function collectSamplesForPeriod(pp, from, to) {
  const samples = [];
  const daySpecs = [
    { label: 'mo', wantDay: 1 },
    { label: 'sa', wantDay: 6 },
    { label: 'su', wantDay: 0 },
  ];

  for (const { label, wantDay } of daySpecs) {
    const dayDate = firstDayOfWeekInRange(from, to, wantDay);
    if (!dayDate) continue;
    for (const hour of SAMPLE_HOURS) {
      const start = new Date(dayDate);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 1, 0, 0, 0);
      if (start < from || start > to) continue;
      const price = pp.getHalfHourRate(start);
      if (price === null) continue;
      let total = 0;
      let t = new Date(start);
      while (t < end) {
        const half = pp.getHalfHourRate(t);
        if (half === null) {
          total = null;
          break;
        }
        total += half;
        t.setMinutes(t.getMinutes() + 30);
      }
      if (total !== null) {
        samples.push({
          tag: `${label}@${hour}`,
          startIso: start.toISOString(),
          endIso: end.toISOString(),
          price: total,
        });
      }
    }
  }

  return samples;
}

function buildSnapshot(system) {
  const entries = {};

  for (const club of system.clubs) {
    for (const group of club.courtGroups) {
      for (const court of group.courts) {
        for (const pp of group.prices) {
          if (pp.isClosed()) continue;

          const from = pp.from;
          const to = pp.to;
          const mid = new Date((from.getTime() + to.getTime()) / 2);
          mid.setHours(12, 0, 0, 0);

          const weekday = pp.getMinMaxPriceForWeekday();
          const weekend = pp.getMinMaxPriceForWeekend();

          const key = [
            club.id,
            group.surface,
            group.type,
            String(court.id),
            ymd(from),
            ymd(to),
          ].join('|');

          const samplePrices = collectSamplesForPeriod(pp, from, to);

          entries[key] = {
            clubId: club.id,
            surface: group.surface,
            type: group.type,
            courtId: String(court.id),
            periodFrom: ymd(from),
            periodTo: ymd(to),
            weekdayMinMax: weekday,
            weekendMinMax: weekend,
            midDateWeekdayRange: group.getMinMaxPriceForWeekday(mid),
            midDateWeekendRange: group.getMinMaxPriceForWeekend(mid),
            midDateSamplePrices: samplePrices,
          };
        }
      }
    }
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    sourcePath: 'src/assets/courts.yaml',
    entries,
  };
}

const raw = fs.readFileSync(COURTS_YAML, 'utf8');
const data = yaml.load(raw);
const system = new CourtPricingSystem(data);
const snapshot = buildSnapshot(system);

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');

let n = 0;
for (const e of Object.values(snapshot.entries)) {
  n += 2;
  if (e.weekdayMinMax) n += 2;
  if (e.weekendMinMax) n += 2;
  if (e.midDateWeekdayRange) n += 2;
  if (e.midDateWeekendRange) n += 2;
  const samples = e.midDateSamplePrices || [];
  n += samples.length;
}

console.log('Wrote', OUT_JSON);
console.log('Entry keys:', Object.keys(snapshot.entries).length);
console.log('Approx verified scalar checks (see test counter):', n);
