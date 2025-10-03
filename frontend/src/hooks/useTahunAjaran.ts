// file: frontend/src/hooks/useTahunAjaran.ts
import { useState, useEffect } from 'react';
import { getAllTahunAjaran } from '../api/tahunAjaran';
import type { TahunAjaran } from '../types';
import { message } from 'antd';

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
      try {
        setActiveTahunAjaranState(JSON.parse(savedActiveTa));
      } catch (e) {
        console.error("Gagal mem-parsing tahun ajaran dari localStorage", e);
        localStorage.removeItem('activeTahunAjaran');
      }
    }
  }, []);

  // 2. Fungsi untuk mengubah tahun ajaran aktif dan menyimpannya
  const setActiveTahunAjaran = (ta: TahunAjaranOption) => {
    setActiveTahunAjaranState(ta);
    localStorage.setItem('activeTahunAjaran', JSON.stringify(ta));
    message.success(`Tahun Ajaran Aktif diubah ke: ${ta.nama}`, 1);
  };

  // 3. Fetch data dari API (hanya sekali saat komponen dimuat)
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const data = await getAllTahunAjaran();
        const taList = (data || []).map(getOptionFromTA);
        setOptions(taList);

        if (taList.length > 0) {
          const aktifDariAPI = taList.find(ta => ta.status === 'Aktif');
          
          // Prioritaskan state saat ini (dari localStorage), jika tidak ada, gunakan yang aktif dari API, atau yang pertama
          const currentActiveId = activeTahunAjaran?.id;
          const toSet = currentActiveId && taList.some(t => t.id === currentActiveId)
            ? taList.find(t => t.id === currentActiveId)
            : aktifDariAPI || taList[0];

          if (toSet) {
            // Langsung set state. Jika berbeda, `setActiveTahunAjaran` akan menanganinya
            setActiveTahunAjaranState(toSet);
          }
        }
      } catch (err) {
        console.error("Gagal memuat daftar tahun ajaran:", err);
        message.error("Gagal memuat daftar tahun ajaran");
      }
    };

    fetchTahunAjaran();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- DEPENDENCY DIHAPUS UNTUK MENCEGAH LOOP

  return { activeTahunAjaran, tahunAjaranOptions: options, setActiveTahunAjaran };
};