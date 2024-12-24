import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorPage from '../components/ErrorPage';

describe('ErrorBoundary', () => {
  it('should render fallback UI when an error is thrown', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});

describe('ErrorPage', () => {
  it('should reload the page when the reload button is clicked', () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { reload: jest.fn() };

    render(<ErrorPage />);

    fireEvent.click(screen.getByText('Reload Page'));

    expect(window.location.reload).toHaveBeenCalled();

    window.location = originalLocation;
  });
});
