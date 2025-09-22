// file: frontend/src/api/tenants.ts
import apiClient from './axiosInstance';
import type { Tenant } from '../types';

// Tipe untuk input pendaftaran
export interface RegisterTenantInput {
  nama_sekolah: string;
  schema_name: string;
  admin_email: string;
  admin_pass: string;
  admin_name: string;
  naungan_id?: string;
}

// Tipe untuk input update email
export interface UpdateAdminEmailInput {
  email: string;
}

// Tipe untuk input reset password
export interface ResetAdminPasswordInput {
  password: string;
}

// Fungsi untuk mengambil semua data tenant
export const getTenants = async (): Promise<Tenant[]> => {
	try {
		const response = await apiClient.get('/tenants');
		return response.data;
	} catch (error) {
		throw error;
	}
};

// --- FUNGSI BARU UNTUK MENGAMBIL SEKOLAH TANPA NAUNGAN ---
export const getTenantsWithoutNaungan = async (): Promise<Tenant[]> => {
  try {
    const response = await apiClient.get('/tenants/without-naungan');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendaftarkan tenant baru
export const registerTenant = async (data: RegisterTenantInput) => {
  try {
    const response = await apiClient.post('/tenants/register', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk update email admin
export const updateAdminEmail = async (schemaName: string, data: UpdateAdminEmailInput) => {
  try {
    const response = await apiClient.put(`/tenants/${schemaName}/admin-email`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk reset password admin
export const resetAdminPassword = async (schemaName: string, data: ResetAdminPasswordInput) => {
  try {
    const response = await apiClient.put(`/tenants/${schemaName}/admin-password`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk menghapus tenant
export const deleteTenant = async (schemaName: string): Promise<void> => {
  try {
    await apiClient.delete(`/tenants/${schemaName}`);
  } catch (error) {
    throw error;
  }
};