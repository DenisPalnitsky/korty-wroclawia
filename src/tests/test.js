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
              schedule: { "*:7-22": "100" }
            },
            {
              from: '2024-07-01', // Overlaps with previous period
              to: '2024-12-31',
              schedule: { "*:7-22": "100" }
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
              // Missing 15-22 schedule
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
            to: '2024-12-31',
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
    });

    it('should handle empty court groups', () => {
      const system = new CourtPricingSystem({
        id: 'test-club',
        name: 'Test Club',
        courts: []
      });

      const result = system.validate();
      expect(result.isValid).to.be.true;
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
              to: '2024-12-31',
              schedule: { "*:7-22": "100" }
            }]
          },
          {
            surface: 'clay',
            type: 'outdoor',
            courts: ['2'],
            prices: [{
              from: '2024-05-01',
              to: '2024-09-30',
              schedule: { "*:7-22": "80" }
            }]
          }
        ]
      });

      const result = system.validate();
      expect(result.isValid).to.be.true;
    });
  });


  // it('should return the correct min and max price for a given date and time', () => {
  //   const minMaxPrice = courtPricing.getMinMaxPrice('2024-12-01');
  //   expect(minMaxPrice.min).to.equal(130);
  //   expect(minMaxPrice.max).to.equal(170);
  // });

  // it('should list all courts with their details and min/max price for the current date and time', () => {
  //   const courtsList = courtPricing.listCourts();
  //   expect(courtsList.courts).to.have.lengthOf(1);
  //   expect(courtsList[0].id).to.equal('matchpoint');    
  //   expect(courtsList[0].courts[0].minMaxPrice.min).to.equal(130);
  //   expect(courtsList[0].courts[0].minMaxPrice.max).to.equal(170);
  // });
});

describe('DataValidation', () => {
  it('should verify data as correct', () => {
    const fileContents = fs.readFileSync('src/tests/courts_test.yaml', 'utf8');
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

