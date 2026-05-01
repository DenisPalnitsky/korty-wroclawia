/* eslint-env mocha */
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import CourtPricingSystem from '../CourtPricingSystem.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURTS_YAML = path.join(__dirname, '../assets/courts.yaml');
const GOLDEN_JSON = path.join(__dirname, 'fixtures/courtPricingGoldenProduction.json');

function ymd(d) {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

function entryKey(clubId, surface, type, courtId, from, to) {
  return [clubId, surface, type, String(courtId), ymd(from), ymd(to)].join('|');
}

describe('CourtPricingSystem production golden (src/assets/courts.yaml)', () => {
  let system;
  let golden;

  before(() => {
    const rawYaml = fs.readFileSync(COURTS_YAML, 'utf8');
    const data = yaml.load(rawYaml);
    system = new CourtPricingSystem(data);

    const rawJson = fs.readFileSync(GOLDEN_JSON, 'utf8');
    golden = JSON.parse(rawJson);
  });

  it('passes validate() on production data', () => {
    const res = system.validate();
    expect(res.isValid, res.errors?.join('\n')).to.be.true;
  });

  it('matches golden snapshot for every open court × price period (310 entries, 7000+ assertions)', () => {
    const expectedKeys = new Set(Object.keys(golden.entries));
    let verifiedScalars = 0;

    for (const club of system.clubs) {
      for (const group of club.courtGroups) {
        for (const court of group.courts) {
          for (const pp of group.prices) {
            if (pp.isClosed()) continue;

            const key = entryKey(club.id, group.surface, group.type, court.id, pp.from, pp.to);
            expect(expectedKeys.has(key), `Missing golden entry for ${key}`).to.be.true;

            const exp = golden.entries[key];
            expect(exp.clubId).to.equal(club.id);
            expect(exp.surface).to.equal(group.surface);
            expect(exp.type).to.equal(group.type);
            expect(exp.courtId).to.equal(String(court.id));
            expect(exp.periodFrom).to.equal(ymd(pp.from));
            expect(exp.periodTo).to.equal(ymd(pp.to));

            const gotWeekday = pp.getMinMaxPriceForWeekday();
            const gotWeekend = pp.getMinMaxPriceForWeekend();
            expect(gotWeekday).to.deep.equal(exp.weekdayMinMax);
            expect(gotWeekend).to.deep.equal(exp.weekendMinMax);
            verifiedScalars += 4;

            const mid = new Date((pp.from.getTime() + pp.to.getTime()) / 2);
            mid.setHours(12, 0, 0, 0);
            expect(group.getMinMaxPriceForWeekday(mid)).to.deep.equal(exp.midDateWeekdayRange);
            expect(group.getMinMaxPriceForWeekend(mid)).to.deep.equal(exp.midDateWeekendRange);
            verifiedScalars += 4;

            for (const sample of exp.midDateSamplePrices) {
              const total = group.getPrice(sample.startIso, sample.endIso);
              expect(total, `${key} ${sample.tag}`).to.equal(sample.price);
              verifiedScalars += 1;
            }

            expectedKeys.delete(key);
          }
        }
      }
    }

    expect(expectedKeys.size, `Extra golden keys: ${[...expectedKeys].slice(0, 5).join(', ')}`).to.equal(0);
    expect(verifiedScalars).to.be.at.least(200);
  });
});
