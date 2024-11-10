class Court {
  constructor(courtId, surface, type, courtGroup) {
    this.id = courtId;
    this.surface = surface;
    this.type = type;
    this.courtGroup = courtGroup;
  }

  getPrice(startTime, endTime) {
    return this.courtGroup.getPrice(this.id, startTime, endTime);
  }

  getMaxMinPrice(date) {
    return this.courtGroup.getMaxMinPrice(date);
  }
}

class PricePeriod {  
  constructor(prices){
    this.from = new Date(prices.from);
    this.from.setHours(0,0,0,0);
    this.to = new Date(prices.to);
    this.to.setHours(0,0,0,0);

    this.schedule = prices.schedule;
  }
}

class CourtGroup {
  constructor(surface, type, courtIds, prices) {
    this.surface = surface;
    this.type = type;
    this.courts = courtIds.map(id => new Court(id, surface, type, this));
    this.prices = prices.map(price => new PricePeriod(price));
  }


  isTimeInRange(hour, timeRange) {
    const [start, end] = timeRange.split('-').map(Number);
    if (start < end) {
      return hour >= start && hour < end;
    }
    // Handle overnight ranges (e.g., 23-6)
    return hour >= start || hour < end;
  }

  findActivePricing(date) {
    const targetDate = new Date(date);

    for (const pricePeriod of this.prices) {
      const fromDate = pricePeriod.from;
      const toDate = pricePeriod.to;

      if (targetDate >= fromDate && targetDate <= toDate) {
        return {
          pricing: pricePeriod.schedule
        };
      }
    }
    return null;
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
      if (ruleDay === '*' &&
        this.isTimeInRange(hour, timeRange)) {
        return parseInt(price);
      }
    }

    return null;
  }

  getMaxMinPrice(date) {
    const activePricing = this.findActivePricing(date);

    if (!activePricing || !activePricing.pricing) return null;

    const prices = Object.values(activePricing.pricing).map(price => parseInt(price));
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    };
  }

  // finds next monday from current date and returns the min and max price for the week
  getMaxMinPriceForWeekday() {
    const date = new Date();
    const day = date.getDay();
    const diff = 1 + (7 + 1 - day) % 7;
    date.setDate(date.getDate() + diff);
    const minMaxPrice = this.getMaxMinPrice(date);
    return minMaxPrice;
  }

  // finds next saturday from current date and returns the min and max price for the week
  getMaxMinPriceForWeekend() {
    const date = new Date();
    const day = date.getDay();
    const diff = 6 + (7 + 6 - day) % 7;
    date.setDate(date.getDate() + diff);
    const minMaxPrice = this.getMaxMinPrice(date);
    return minMaxPrice;
  }

  getPrice(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Find active pricing for the date
    const activePricing = this.findActivePricing(start);
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

class Club {
  constructor(id, name, address, googleMapsLink, website, courts) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.googleMapsLink = googleMapsLink;
    this.website = website;
    this.courtGroups = courts.map(group =>
      new CourtGroup(group.surface, group.type, group.courts, group.prices)
    );
  }


  getMaxMinPrice(date = new Date()) {
    const result = [];

    for (const courtGroup of this.courtGroups) {
      const pricing = courtGroup.getMaxMinPrice(date);
      if (!pricing) continue;

      for (const court of courtGroup.courts) {
        result.push({
          clubId: this.id,
          courtId: court.id,
          surface: court.surface,
          type: court.type,
          minPrice: pricing.minPrice,
          maxPrice: pricing.maxPrice,
          season: pricing.season
        });
      }
    }

    return result;
  }
}

class CourtPricingSystem {
  constructor(data) {
    try {
      const clubsData = Array.isArray(data) ? data : [data];

      this.clubs = clubsData.map(club =>
        new Club(
          club.id,
          club.name,
          club.address,
          club.googleMapsLink,
          club.website,
          club.courts
        )
      );
    } catch (error) {
      console.error('Error loading YAML file:', error);
      throw error;
    }
  }

  list() {
    const result = [];
    for (const club of this.clubs) {
      result.push(club);
    }
    return result;
  }

  validate() {
    const errors = [];

    // no gaps in the schedule
    this.validateDateGaps(errors);

    this.validateDaySchedule(errors);

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  

  validateDateGaps(errors) {
    for (const club of this.clubs) {
      for (const courtGroup of club.courtGroups) {

        if (courtGroup.prices.length === 0) {
          continue;
        }

        // Sort periods by from date
        courtGroup.prices.sort((a, b) => new Date(a.from) - new Date(b.from));

        for (let i = 0; i < courtGroup.prices.length - 1; i++) {
          const current = courtGroup.prices[i];
          const next = courtGroup.prices[i + 1];

          const currentEnd = new Date(current.to);
          const nextStart = new Date(next.from);

          // Check for gap
          if (nextStart > currentEnd) {
            errors.push(
              `Gap found in schedule for club ${club.name}, ` +
              `court group ${courtGroup.surface} ${courtGroup.type}, ` +
              `between ${current.to} and ${next.from}`
            );
          }

          // Check for overlap
          if (nextStart < currentEnd) {
            errors.push(
              `Overlap found in schedule for club ${club.name}, ` +
              `court group ${courtGroup.surface} ${courtGroup.type}, ` +
              `between periods ${current.from}-${current.to} and ${next.from}-${next.to}`
            );
          }
        }
      }
    }
  }

  validateDaySchedule(errors) {
    const getDatesForYear = (year) => {
      const dates = [];
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);
      
      for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    };
  
    const year2024 = getDatesForYear(2024);
    const hours = Array.from({length: 14}, (_, i) => i + 8); // generates [8,9...,21]
  
    for (const club of this.clubs) {
      for (const courtGroup of club.courtGroups) {
        // Get min/max dates from pricing periods
        const minDate = new Date(Math.min(...courtGroup.prices.map(p => new Date(p.from))));
        const maxDate = new Date(Math.max(...courtGroup.prices.map(p => new Date(p.to))));
  
        // Filter dates within pricing period range
        const relevantDates = year2024.filter(date => 
          date >= minDate && date < maxDate
        );
  
        for (const date of relevantDates) {
          for (const hour of hours) {
            const testTime = new Date(date);
            testTime.setHours(hour, 0, 0, 0);
            
            const endTime = new Date(testTime);
            endTime.setHours(hour + 1);
  
            const price = courtGroup.getPrice(testTime, endTime);
            
            if (price === null) {
              errors.push(
                `Missing price for club ${club.name}, ` +
                `court group ${courtGroup.surface} ${courtGroup.type}, ` +
                `at ${testTime.toISOString()}`
              );
            }
          }
        }
      }
    }
  }

}

export default CourtPricingSystem;