import axios, { AxiosError } from 'axios';
import { Config } from '../utils/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const ApiService = axios.create({
    baseURL: Config.apiBaseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
ApiService.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling
ApiService.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response) {
            // Server responded with error status
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    Alert.alert('Session Expired', 'Please login again.');
                    break;
                case 403:
                    Alert.alert('Access Denied', 'You do not have permission for this action.');
                    break;
                case 500:
                    Alert.alert('Server Error', 'Something went wrong. Please try again later.');
                    break;
                default:
                    console.error('API Error:', error.response.data);
            }
        } else if (error.request) {
            // Request made but no response
            Alert.alert('Network Error', 'Please check your internet connection.');
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default ApiService;
