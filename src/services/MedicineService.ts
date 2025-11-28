import { Medicine } from '../types';

// Mock data
let medicines: Medicine[] = [
    { id: 1, name: 'Amoxicillin', dosage: '500mg', frequency: 'daily', time: '08:00 AM' },
    { id: 2, name: 'Ibuprofen', dosage: '400mg', frequency: 'custom', time: '10:00 AM' },
];

export const MedicineService = {
    getAll: async (): Promise<{ data: Medicine[] }> => {
        // return ApiService.get('/medicines');
        return new Promise((resolve) => {
            setTimeout(() => resolve({ data: medicines }), 500);
        });
    },

    add: async (medicine: Partial<Medicine>): Promise<{ data: Medicine }> => {
        // return ApiService.post('/medicines', medicine);
        return new Promise((resolve) => {
            const newMed: Medicine = {
                id: medicines.length + 1,
                name: medicine.name || '',
                dosage: medicine.dosage || '',
                frequency: medicine.frequency || 'daily',
                time: medicine.time || '09:00 AM',
            };
            medicines.push(newMed);
            setTimeout(() => resolve({ data: newMed }), 500);
        });
    },

    update: async (id: number, medicine: Partial<Medicine>): Promise<{ data: Partial<Medicine> }> => {
        // return ApiService.put(`/medicines/${id}`, medicine);
        return new Promise((resolve) => {
            medicines = medicines.map(m => m.id === id ? { ...m, ...medicine } : m);
            setTimeout(() => resolve({ data: medicine }), 500);
        });
    },

    delete: async (id: number): Promise<{ success: boolean }> => {
        // return ApiService.delete(`/medicines/${id}`);
        return new Promise((resolve) => {
            medicines = medicines.filter(m => m.id !== id);
            setTimeout(() => resolve({ success: true }), 500);
        });
    },
};
