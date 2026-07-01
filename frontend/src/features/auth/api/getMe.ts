import { axiosAuth } from '@/lib/axios';
import type { MeResponse } from '@/features/auth/types/auth.types';

export async function getMe(): Promise<MeResponse> {
  const { data } = await axiosAuth.get<MeResponse>('/api/auth/me');
  return data;
}
