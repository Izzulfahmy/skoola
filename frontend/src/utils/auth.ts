// file: frontend/src/utils/auth.ts
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

/**
 * Mendapatkan inisial dari nama lengkap.
 * Contoh: "Budi Santoso" -> "BS"
 */
// Fix: 2305 - Menambahkan getInitials
export const getInitials = (name: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  const initials = parts[0][0] + parts[parts.length - 1][0];
  return initials.toUpperCase();
};