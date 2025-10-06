import { useEffect } from 'react';
import type { PenugasanUjian, GroupedPesertaUjian } from '../../types';

interface DebugPesertaProps {
  penugasan: PenugasanUjian[];
  data: GroupedPesertaUjian | undefined;
  ujianMasterId: string;
}

export const DebugPesertaUjian: React.FC<DebugPesertaProps> = ({
  penugasan,
  data,
  ujianMasterId
}) => {
  useEffect(() => {
    console.group('🐛 DEBUG PESERTA UJIAN');
    console.log('Ujian Master ID:', ujianMasterId);
    console.log('Penugasan data:', penugasan);
    console.log('Grouped peserta data:', data);
    
    // Check for potential issues
    if (penugasan.length === 0) {
      console.warn('⚠️ Penugasan array is empty');
    }
    
    penugasan.forEach((p, index) => {
      if (!p.kelas_id || p.kelas_id.trim() === '') {
        console.error(`❌ Missing kelas_id at penugasan[${index}]:`, p);
      }
      if (!p.nama_kelas || p.nama_kelas.trim() === '') {
        console.error(`❌ Missing nama_kelas at penugasan[${index}]:`, p);
      }
    });
    
    if (data) {
      Object.keys(data).forEach(namaKelas => {
        const matchingPenugasan = penugasan.find(p => p.nama_kelas === namaKelas);
        if (!matchingPenugasan) {
          console.error(`❌ No penugasan found for class: ${namaKelas}`);
        } else if (!matchingPenugasan.kelas_id) {
          console.error(`❌ No kelas_id for class: ${namaKelas}`, matchingPenugasan);
        }
      });
    }
    
    console.groupEnd();
  }, [penugasan, data, ujianMasterId]);

  // This component doesn't render anything visible
  return null;
};

export default DebugPesertaUjian;