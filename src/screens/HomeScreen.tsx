import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Avatar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { NotificationService } from '../services/NotificationService';

interface HomeScreenProps {
    navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const { user, logout } = useAuth();

    useEffect(() => {
        // Register for notifications on mount
        NotificationService.registerForPushNotificationsAsync();
    }, []);

    const menuItems = [
        {
            title: 'Scan Prescription',
            description: 'Use camera to extract medicines',
            icon: 'camera',
            screen: 'Scan',
            color: '#4A90E2',
        },
        {
            title: 'My Medicines',
            description: 'View and manage your list',
            icon: 'pill',
            screen: 'Medicines',
            color: '#50E3C2',
        },
        {
            title: 'Reminders',
            description: 'Set and view schedules',
            icon: 'alarm',
            screen: 'Reminder',
            color: '#F5A623',
        },
        {
            title: 'History',
            description: 'Track taken doses',
            icon: 'history',
            screen: 'History',
            color: '#BD10E0',
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Title style={styles.greeting}>Hello, {user?.name || 'User'}</Title>
                    <Text style={styles.subtitle}>Stay healthy and on time!</Text>
                </View>
                <Button onPress={logout} icon="logout" compact>Logout</Button>
            </View>

            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <Card
                        key={index}
                        style={styles.card}
                        onPress={() => navigation.navigate(item.screen)}
                    >
                        <Card.Content style={styles.cardContent}>
                            <Avatar.Icon size={48} icon={item.icon} style={{ backgroundColor: item.color }} />
                            <Title style={styles.cardTitle}>{item.title}</Title>
                            <Paragraph style={styles.cardDesc}>{item.description}</Paragraph>
                        </Card.Content>
                    </Card>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        color: '#666',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 16,
        elevation: 4,
        borderRadius: 12,
    },
    cardContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    cardTitle: {
        marginTop: 12,
        fontSize: 16,
        textAlign: 'center',
    },
    cardDesc: {
        fontSize: 12,
        textAlign: 'center',
        color: '#888',
        marginTop: 4,
    },
});
