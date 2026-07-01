import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers/auth';

export const server = setupServer(...handlers);
