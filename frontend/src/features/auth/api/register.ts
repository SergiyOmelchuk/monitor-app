import { axiosBase } from '@/lib/axios';
import type { AuthResponse, RegisterPayload } from '@/features/auth/types/auth.types';

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await axiosBase.post<AuthResponse>('/api/auth/register', payload);
  return data;
}
