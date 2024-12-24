import { render, screen } from '@testing-library/react';
import MapTab from '../components/MapTab';
import courtsData from '../assets/courts.yaml';

describe('MapTab Component', () => {
  test('renders map container', () => {
    render(<MapTab />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  test('displays markers for each court', () => {
    render(<MapTab />);
    courtsData.forEach((court) => {
      const marker = screen.getByTitle(court.name);
      expect(marker).toBeInTheDocument();
    });
  });

  test('displays info windows with court details and prices', () => {
    render(<MapTab />);
    courtsData.forEach((court) => {
      const marker = screen.getByTitle(court.name);
      marker.click();
      const infoWindow = screen.getByText(court.name);
      expect(infoWindow).toBeInTheDocument();
      expect(screen.getByText(court.address)).toBeInTheDocument();
      court.prices.forEach((price) => {
        expect(screen.getByText(`${price.from} - ${price.to}: ${price.schedule}`)).toBeInTheDocument();
      });
    });
  });
});
