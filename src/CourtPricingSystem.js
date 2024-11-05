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

class CourtGroup {
  constructor(surface, type, courtIds, pricingPeriods) {
    this.surface = surface;
    this.type = type;
    this.courts = courtIds.map(id => new Court(id, surface, type, this));
    this.pricingPeriods = pricingPeriods;
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
    
    for (const [, config] of Object.entries(this.pricingPeriods)) {
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

  getMaxMinPrice(date) {
    const activePricing = this.findActivePricing(date);
    
    if (!activePricing || !activePricing.pricing) return null;

    const prices = Object.values(activePricing.pricing).map(price => parseInt(price));
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      season: activePricing.season
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
      new CourtGroup(group.surface, group.type, group.courts, group.price)
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

  verifySchedules() {
    const errors = [];
    
    for (const club of this.clubs) {
      for (const courtGroup of club.courtGroups) {
        // Check both winter and summer schedules
        const winterDate = new Date(courtGroup.pricingPeriods[0].firstWinterDay);
        const summerDate = new Date(courtGroup.pricingPeriods[0].firstSummerDay);
        
        // Verify winter schedule
        const winterPricing = courtGroup.findActivePricing(winterDate);
        if (winterPricing) {
          this.verifyDaySchedule(winterPricing.pricing, courtGroup, club, errors, 'winter');
        } else {
          errors.push(`Missing winter pricing for club ${club.name}, court group ${courtGroup.surface} ${courtGroup.type}`);
        }
        
        // Verify summer schedule
        const summerPricing = courtGroup.findActivePricing(summerDate);
        if (summerPricing) {
          this.verifyDaySchedule(summerPricing.pricing, courtGroup, club, errors, 'summer');
        } else {
          errors.push(`Missing summer pricing for club ${club.name}, court group ${courtGroup.surface} ${courtGroup.type}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  verifyDaySchedule(pricing, courtGroup, club, errors, season) {
    const days = ['mo', 'tu', 'we', 'th', 'fr', 'st', 'su'];
    const operatingHours = { start: 7, end: 22 };
    
    for (const day of days) {
      // Check each hour in operating hours
      for (let hour = operatingHours.start; hour < operatingHours.end; hour++) {
        const testDate = new Date(2024, 0, 1, hour); // Use a Monday in 2024
        // Adjust the day of week
        testDate.setDate(testDate.getDate() + days.indexOf(day));
        
        const rate = courtGroup.findApplicableRate({ ...pricing }, testDate);
        
        if (rate === null) {
          errors.push(
            `Gap found in ${season} schedule for club ${club.name}, ` +
            `court group ${courtGroup.surface} ${courtGroup.type}, ` +
            `day ${day}, hour ${hour}:00`
          );
        }
      }
    }
  }
}

export default CourtPricingSystem;