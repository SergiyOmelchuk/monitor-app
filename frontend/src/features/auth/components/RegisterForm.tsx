import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { ApiErrorResponse, RegisterPayload } from '@/features/auth/types/auth.types';

const GENERIC_ERROR = 'Unable to create account. Please try again.';
const CONFLICT_ERROR = 'An account with this email already exists.';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.status === 409) {
      return CONFLICT_ERROR;
    }
    return error.response?.data?.message ?? GENERIC_ERROR;
  }
  return GENERIC_ERROR;
}

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: RegisterPayload = { email, password };
    if (name.trim().length > 0) {
      payload.name = name.trim();
    }

    try {
      await register(payload);
      navigate('/user');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}
    >
      <TextField
        label="Full name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        fullWidth
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        fullWidth
      />
      <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
        Create account
      </LoadingButton>
      {error !== null && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
