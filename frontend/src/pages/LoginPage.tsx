import { Navigate, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/features/auth';

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  // Returning users with a session skip the form and go straight to /user.
  if (isAuthenticated) {
    return <Navigate to="/user" replace />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Log in
      </Typography>
      <LoginForm />
      <Typography sx={{ mt: 2 }}>
        Need an account?{' '}
        <Link component={RouterLink} to="/register">
          Create one
        </Link>
      </Typography>
    </Container>
  );
}
