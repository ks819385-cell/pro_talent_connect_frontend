import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminActivation from '../pages/AdminActivation';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  fetchCsrfToken: vi.fn().mockResolvedValue(undefined),
  api: {
    resendActivationOtp: vi.fn(),
    activateAdmin: vi.fn(),
  },
}));

vi.mock('../components/common/FloatingShapes', () => ({
  default: () => null,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminActivation />
    </MemoryRouter>
  );
}

describe('AdminActivation page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('submits activation form and redirects to dashboard', async () => {
    localStorage.setItem('pendingActivationEmail', 'invite@test.com');
    api.activateAdmin.mockResolvedValueOnce({
      data: {
        token: 'mock-token',
        _id: 'a1',
        name: 'Invited Admin',
        email: 'invite@test.com',
        role: 'Admin',
        activation_required: false,
      },
    });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: 'Invited Admin' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter 6-digit OTP/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter new password/i), {
      target: { value: 'Strong@123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Confirm new password/i), {
      target: { value: 'Strong@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /activate account/i }));

    await waitFor(() => {
      expect(api.activateAdmin).toHaveBeenCalledWith({
        email: 'invite@test.com',
        name: 'Invited Admin',
        otp: '123456',
        newPassword: 'Strong@123',
        confirmPassword: 'Strong@123',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    expect(localStorage.getItem('adminSession')).toBe('1');
  });
});
