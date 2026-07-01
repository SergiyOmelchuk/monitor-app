import { axiosBase } from '@/lib/axios';
import type { AuthResponse, LoginPayload } from '@/features/auth/types/auth.types';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await axiosBase.post<AuthResponse>('/api/auth/login', payload);
  return data;
}
