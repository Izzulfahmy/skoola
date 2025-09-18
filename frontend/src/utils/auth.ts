// frontend/src/utils/auth.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role: string;
  exp: number;
  // tambahkan properti lain jika ada
}

export const getRoleFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.role;
  } catch (error) {
    console.error("Gagal decode token:", error);
    return null;
  }
};