// file: frontend/src/hooks/useTahunAjaran.ts
import { useState, useEffect } from 'react';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import type { TahunAjaran } from '../types';
import { message } from 'antd'; // Import message for better user experience

interface TahunAjaranOption {
  id: string;
  nama: string;
  status: 'Aktif' | 'Tidak Aktif';
}

interface UseTahunAjaran {
  activeTahunAjaran: TahunAjaranOption | null;
  tahunAjaranOptions: TahunAjaranOption[];
  setActiveTahunAjaran: (ta: TahunAjaranOption) => void;
}

const getOptionFromTA = (ta: TahunAjaran): TahunAjaranOption => ({
  id: ta.id,
  nama: `${ta.nama_tahun_ajaran} - ${ta.semester}`,
  status: ta.status,
});

export const useTahunAjaran = (): UseTahunAjaran => {
  const [activeTahunAjaran, setActiveTahunAjaranState] = useState<TahunAjaranOption | null>(null);
  const [options, setOptions] = useState<TahunAjaranOption[]>([]);
  
  // 1. Ambil dari localStorage saat inisialisasi
  useEffect(() => {
    const savedActiveTa = localStorage.getItem('activeTahunAjaran');
    if (savedActiveTa) {
      setActiveTahunAjaranState(JSON.parse(savedActiveTa));
    }
  }, []);

  // 2. Simpan ke localStorage saat berubah
  const setActiveTahunAjaran = (ta: TahunAjaranOption) => {
    setActiveTahunAjaranState(ta);
    localStorage.setItem('activeTahunAjaran', JSON.stringify(ta));
    message.success(`Tahun Ajaran Aktif diubah ke: ${ta.nama}`, 1);
  };
  
  // 3. Fetch data dari API
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const data = await getAllTahunAjaran();
        const taList = (data || []).map(getOptionFromTA);
        setOptions(taList);

        if (taList.length > 0) {
          const aktif = taList.find(ta => ta.status === 'Aktif');
          
          // Tentukan mana yang harus di-set sebagai aktif
          const toSet = activeTahunAjaran // 1. Periksa state yang tersimpan (jika ada)
            ? taList.find(t => t.id === activeTahunAjaran.id) || aktif || taList[0] // 2. Cari di list baru, atau pakai yang aktif API, atau yang pertama
            : aktif || taList[0]; // 3. Jika belum ada state, pakai yang aktif API atau yang pertama
          
          if (toSet) {
              // Jika data ditemukan, set state tanpa mengubah localStorage lagi (hanya update state)
              setActiveTahunAjaranState(toSet); 
          }
        }

      } catch (err) {
        console.error("Gagal memuat daftar tahun ajaran:", err);
      }
    };

    fetchTahunAjaran();
  }, [activeTahunAjaran?.id]); // Dependency hanya pada ID agar tidak loop tak terbatas

  return { activeTahunAjaran, tahunAjaranOptions: options, setActiveTahunAjaran };
};