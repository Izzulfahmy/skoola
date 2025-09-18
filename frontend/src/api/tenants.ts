// file: frontend/src/api/tenants.ts
import apiClient from './axiosInstance';
import type { Tenant } from '../types'; // <-- Impor tipe Tenant ditambahkan

// Definisikan tipe data untuk input form
export interface RegisterTenantInput {
  nama_sekolah: string;
  schema_name: string;
  admin_email: string;
  admin_pass: string;
  admin_name: string;
}

// --- FUNGSI BARU DITAMBAHKAN DI SINI ---
export const getTenants = async (): Promise<Tenant[]> => {
	try {
		const response = await apiClient.get('/tenants');
		return response.data;
	} catch (error) {
		throw error;
	}
};

// Fungsi untuk memanggil endpoint pendaftaran tenant
export const registerTenant = async (data: RegisterTenantInput) => {
  try {
    const response = await apiClient.post('/tenants/register', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};