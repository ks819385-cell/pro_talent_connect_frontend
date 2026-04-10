import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { api } from '../services/api';

// Mock the api module
vi.mock('../services/api', () => ({
  fetchCsrfToken: vi.fn().mockResolvedValue(undefined),
  api: {
    login: vi.fn(),
  },
}));

// Mock FloatingShapes (canvas/animation heavy)
vi.mock('../components/common/FloatingShapes', () => ({
  default: () => null,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders heading and form fields', () => {
    renderLogin();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('does NOT show demo credentials', () => {
    renderLogin();
    expect(screen.queryByText(/Demo Credentials/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SuperAdmin@123/i)).not.toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    api.login.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/admin@example\.com/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('redirects to /admin on successful login', async () => {
    api.login.mockResolvedValueOnce({
      data: { token: 'mock-token', admin: { name: 'Admin' } },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/admin@example\.com/i), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('redirects to /admin-activate when activation is required', async () => {
    api.login.mockRejectedValueOnce({
      response: {
        data: {
          code: 'ACTIVATION_REQUIRED',
          activationRequired: true,
          email: 'invite@test.com',
        },
      },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/admin@example\.com/i), {
      target: { value: 'invite@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin-activate', {
        state: { email: 'invite@test.com' },
      });
    });

    expect(localStorage.getItem('pendingActivationEmail')).toBe('invite@test.com');
  });

  it('toggles password visibility', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the toggle button (eye icon button)
    const toggleBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('redirects to /admin if already logged in', () => {
    localStorage.setItem('adminSession', '1');
    renderLogin();
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });
});
