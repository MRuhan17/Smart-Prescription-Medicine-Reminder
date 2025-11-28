// @ts-ignore - Expo Constants may not have expoConfig in all environments
import Constants from 'expo-constants';

const getApiBaseUrl = (): string => {
    // Try to get from Expo config (app.json/app.config.js extra field)
    const expoConfig = Constants.expoConfig || Constants.manifest;
    const configuredUrl = expoConfig?.extra?.apiBaseUrl;
    
    if (configuredUrl) {
        return configuredUrl;
    }
    
    // Default fallback - should be configured in production
    return 'http://localhost:8000';
};

export const Config = {
    apiBaseUrl: getApiBaseUrl(),
};
