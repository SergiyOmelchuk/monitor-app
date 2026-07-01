import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthProvider } from '@/features/auth/hooks/AuthProvider';
import { server } from '@/mocks/server';
import { loginErrorHandler, mockTokens, mockUser } from '@/mocks/handlers/auth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockNavigate.mockReset();
});

describe('LoginForm', () => {
  it('renders email field, password field and submit button', async () => {
    renderLoginForm();

    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('logs in successfully and navigates to /user', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(await screen.findByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/user'));
  });

  it('shows an error alert with the API message on invalid credentials', async () => {
    server.use(loginErrorHandler);
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(await screen.findByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/invalid email or password/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows a loading state while the request is in flight', async () => {
    server.use(
      http.post('*/api/auth/login', async () => {
        await delay(100);
        return HttpResponse.json({ user: mockUser, tokens: mockTokens }, { status: 200 });
      }),
    );
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(await screen.findByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/user'));
  });
});
