import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/Footer';

// Mock assets and context
vi.mock('../assets/Logo@pro_talent_connect.png', () => ({ default: 'logo.png' }));
vi.mock('../context/AboutContext', () => ({
  useAbout: () => ({
    about: null,
    loading: false,
  }),
}));

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('renders without crashing', () => {
    renderFooter();
  });

  it('contains navigation links', () => {
    renderFooter();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('shows copyright text', () => {
    renderFooter();
    expect(screen.getByText(/Pro Talent Connect/i)).toBeInTheDocument();
  });
});
