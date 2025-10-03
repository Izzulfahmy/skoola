import { useState, useEffect } from 'react';
import { getAllTahunAjaran } from '../api/tahunAjaran';
// --- PERBAIKAN FINAL: Impor TahunAjaran dan TahunAjaranOption dari types ---
import type { TahunAjaran, TahunAjaranOption } from '../types';
import { message } from 'antd';

// --- HAPUS INTERFACE LOKAL KARENA SUDAH PINDAH KE src/types/index.ts ---
// interface TahunAjaranOption {
//   id: string;
//   nama: string;
//   status: 'Aktif' | 'Tidak Aktif';
// }

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

  // 1. Ambil dari localStorage saat inisialisasi awal
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
    message.success(`Tahun Ajaran Aktif diubah ke: ${ta.nama}`, 1.5);
  };

  // 3. Fetch data dari API dan sinkronisasi dengan state
  useEffect(() => {
    const fetchAndSyncTahunAjaran = async () => {
      try {
        const data = await getAllTahunAjaran();
        const taList = (data || []).map(getOptionFromTA);
        setOptions(taList);

        if (taList.length > 0) {
          const aktifDariAPI = taList.find(ta => ta.status === 'Aktif');
          const savedTaString = localStorage.getItem('activeTahunAjaran');
          
          let toSet: TahunAjaranOption | undefined | null = null;
          
          if (savedTaString) {
            const savedTa = JSON.parse(savedTaString);
            // Pastikan TA yang tersimpan masih ada di list dari API
            toSet = taList.find(t => t.id === savedTa.id);
          }
          
          // Jika tidak ada yang tersimpan atau yang tersimpan tidak valid, gunakan dari API atau yang pertama
          if (!toSet) {
            toSet = aktifDariAPI || taList[0];
          }

          if (toSet) {
            // Update state dan localStorage untuk sinkronisasi
            setActiveTahunAjaranState(toSet);
            localStorage.setItem('activeTahunAjaran', JSON.stringify(toSet));
          }
        }
      } catch (err) {
        console.error("Gagal memuat daftar tahun ajaran:", err);
        message.error("Gagal memuat daftar tahun ajaran");
      }
    };

    fetchAndSyncTahunAjaran();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- Dijalankan hanya sekali untuk mencegah loop

  return { activeTahunAjaran, tahunAjaranOptions: options, setActiveTahunAjaran };
};