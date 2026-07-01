import { axiosAuth } from '@/lib/axios';

interface LogoutResponse {
  message: string;
}

export async function logout(refreshToken: string): Promise<LogoutResponse> {
  const { data } = await axiosAuth.post<LogoutResponse>('/api/auth/logout', {
    refreshToken,
  });
  return data;
}
