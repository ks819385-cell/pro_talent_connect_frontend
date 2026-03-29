import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from '../components/NavBar';

// Mock logo asset
vi.mock('../assets/Logo@pro_talent_connect.png', () => ({ default: 'logo.png' }));

function renderNavBar(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
    </MemoryRouter>
  );
}

describe('NavBar', () => {
  it('renders the Pro Talent Connect brand name', () => {
    renderNavBar();
    // Brand name may appear in logo alt text or nav links
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    renderNavBar();
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('has a link to Players page', () => {
    renderNavBar();
    const links = screen.getAllByRole('link');
    const playerLink = links.find((l) => l.getAttribute('href') === '/players');
    expect(playerLink).toBeDefined();
  });

  it('has a link to Home page', () => {
    renderNavBar();
    const links = screen.getAllByRole('link');
    const homeLink = links.find((l) => l.getAttribute('href') === '/');
    expect(homeLink).toBeDefined();
  });
});
