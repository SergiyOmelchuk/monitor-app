import { Navigate, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useAuth } from '@/features/auth';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();

  // Already signed in — no need to register again.
  if (isAuthenticated) {
    return <Navigate to="/user" replace />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create account
      </Typography>
      <RegisterForm />
      <Typography sx={{ mt: 2 }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Log in
        </Link>
      </Typography>
    </Container>
  );
}
