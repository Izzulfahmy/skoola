// file: frontend/src/api/connection.ts
import apiClient from './axiosInstance';

export interface ConnectionTestResult {
  latency: number;
  bandwidth: number; // in Mbps
}

export const testConnection = async (): Promise<ConnectionTestResult> => {
  const startTime = performance.now();
  let latency = 0;

  try {
    const response = await apiClient.get('/connection-test', {
      // onDownloadProgress event untuk mengukur latensi (Time To First Byte)
      onDownloadProgress: () => {
        if (latency === 0) {
          latency = performance.now() - startTime;
        }
      },
      responseType: 'arraybuffer', // Penting untuk menangani data biner
    });

    const endTime = performance.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    const sizeInBytes = response.data.byteLength;

    // Menghitung bandwidth dalam Megabit per detik (Mbps)
    const bandwidthInMbps = (sizeInBytes * 8) / (durationInSeconds * 1024 * 1024);

    return {
      latency: latency,
      bandwidth: bandwidthInMbps,
    };
  } catch (error) {
    console.error("Connection test failed:", error);
    throw error;
  }
};