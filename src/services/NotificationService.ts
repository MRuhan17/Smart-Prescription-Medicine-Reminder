import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const NotificationService = {
    registerForPushNotificationsAsync: async (): Promise<string | undefined> => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Failed to get push token for push notification!');
                return undefined;
            }

            // In real app with a backend: 
            // const token = (await Notifications.getExpoPushTokenAsync()).data;
            const token = 'mock-expo-push-token';

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            return token;
        } catch (error) {
            console.error('Error registering for notifications:', error);
            return undefined;
        }
    },

    scheduleNotification: async (
        title: string,
        body: string,
        trigger: Notifications.NotificationTriggerInput
    ): Promise<string | undefined> => {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger,
            });
            return notificationId;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return undefined;
        }
    },
};
