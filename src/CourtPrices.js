import yaml from 'js-yaml';
import fs from 'fs';
import { RRule, RRuleSet, rrulestr } from 'rrule';

class CourtPricing {
  constructor(yamlFilePath) {
    this.data = yaml.load(fs.readFileSync(yamlFilePath, 'utf8'));
  }

  getPrice(clubId, courtId, startDate, endDate) {
    const club = this.data.find(club => club.id === clubId);
    if (!club) return null;

    const court = club.courts.find(court => court.courts.includes(courtId));
    if (!court) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const prices = [];

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const price = this.getPriceForDate(court, d);
      if (price) prices.push(price);
    }

    return prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
  }

  getPriceForDate(court, date) {
    const season = this.getSeason(court.price, date);
    if (!season) return null;

    const day = date.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
    const time = `${date.getHours()}:${date.getMinutes()}`;

    for (const [key, value] of Object.entries(season)) {
      if (key.includes(day) || key.includes('*') || key.includes('!')) {
        const [start, end] = key.split(':');
        if (this.isTimeInRange(time, start, end)) {
          return parseFloat(value);
        }
      }
    }

    return null;
  }

  getSeason(price, date) {
    const year = date.getFullYear();
    const winterStart = new Date(price[`${year}-${year + 1}`].firstWinterDay);
    const summerStart = new Date(price[`${year}-${year + 1}`].firstSummerDay);

    if (date >= winterStart && date < summerStart) {
      return price[`${year}-${year + 1}`].winter;
    } else {
      return price[`${year}-${year + 1}`].summer;
    }
  }

  isTimeInRange(time, start, end) {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const currentTime = hour * 60 + minute;

    return currentTime >= startTime && currentTime <= endTime;
  }

  getMinMaxPrice(date) {
    const prices = [];

    this.data.forEach(club => {
      club.courts.forEach(court => {
        const price = this.getPriceForDate(court, new Date(date));
        if (price) prices.push(price);
      });
    });

    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  listCourts() {
    const currentDate = new Date();
    return this.data.map(club => {
      const courts = club.courts.map(court => {
        const minMaxPrice = this.getMinMaxPrice(currentDate);
        return {
          surface: court.surface,
          type: court.type,
          courts: court.courts,
          minMaxPrice
        };
      });

      return {
        id: club.id,
        address: club.address,
        googleMapsLink: club.googleMapsLink,
        website: club.website,
        courts
      };
    });
  }
}

// Tests
import assert from 'assert';

const courtPricing = new CourtPricing('courts.yaml');

// Test getPrice
assert.strictEqual(courtPricing.getPrice('matchpoint', '1', '2024-11-01', '2024-11-01'), 160);

// Test getMinMaxPrice
const minMaxPrice = courtPricing.getMinMaxPrice('2024-11-01');
assert.strictEqual(minMaxPrice.min, 130);
assert.strictEqual(minMaxPrice.max, 160);

// Test listCourts
const courtsList = courtPricing.listCourts();
assert.strictEqual(courtsList.length, 2);
assert.strictEqual(courtsList[0].id, 'matchpoint');
assert.strictEqual(courtsList[0].address, 'Szyszkowa 6, 55-040 Ślęza, Poland');
assert.strictEqual(courtsList[0].courts[0].minMaxPrice.min, 130);
assert.strictEqual(courtsList[0].courts[0].minMaxPrice.max, 160);

console.log('All tests passed!');