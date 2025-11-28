import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';
import { theme } from './src/utils/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import MedicineListScreen from './src/screens/MedicineListScreen';
import ReminderScreen from './src/screens/ReminderScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
);

const AppStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Scan Prescription' }} />
        <Stack.Screen name="Medicines" component={MedicineListScreen} options={{ title: 'My Medicines' }} />
        <Stack.Screen name="Reminder" component={ReminderScreen} options={{ title: 'Set Reminder' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Dose History' }} />
    </Stack.Navigator>
);

const RootNavigator = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <PaperProvider theme={theme}>
                <RootNavigator />
            </PaperProvider>
        </AuthProvider>
    );
}
