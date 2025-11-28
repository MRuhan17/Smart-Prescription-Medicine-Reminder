import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { List, FAB, IconButton, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { MedicineService } from '../services/MedicineService';
import { Medicine } from '../types';

export default function MedicineListScreen({ navigation }: { navigation: any }) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadMedicines = async () => {
        try {
            const response = await MedicineService.getAll();
            setMedicines(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load medicines');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            loadMedicines();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadMedicines();
    }, []);

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Medicine',
            'Are you sure you want to delete this medicine?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await MedicineService.delete(id);
                        loadMedicines();
                    }
                },
            ]
        );
    };

    if (loading && !refreshing) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={medicines}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.name}
                        description={`${item.dosage} - ${item.frequency} @ ${item.time}`}
                        left={props => <List.Icon {...props} icon="pill" color="#4A90E2" />}
                        right={props => (
                            <View style={{ flexDirection: 'row' }}>
                                <IconButton icon="pencil" onPress={() => navigation.navigate('Reminder', { medicine: item })} />
                                <IconButton icon="delete" onPress={() => handleDelete(item.id)} />
                            </View>
                        )}
                        style={styles.item}
                    />
                )}
                ItemSeparatorComponent={() => <Divider />}
                ListEmptyComponent={<Text style={styles.emptyText}>No medicines added yet.</Text>}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('Reminder')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        backgroundColor: '#fff',
        paddingVertical: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#4A90E2',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#888',
    },
});
