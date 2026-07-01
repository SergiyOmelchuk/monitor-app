import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { useRequireAuth } from '@/features/auth';

function formatDate(value?: string): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function UserPage() {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, logout } = useRequireAuth();

  async function handleLogout(): Promise<void> {
    await logout();
    navigate('/login');
  }

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // The guard in useRequireAuth navigates to /login; render nothing meanwhile.
  if (!isAuthenticated || user === null) {
    return null;
  }

  const fields: ReadonlyArray<{ label: string; value: string }> = [
    { label: 'ID', value: user.id },
    { label: 'Email', value: user.email },
    { label: 'Name', value: user.name ?? '—' },
    { label: 'Member since', value: formatDate(user.createdAt) },
  ];

  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{initial}</Avatar>
        <Typography variant="h4" component="h1">
          User
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack divider={<Divider flexItem />} spacing={2}>
          {fields.map((field) => (
            <Stack key={field.label} spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {field.label}
              </Typography>
              <Typography variant="body1">{field.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Button variant="outlined" color="error" onClick={handleLogout} sx={{ mt: 3 }}>
        Log out
      </Button>
    </Container>
  );
}
