/* eslint-env mocha */
import { expect } from 'chai';
import  CourtPricingSystem  from '../CourtPricingSystem.js';
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
  });

  describe('validate()', () => {
    it('should detect gaps between pricing periods', () => {
      const system = new CourtPricingSystem({
        id: 'test-club',
        name: 'Test Club',
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
        console.log("Validation errors:", system.errors);
      }
    });
  
    it('should handle multiple court groups', () => {
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
    expect(res.isValid).to.equal(true, "should return true");
    // show errors 
    if (!res) {
      console.log("Validation errors:", courtPricingSystem.errors);
      }
  });
});


// describe('Debug',()=>{
//   const getDatesForYear = (year) => {
//     const dates = [];
//     const start = new Date(year, 0, 1);
//     const end = new Date(year + 1, 0, 1);
    
//     for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
//       dates.push(new Date(d));
//     }
//     return dates;
//   };
//   const year2024 = getDatesForYear(2024);

//   it.only('should return relevant dates', () => {
//     const minDate = new Date('2024-04-30T00:00:00');
//     const maxDate = new Date('2024-05-01T00:00:00');
//     const relevantDates = year2024.filter(date => 
//       date >= minDate && date < maxDate
//     );
//     expect(relevantDates).to.have.lengthOf(1);  
//     expect(relevantDates[0]).not.eq(maxDate);
//   });
// })