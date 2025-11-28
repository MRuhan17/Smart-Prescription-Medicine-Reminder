import { HistoryItem } from '../types';

// Mock data
const history: HistoryItem[] = [
    { id: 1, medicineName: 'Amoxicillin', dosage: '500mg', time: '2023-10-27T08:00:00', status: 'taken' },
    { id: 2, medicineName: 'Ibuprofen', dosage: '400mg', time: '2023-10-27T10:00:00', status: 'missed' },
    { id: 3, medicineName: 'Amoxicillin', dosage: '500mg', time: '2023-10-26T08:00:00', status: 'taken' },
];

export const HistoryService = {
    getHistory: async (): Promise<{ data: HistoryItem[] }> => {
        // In real app: return ApiService.get('/history');
        return new Promise((resolve) => {
            setTimeout(() => resolve({ data: history }), 500);
        });
    },
};
