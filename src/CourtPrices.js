import fs from 'fs';
import yaml from 'js-yaml';


class CourtPricingSystem {
  constructor(yamlFilePath) {
    try {
      const fileContents = fs.readFileSync(yamlFilePath, 'utf8');
      const data = yaml.load(fileContents);
      this.clubs = Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error loading YAML file:', error);
      throw error;
    }
  }

  findActivePricing(pricingPeriods, date) {
    const targetDate = new Date(date);
    
    for (const [period, config] of Object.entries(pricingPeriods)) {
      const winterStart = new Date(config.firstWinterDay);
      const summerStart = new Date(config.firstSummerDay);
      
      if (targetDate >= winterStart && targetDate < summerStart) {
        return { season: 'winter', pricing: config.winter };
      } else if (targetDate >= summerStart && targetDate < new Date(winterStart.getTime() + 365 * 24 * 60 * 60 * 1000)) {
        return { season: 'summer', pricing: config.summer };
      }
    }
    return null;
  }

  isTimeInRange(hour, timeRange) {
    const [start, end] = timeRange.split('-').map(Number);
    if (start < end) {
      return hour >= start && hour < end;
    } else {
      // Handle overnight ranges (e.g., 23-6)
      return hour >= start || hour < end;
    }
  }

  findApplicableRate(pricing, date) {
    if (!pricing) return null;

    const weekday = date.getDay();
    const dayMap = {
      1: 'mo', 2: 'tu', 3: 'we', 4: 'th', 5: 'fr', 6: 'st', 0: 'su'
    };
    const dayName = dayMap[weekday];
    const hour = date.getHours();

    // Check universal rules (!)
    for (const [rule, price] of Object.entries(pricing)) {
      const [ruleDay, timeRange] = rule.split(':');
      if (ruleDay === '!' && this.isTimeInRange(hour, timeRange)) {
        return parseInt(price);
      }
    }

    // Check specific day rules first
    for (const [rule, price] of Object.entries(pricing)) {
      const [ruleDay, timeRange] = rule.split(':');
      if (ruleDay === dayName && this.isTimeInRange(hour, timeRange)) {
        return parseInt(price);
      }
    }

    // Check wildcard rules (*)
    for (const [rule, price] of Object.entries(pricing)) {
      const [ruleDay, timeRange] = rule.split(':');
      if (ruleDay === '*' && !['st', 'su'].includes(dayName) && 
          this.isTimeInRange(hour, timeRange)) {
        return parseInt(price);
      }
    }

    return null;
  }

  listCourts() {
    const now = new Date();
    const result = [];

    for (const club of this.clubs) {
      for (const courtGroup of club.courts) {
        const activePricing = this.findActivePricing(courtGroup.price, now);
        
        if (!activePricing || !activePricing.pricing) continue;

        const prices = Object.values(activePricing.pricing).map(price => parseInt(price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        const courts = [];
        for (const courtNumber of courtGroup.courts) {
          courts.push({
            clubId: club.id,
            courtId: courtNumber,
            surface: courtGroup.surface,
            type: courtGroup.type,
            minPrice,
            maxPrice,
            season: activePricing.season
          });
        }      
      }
    }

    return result;
  }

  getPrice(clubId, courtId, startTime, endTime) {
    // Ensure proper date parsing by padding single-digit hours with zeros
    const start = new Date(startTime)
    const end = new Date(endTime)

    // Find the club and court
    const club = this.clubs.find(c => c.id === clubId);
    if (!club) return null;

    const courtGroup = club.courts.find(cg => 
      cg.courts.includes(courtId.toString())
    );
    if (!courtGroup) return null;

    // Find active pricing for the date
    const activePricing = this.findActivePricing(courtGroup.price, start);
    if (!activePricing || !activePricing.pricing) return null;

    // Calculate total price for each hour
    let totalPrice = 0;
    let currentTime = new Date(start);

    while (currentTime < end) {
      const hourPrice = this.findApplicableRate(activePricing.pricing, currentTime);
      if (hourPrice === null) return null;

      // Calculate how much of the hour is used (in hours)
      const hourEnd = new Date(currentTime.getTime() + 60 * 60 * 1000);
      const slotEnd = new Date(Math.min(hourEnd.getTime(), end.getTime()));
      const duration = (slotEnd - currentTime) / (60 * 60 * 1000);

      totalPrice += hourPrice * duration;
      currentTime = hourEnd;
    }

    return totalPrice;
  }
}

export default CourtPricingSystem;