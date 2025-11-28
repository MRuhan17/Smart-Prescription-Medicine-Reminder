import { AuthResponse } from '../types';

// Mock implementation for now
export const AuthService = {
    login: async (email: string, password: string): Promise<{ data: AuthResponse }> => {
        // In real app: return axios.post(`${Config.apiBaseUrl}/auth/login`, { email, password });
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        token: 'mock-jwt-token',
                        user: { id: 1, email, name: 'John Doe' },
                    },
                });
            }, 1000);
        });
    },

    signup: async (email: string, password: string, name: string): Promise<{ data: AuthResponse }> => {
        // In real app: return axios.post(`${Config.apiBaseUrl}/auth/signup`, { email, password, name });
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        token: 'mock-jwt-token',
                        user: { id: 1, email, name },
                    },
                });
            }, 1000);
        });
    },
};
