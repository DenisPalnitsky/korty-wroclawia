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
