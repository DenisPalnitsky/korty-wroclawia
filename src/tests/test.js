/* eslint-env mocha */
import { expect } from 'chai';
import  CourtPricingSystem, { PricePeriod }  from '../CourtPricingSystem.js';
import fs from 'fs';
import yaml from 'js-yaml';


describe('CourtPricing', () => {

  const fileContents = fs.readFileSync('src/tests/courts_test.yaml', 'utf8');
  const data = yaml.load(fileContents);
  const courtPricingSystem = new CourtPricingSystem(data);


  it('should return the correct price for a given date and time range', () => {    
    const courtGroup1 = courtPricingSystem.list()[0].courtGroups[0];
    const courtGroup2 = courtPricingSystem.list()[0].courtGroups[1];

    expect(2).to.equal(courtPricingSystem.list().length, 'The number of courts should be 2');

    var price = courtGroup1.getPrice('2024-11-04T10:00:00', '2024-11-04T12:00:00');
    expect(price).to.equal(140*2, "Two hours in the morning on monday");

    price = courtGroup1.getPrice( '2024-11-04T18:00:00', '2024-11-04T19:00:00');
    expect(price).to.equal(170, "One hour in the evening");

    price = courtGroup1.getPrice( '2024-11-02T18:00:00', '2024-11-02T19:00:00');
    expect(price).to.equal(140, "One hour in the evening on saturday");

    // two different price ranges
    price = courtGroup1.getPrice( '2024-11-02T14:00:00', '2024-11-02T16:00:00');
    expect(price).to.equal(140+170, "Two different price ranges");

    // two different price ranges on friday
    price = courtGroup1.getPrice( '2025-01-24T14:00:00', '2025-01-24T16:00:00');
    expect(price).to.equal(140+170, "Two different price ranges");

    // court 2, 3 hours at night
    price = courtGroup1.getPrice( '2024-11-02T03:00:00', '2024-11-02T06:00:00');
    expect(price).to.equal(110*3, "Three hours in the night");

    // court 5, 1.5 hours at night
    price = courtGroup2.getPrice('2024-11-06T16:00:00', '2024-11-06T17:30:00');
    expect(price).to.equal(160+80, "1.5 hours in the evening on wednesday");  
  });

  it ('should return correct prices for krzycka park', () => {
    const krzycka = courtPricingSystem.list()[1].courtGroups[0];
    let price = krzycka.getPrice('2024-12-31T16:00:00', '2024-12-31T18:00:00');
    expect(price).to.equal(50*2, "Two hours in the evening")
  });

  describe('regression', () => {
    it('should return price', () => {
      const system = new CourtPricingSystem({
        id: 'test-club',
        name: 'Test Club',
        courts: [
          {
            surface: 'hard',
            type: 'indoor',
            courts: ['1'],
            prices: [{
              from: '2024-01-01',
              to: '2025-01-01',
              schedule: { "*:7-22": "100" }
            }]
          },
          {
            surface: 'clay',
            type: 'outdoor',
            courts: ['2'],
            prices: [{
              from: '2024-05-01',
              to: '2024-10-01',
              schedule: { "*:7-22": "80" }
            }]
          }
        ]
      });
      
      const result = system.clubs[0].courtGroups[1].getPrice('2024-09-30T07:00:00', '2024-09-30T08:00:00');
      expect(result).to.equal(80);
    });

    it('should not fail validation', () => {
      const fileContents = fs.readFileSync('src/tests/regression.yaml', 'utf8');
      const data = yaml.load(fileContents);
      const courtPricingSystem = new CourtPricingSystem(data);
      const res = courtPricingSystem.validate();
      if (!res.isValid) {
        console.error('Validation failed with the following errors:');        
        console.error(res.errors);
      }

      expect(res.isValid).to.be.true;
        
    });
  });

  describe('validate()', () => {
    it('should detect gaps between pricing periods', () => {
      const system = new CourtPricingSystem({
        id: 'test-club',
        name: 'Test Club',
        googleMapsLink: 'https://maps.app.goo.gl/1',
        website: 'https://example.com',
        address: 'Test Street 1',
        courts: [{
          surface: 'hard',
          type: 'indoor',
          courts: ['1'],
          prices: [
            {
              from: '2024-01-01',
              to: '2024-06-30',
              schedule: { "*:7-22": "100" }
            },
            {
              from: '2024-07-02', // Gap on July 1st
              to: '2024-12-31',
              schedule: { "*:7-22": "100" }
            }
          ]
        }]
      });
  
      const result = system.validate();
      expect(result.isValid).to.be.false;
      expect(result.errors[0]).to.include('Gap found');
    });
  
    it('should detect overlapping periods', () => {
      const system = new CourtPricingSystem({
        id: 'test-club',
        name: 'Test Club',
        googleMapsLink: 'https://maps.app.goo.gl/1',
        website: 'https://example.com',
        address: 'Test Street 1',
        courts: [{
          surface: 'hard',
          type: 'indoor',
          courts: ['1'],
          prices: [
            {
              from: '2024-01-01',
              to: '2024-07-15',
              schedule: { "*:7-21": "100" }
            },
            {
              from: '2024-07-01',
              to: '2024-12-31',
              schedule: { "*:7-21": "100" }
            }
          ]
        }]
      });
  
      const result = system.validate();
      expect(result.isValid).to.be.false;
      expect(result.errors[0]).to.include('Overlap found');
    });
  
    it('should detect missing hours in schedule', () => {
      const system = new CourtPricingSystem({
        id: 'test-club',
        name: 'Test Club',
        googleMapsLink: 'https://maps.app.goo.gl/1',
        website: 'https://example.com',
        address: 'Test Street 1',
        courts: [{
          surface: 'hard',
          type: 'indoor',
          courts: ['1'],
          prices: [{
            from: '2024-01-01',
            to: '2024-12-31',
            schedule: {
              "*:7-15": "100",
              // Missing 15-21 schedule
            }
          }]
        }]
      });
  
      const result = system.validate();
      expect(result.isValid).to.be.false;
      expect(result.errors[0]).to.include('Missing price');
    });
  
    it('should validate correct schedule configuration', () => {
      const system = new CourtPricingSystem({
        id: 'test-club',
        name: 'Test Club',
        googleMapsLink: 'https://maps.app.goo.gl/1',
        website: 'https://example.com',
        address: 'Test Street 1',
        courts: [{
          surface: 'hard',
          type: 'indoor',
          courts: ['1'],
          prices: [{
            from: '2024-01-01',
            to: '2025-01-01',
            schedule: {
              "*:7-15": "100",
              "*:15-22": "120",
              "st:7-22": "90",
              "su:7-22": "90"
            }
          }]
        }]
      });
  
      const result = system.validate();
      expect(result.isValid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
      if (!result.isValid) {
        console.log("Validation errors:", system.errors.take(10));
      }
    });
  
    it('should handle multiple court groups', () => {
      const system = new CourtPricingSystem({
        id: 'test-club',
        name: 'Test Club',
        googleMapsLink: 'https://maps.app.goo.gl/1',
        website: 'https://example.com',
        address: 'Test Street 1',
        courts: [
          {
            surface: 'hard',
            type: 'indoor',
            courts: ['1'],
            prices: [{
              from: '2024-01-01',
              to: '2025-01-01',
              schedule: { "*:7-22": "100" }
            }]
          },
          {
            surface: 'clay',
            type: 'outdoor',
            courts: ['2'],
            prices: [{
              from: '2024-05-01',
              to: '2024-10-01',
              schedule: { "*:7-22": "80" }
            }]
          }
        ]
      });
  
      const result = system.validate();
      expect(result.isValid).to.be.true;
    });
  });

});

describe('RealDataValidation', () => {
  it('validation of assets/courts.yaml', () => {
    const fileContents = fs.readFileSync('src/assets/courts.yaml', 'utf8');
    const data = yaml.load(fileContents);
    const courtPricingSystem = new CourtPricingSystem(data);
  
    const res = courtPricingSystem.validate();
    if (!res.isValid) {
      console.error('Validation failed with the following errors:');
      console.error(res.errors);
    }
    
    expect(res.isValid).to.be.true;
  });
});

describe('Price Range Tests', () => {
  const fileContents = fs.readFileSync('src/tests/courts_test.yaml', 'utf8');
  const data = yaml.load(fileContents);
  const courtPricingSystem = new CourtPricingSystem(data);
  

  it('should return correct price ranges for weekday', () => {   
    const date = new Date('2024-05-04T10:00:00');
    const weekdayPrices = courtPricingSystem.clubs[0].courtGroups[0].getMinMaxPriceForWeekday(date);
    expect(weekdayPrices).to.deep.equal({
      minPrice: 60,
      maxPrice: 110
    });
  });

  it('should return correct price ranges for weekend', () => {
    const date = new Date('2024-05-04T10:00:00');
    const weekendPrices = courtPricingSystem.clubs[0].courtGroups[0].getMinMaxPriceForWeekend(date);
    expect(weekendPrices).to.deep.equal({
      minPrice: 50,
      maxPrice: 110
    });
  });


  it('should return correct price ranges for weekend', () => {
    const date = new Date('2024-11-04T10:00:00');
    const weekendPrices = courtPricingSystem.clubs[0].courtGroups[1].getMinMaxPriceForWeekday(date);
    expect(weekendPrices).to.deep.equal({
      minPrice: 130,
      maxPrice: 160
    });
  });

  it('should return null for closed periods', () => {
    const date = new Date('2024-04-04T10:00:00');
    const weekdayPrices = courtPricingSystem.clubs[0].courtGroups[0].getMinMaxPriceForWeekday(date);
    const weekendPrices = courtPricingSystem.clubs[0].courtGroups[0].getMinMaxPriceForWeekend(date);
    
    expect(weekdayPrices).to.be.null;
    expect(weekendPrices).to.be.null;
  });
});

describe('Test pricing period', () => {

  it('should return correct price for a given date and time', () => {
    const data = {
      from: '2024-01-01',
      to: '2024-12-31',
      schedule: {
        "*:7-15": "50",
        "*:15-22": "100",
        "st:7-22": "150",
        "su:7-22": "160",
        "hl:7-22": "200",
        "!:22-7": "10"
      }
    };
    const pricePeriod = new PricePeriod(data);

    let date = new Date('2024-12-04T10:00:00'); // Wednesday
    let price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(25);

    date = new Date('2024-12-04T15:00:00'); // Wednesday
    price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(50);

    date = new Date('2024-12-04T22:00:00'); // Wednesday
    price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(5);

    date = new Date('2024-12-04T03:00:00'); // Wednesday
    price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(5);

    date = new Date('2024-12-04T07:00:00'); // Wednesday
    price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(25);

    date = new Date('2024-12-04T07:30:00'); // Wednesday
    price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(25);

    date = new Date('2024-12-01T07:00:00'); // Sunday
    price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(80);

    date = new Date('2024-11-30T21:00:00'); // Saturday
    price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(75);

    
    date = new Date('2024-11-11T10:00:00'); // Holiday, Independence Day
    price = pricePeriod.getHalfHourRate(date);
    expect(price).to.equal(100);        

  });
  
  it('should return closed if there is no price for timerange', () => {
    const data = {
      from: '2024-01-01',
      to: '2024-12-31',
      schedule: {
        "*:7-15": "50",
        "*:15-22": "100",
        "st:7-22": "150",
        "su:7-22": "160",
        "hl:7-22": "200",        
      }
    };
    const pricePeriod = new PricePeriod(data);
    
    let date = new Date('2024-05-04T23:00:00'); // Thursday
    let price = pricePeriod.getHalfHourRate(date);
    expect(price).null;
  })

});

