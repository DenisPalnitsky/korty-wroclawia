import { expect } from 'chai';
import  CourtPricingSystem  from '../CourtPricingSystem.js';
import fs from 'fs';
import yaml from 'js-yaml';



describe('CourtPricing', () => {

  const fileContents = fs.readFileSync('src/tests/courts_test.yaml', 'utf8');
    const data = yaml.load(fileContents);
    const courtPricingSystem = new CourtPricingSystem(data);


  it('should return the correct price for a given date and time range', () => {    
    const club = courtPricingSystem.listCourts()[0];


    var price = club.getPrice('1', '2024-11-04T10:00:00', '2024-11-04T12:00:00');
    expect(price).to.equal(140*2);

    price = club.getPrice( '1', '2024-11-04T18:00:00', '2024-11-04T19:00:00');
    expect(price).to.equal(170);

    price = club.getPrice( '1', '2024-11-02T18:00:00', '2024-11-02T19:00:00');
    expect(price).to.equal(140);

    // two different price ranges
    price = club.getPrice('1', '2024-11-02T14:00:00', '2024-11-02T16:00:00');
    expect(price).to.equal(140+170);

    // two different price ranges on friday
    price = club.getPrice( '1', '2025-01-24T14:00:00', '2025-01-24T16:00:00');
    expect(price).to.equal(140+170);

    // court 2, 3 hours in the night
    price = club.getPrice( '2', '2024-11-02T03:00:00', '2024-11-02T06:00:00');
    expect(price).to.equal(110*3);

    // court 5, 1.5 hours in the night
    price = club.getPrice( '5', '2024-11-06T16:00:00', '2024-11-06T17:30:00');
    expect(price).to.equal(160+80);
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
