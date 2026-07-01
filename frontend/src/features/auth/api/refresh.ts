import { axiosBase } from '@/lib/axios';
import type { RefreshResponse } from '@/features/auth/types/auth.types';

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await axiosBase.post<RefreshResponse>('/api/auth/refresh', {
    refreshToken,
  });
  return data;
}
