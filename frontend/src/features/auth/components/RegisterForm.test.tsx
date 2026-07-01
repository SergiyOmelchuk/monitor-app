import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthProvider } from '@/features/auth/hooks/AuthProvider';
import { server } from '@/mocks/server';
import { registerConflictHandler } from '@/mocks/handlers/auth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockNavigate.mockReset();
});

describe('RegisterForm', () => {
  it('renders name, email, password fields and submit button', async () => {
    renderRegisterForm();

    expect(await screen.findByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('registers successfully and navigates to /user', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(await screen.findByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/user'));
  });

  it('shows a conflict message when the email already exists (409)', async () => {
    server.use(registerConflictHandler);
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(await screen.findByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'taken@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/an account with this email already exists/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('submits successfully without a name (name is optional)', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(await screen.findByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/user'));
  });
});
