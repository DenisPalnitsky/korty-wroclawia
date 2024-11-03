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
    
    for (const [period, config] of Object.entries(this.pricingPeriods)) {
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

  getPrice(courtId, startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Verify court exists in this group
    if (!this.courts.some(court => court.id === courtId)) {
      return null;
    }

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

  getPrice(courtId, startTime, endTime) {
    const courtGroup = this.courtGroups.find(group => 
      group.courts.some(court => court.id === courtId)
    );
    
    if (!courtGroup) return null;
    
    return courtGroup.getPrice(courtId, startTime, endTime);
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
}

export default CourtPricingSystem;