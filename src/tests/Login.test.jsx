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

function getLoginInputs() {
  const emailInput = screen.getAllByPlaceholderText(/admin@example\.com/i)[0];
  const passwordInput = screen.getAllByPlaceholderText(/Enter your password/i)[0];
  return { emailInput, passwordInput };
}

function getSignInButton() {
  return screen.getAllByRole('button', { name: /sign in/i })[0];
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders heading and form fields', () => {
    renderLogin();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(getLoginInputs().emailInput).toBeInTheDocument();
    expect(getLoginInputs().passwordInput).toBeInTheDocument();
    expect(getSignInButton()).toBeInTheDocument();
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
    const { emailInput, passwordInput } = getLoginInputs();

    fireEvent.change(emailInput, {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(getSignInButton());

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('redirects to /admin on successful login', async () => {
    api.login.mockResolvedValueOnce({
      data: { token: 'mock-token', admin: { name: 'Admin' } },
    });

    renderLogin();
    const { emailInput, passwordInput } = getLoginInputs();

    fireEvent.change(emailInput, {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'Password123' },
    });
    fireEvent.click(getSignInButton());

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
    const { passwordInput } = getLoginInputs();

    fireEvent.change(getLoginInputs().emailInput, {
      target: { value: 'invite@test.com' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'Password123!' },
    });
    fireEvent.click(getSignInButton());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin-activate', {
        state: { email: 'invite@test.com' },
      });
    });

    expect(localStorage.getItem('pendingActivationEmail')).toBe('invite@test.com');
  });

  it('toggles password visibility', () => {
    renderLogin();
    const { passwordInput } = getLoginInputs();
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the toggle button (eye icon button)
    const toggleBtn = screen.getAllByRole('button', { name: '' })[0];
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('redirects to /admin if already logged in', () => {
    localStorage.setItem('adminSession', '1');
    renderLogin();
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });
});
