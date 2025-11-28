export interface User {
    id: number;
    email: string;
    name: string;
}

export interface Medicine {
    id: number;
    name: string;
    dosage: string;
    frequency: 'daily' | 'weekly' | 'custom';
    time: string; // Format: HH:mm AM/PM
}

export interface HistoryItem {
    id: number;
    medicineName: string;
    dosage: string;
    time: string; // ISO string
    status: 'taken' | 'missed' | 'skipped';
}

export interface OcrResult {
    text: string;
    medicines: Partial<Medicine>[];
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ApiError {
    message: string;
}
