import Holidays from 'date-holidays';

const HL = new Holidays("PL");
const holidaysMap = getHolidays ();

function formatDate(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

function getHolidays () {
  const currentYear = new Date().getFullYear();
  const m = new Map();
    
  const holidays = [
    ...HL.getHolidays(currentYear - 1),
    ...HL.getHolidays(currentYear),
    ...HL.getHolidays(currentYear + 1)
  ];
  for (const holiday of holidays) {
    const dt = formatDate(holiday.start);
    m.set(dt, true);
  }

  return m;
}

function isHoliday(date) {
  return holidaysMap.has(formatDate(date));
}


const DAY_NAMES = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'st', 'hl'];

function parsePolandDate(dateString) {
  // Create date object in local timezone
  const date = new Date(dateString);
  
  // Convert to Poland timezone (UTC+1 or UTC+2 depending on DST)
  return new Date(date.toLocaleString('en-US', { 
    timeZone: 'Europe/Warsaw'
  }));
}

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
    // this should correspond to indexes returned by Date.getDay()    
    this.from = parsePolandDate(prices.from);
    this.from.setHours(0,0,0,0);
    this.to = parsePolandDate(prices.to);
    this.to.setHours(0,0,0,0);

    this.schedule = prices.schedule;
    this.dayMap = this.createPricingMap(this.schedule);    
  }

  mergeTimeMaps(existingMap, newMap) {
    const merged = new Map(existingMap);
    newMap.forEach((value, key) => merged.set(key, value));
    return merged;
  }


  createPricingMap(schedule){
    
    const hmap = { };
    for (const day of DAY_NAMES) {
      hmap[day] = new Map();
    }

    if (schedule === undefined || schedule === null) {
      return hmap;
    }
 
    // Check universal rules (!)
    for (const [rule, price] of Object.entries(schedule)) {
      const [ruleDay, timeRange] = rule.split(':');
      const intPrice = parseInt(price);

      // Default rule for all days
      if (ruleDay === '*') {
        for (const day in hmap) {          
          hmap[day] = this.mergeTimeMaps(hmap[day], this.getTimeInRange(timeRange,intPrice));
        }      
      }      
    
      // Specific days rule
      if (DAY_NAMES.includes(ruleDay)) {
        hmap[ruleDay] = this.mergeTimeMaps(hmap[ruleDay], this.getTimeInRange(timeRange,intPrice));
      }              

      // Master rule overrides all other rules
      if (ruleDay === '!' ) {
        for (const day of DAY_NAMES) {          
          hmap[day] = this.mergeTimeMaps(hmap[day], this.getTimeInRange(timeRange,intPrice));
        }      
      }
    }

    return hmap;
  }

  getTimeInRange(timeRange, price) {
    const [start, end] = timeRange.split('-').map(Number);
    const res = new Map();
    
    let i = start;
    while (i != end) {
        if (i === 24) {
            i = 0;
        }
        res.set(i*100, price/2);
        res.set(i*100 + 50, price/2);
        i++;
    }

    return res;
  }

  isClosed() {
    if (this.schedule === undefined || this.schedule === null || (this.schedule && this.schedule.length === 0)) {
      return  true;
    }
    
    return false;
  }

  getHalfHourRate(date) {    
    let day = DAY_NAMES[date.getDay()];    
    if (isHoliday(date)) {
      day = 'hl';
    }

    const hour = date.getHours();
    const minutes = date.getMinutes();
    if (minutes == 30) {
      return this.dayMap[day].get(hour * 100 + 50);
    }

    return this.dayMap[day].get(hour * 100) || null;
  }

  getMinMaxPriceForWeekday() {
   return this.getMinMaxForRange(['mo', 'tu', 'we', 'th', 'fr']);
  }

  getMinMaxPriceForWeekend() {
    return this.getMinMaxForRange(['su', 'st', 'hl']);
  }

  getMinMaxForRange(days){
    if (this.dayMap === undefined || this.dayMap === null) 
      return null;
    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;

    for (const day of days){          
      const values = [...this.dayMap[day].values()];
      if (Math.min(...values) < min) {
        min = Math.min(...values);
      }
      
      if (Math.max(...values) > max) {
        max = Math.max(...values);
      }
    }
    min = min*2;
    max = max*2;
    return { minPrice: min , maxPrice: max };
  }



  static createEmpty() {
    const emptyPrices = {
      from: new Date(0),
      to: new Date(0),
      schedule: undefined
    };
    return new PricePeriod(emptyPrices);
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

  getPricePeriod(date) {
    const targetDate = parsePolandDate(date);

    for (const pricePeriod of this.prices) {
      const fromDate = pricePeriod.from;
      const toDate = pricePeriod.to;

      if (targetDate >= fromDate && targetDate <= toDate) {
        return pricePeriod;
      }
    }
    return PricePeriod.createEmpty();
  }  


  // finds next monday from current date and returns the min and max price for the week
  getMinMaxPriceForWeekday(date) {        
    const dt = parsePolandDate(date); 
    const pp = this.getPricePeriod(dt);
    if (pp === null || pp.isClosed()) 
      return null;

    return pp.getMinMaxPriceForWeekday();
  }

  // finds next saturday from current date and returns the min and max price for the week
  getMinMaxPriceForWeekend(date) {    
    const dt = parsePolandDate(date); 
    const pp = this.getPricePeriod(dt);
    if (pp === null || pp.isClosed()) 
      return null;
    return pp.getMinMaxPriceForWeekend();
  }

  getPrice(startTime, endTime) {
    const start = parsePolandDate(startTime);
    const end = parsePolandDate(endTime);

   
    // Calculate total price for each hour
    let totalPrice = 0;
    let currentTime = parsePolandDate(start);

    const activePricing = this.getPricePeriod(start);
     if (activePricing.isClosed()) 
       return null;

    if (!activePricing) return null;
    
    while (currentTime < end) {
      const halfHourPrice = activePricing.getHalfHourRate(currentTime);

      if (halfHourPrice === null) return null;

      
      totalPrice += halfHourPrice;

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    
    return totalPrice;
  }

  isClosed(startTime){
    const start = parsePolandDate(startTime);        
    const activePricing = this.getPricePeriod(start);    
    return activePricing.isClosed();
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


  getMaxMinPrice(date) {
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

      this.clubs = clubsData.map(club =>{
        try{
          return new Club(
            club.id,
            club.name,
            club.address,
            club.googleMapsLink,
            club.website,
            club.courts
          )
        } catch (error) {
          throw new Error(`Error parsing club data for club ${club.name}: ${error.message}`);
        }
      }
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

    // data completeness
    this.validateMissingData(errors);

    // no gaps in the schedule
    this.validateDateGaps(errors);

    this.validateDaySchedule(errors);

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validateMissingData(errors){
    for (const club of this.clubs) {


      if (club.name === undefined || club.name.length < 5){
        errors.push(`Club ${club.id} name is missing or too short`);
      }

      if (club.address === undefined || club.address.length < 5){
        errors.push(`Club ${club.id} address is missing or too short`);
      }

      // check if google maps link is valid
      try {
        if (club.googleMapsLink === undefined || club.googleMapsLink.length < 5){
          errors.push(`Club ${club.id} googleMapsLink is missing or too short`);
        }else{
          const url = new URL(club.googleMapsLink); 
          if (url.protocol !== 'https:' || url.hostname !== 'maps.app.goo.gl'){
            errors.push(`Club ${club.id} googleMapsLink is not a valid google maps link`);
          }
        }
      } catch (error) {
        errors.push(`Club ${club.id} googleMapsLink is not a valid google maps link`);
      }
      
      // check if website is valid
      try {
        if (club.website === undefined){
          errors.push(`Club ${club.id} website is missing`);
        }
        const url = new URL(club.website); 
        if (url.protocol !== 'http:' && url.protocol !== 'https:'){
          errors.push(`Club ${club.id} website is not a valid URL`);
        }
      } catch (error) {
        errors.push(`Club ${club.id} website is not a valid URL`);
      }

      if (club.id === undefined || club.id.length < 3){
        errors.push(`Club ${club.id} is missing or too short`);
      }
    }
  }

  

  validateDateGaps(errors) {
    for (const club of this.clubs) {
      for (const courtGroup of club.courtGroups) {

        if (courtGroup.prices.length === 0) {
          continue;
        }

        // Sort periods by from date
        courtGroup.prices.sort((a, b) => parsePolandDate(a.from) - parsePolandDate(b.from));

        for (let i = 0; i < courtGroup.prices.length-1; i++) {
          if (courtGroup.prices[i].isClosed()){
            continue;
          }

          const current = courtGroup.prices[i];
          const next = courtGroup.prices[i + 1];

          const currentEnd = parsePolandDate(current.to);
          const nextStart = parsePolandDate(next.from);

          // Check for gap
          if (nextStart > currentEnd) {
            errors.push(
              `Gap found in schedule for club ${club.name}, ` +
              `court group ${courtGroup.surface} ${courtGroup.type}, ` +
              `between ${current.to} and ${next.from}`
            );
          }

          if (errors.length > 0) {
            return;
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
        dates.push(parsePolandDate(d));
      }
      return dates;
    };
  
    const year2024 = getDatesForYear(2024);
    const hours = Array.from({length: 14}, (_, i) => i + 8); // generates [8,9...,21]
  
    for (const club of this.clubs) {
      for (const courtGroup of club.courtGroups) {
        // Get min/max dates from pricing periods
        const minDate = parsePolandDate(Math.min(...courtGroup.prices.map(p => parsePolandDate(p.from))));
        const maxDate = parsePolandDate(Math.max(...courtGroup.prices.map(p => parsePolandDate(p.to))));
  
        // Filter dates within pricing period range
        const relevantDates = year2024.filter(date => 
          date >= minDate && date < maxDate
        );
  
        for (const date of relevantDates) {
          for (const hour of hours) {
            const testTime = parsePolandDate(date);
            testTime.setHours(hour, 0, 0, 0);
            
            const endTime = parsePolandDate(testTime);
            endTime.setHours(hour + 1);
  
            if (courtGroup.isClosed(testTime)){
              continue;
            }
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
export { Court, PricePeriod, CourtGroup, Club, CourtPricingSystem };