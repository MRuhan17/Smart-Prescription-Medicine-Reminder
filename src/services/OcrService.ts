import ApiService from './ApiService';
import { OcrResult } from '../types';

export const OcrService = {
    processImage: async (imageUri: string): Promise<{ data: OcrResult }> => {
        // In a real app, we would upload the image to the backend or use on-device ML Kit
        // FormData implementation:
        // const formData = new FormData();
        // formData.append('image', { uri: imageUri, name: 'prescription.jpg', type: 'image/jpeg' });
        // return ApiService.post('/ocr', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        // Mock response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        text: "Rx\nAmoxicillin 500mg\nTake 1 tablet every 8 hours\n\nIbuprofen 400mg\nTake 1 tablet as needed",
                        medicines: [
                            { name: 'Amoxicillin', dosage: '500mg', frequency: 'daily', time: '08:00 AM' },
                            { name: 'Ibuprofen', dosage: '400mg', frequency: 'custom', time: '10:00 AM' },
                        ]
                    }
                });
            }, 2000);
        });
    }
};
