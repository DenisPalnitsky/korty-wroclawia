import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ClubViewer from './ClubViewer';
import { CourtPricingSystem } from '../CourtPricingSystem';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

const mockPricingSystem = new CourtPricingSystem([
  {
    id: 'club1',
    name: 'Club A',
    address: 'Address A',
    googleMapsLink: 'https://maps.app.goo.gl/1',
    website: 'https://example.com',
    courts: [
      {
        surface: 'hard',
        type: 'indoor',
        courts: ['1'],
        prices: [
          {
            from: '2024-01-01',
            to: '2024-12-31',
            schedule: { "*:7-22": "100" }
          }
        ]
      }
    ]
  },
  {
    id: 'club2',
    name: 'Club B',
    address: 'Address B',
    googleMapsLink: 'https://maps.app.goo.gl/2',
    website: 'https://example.com',
    courts: [
      {
        surface: 'clay',
        type: 'outdoor',
        courts: ['2'],
        prices: [
          {
            from: '2024-01-01',
            to: '2024-12-31',
            schedule: { "*:7-22": "80" }
          }
        ]
      }
    ]
  }
]);

describe('ClubViewer', () => {
  test('default sorting is by name', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ClubViewer pricingSystem={mockPricingSystem} isMobile={false} />
      </I18nextProvider>
    );

    const clubNames = screen.getAllByRole('link', { name: /Club/ }).map(link => link.textContent);
    expect(clubNames).toEqual(['Club A', 'Club B']);
  });

  test('sorts by price', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ClubViewer pricingSystem={mockPricingSystem} isMobile={false} />
      </I18nextProvider>
    );

    fireEvent.mouseDown(screen.getByLabelText('Sort By'));
    fireEvent.click(screen.getByText('By Price'));

    const clubNames = screen.getAllByRole('link', { name: /Club/ }).map(link => link.textContent);
    expect(clubNames).toEqual(['Club B', 'Club A']);
  });

  test('internationalized text', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ClubViewer pricingSystem={mockPricingSystem} isMobile={false} />
      </I18nextProvider>
    );

    expect(screen.getByLabelText('Select Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    expect(screen.getByText('Show Closed Courts')).toBeInTheDocument();
  });
});
