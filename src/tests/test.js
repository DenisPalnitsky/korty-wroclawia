import { expect } from 'chai';
import CourtPricing from '../CourtPrices';

const courtPricing = new CourtPricing('src/assets/courts.yaml');

describe('CourtPricing', () => {
  it('should return the correct price for a given date range', () => {
    const price = courtPricing.getPrice('matchpoint', '1', '2024-11-01', '2024-11-01');
    expect(price).to.equal(160);
  });

  it('should return the correct min and max price for a given date', () => {
    const minMaxPrice = courtPricing.getMinMaxPrice('2024-11-01');
    expect(minMaxPrice.min).to.equal(130);
    expect(minMaxPrice.max).to.equal(160);
  });

  it('should list all courts with their details and min/max price for the current date', () => {
    const courtsList = courtPricing.listCourts();
    expect(courtsList).to.have.lengthOf(2);
    expect(courtsList[0].id).to.equal('matchpoint');
    expect(courtsList[0].address).to.equal('Szyszkowa 6, 55-040 Ślęza, Poland');
    expect(courtsList[0].courts[0].minMaxPrice.min).to.equal(130);
    expect(courtsList[0].courts[0].minMaxPrice.max).to.equal(160);
  });
});
