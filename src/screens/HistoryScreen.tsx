import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { List, Text, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { HistoryService } from '../services/HistoryService';
import { format } from 'date-fns';
import { HistoryItem } from '../types';

export default function HistoryScreen() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        try {
            const response = await HistoryService.getHistory();
            setHistory(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadHistory();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'taken': return '#4CAF50';
            case 'missed': return '#F44336';
            case 'skipped': return '#FF9800';
            default: return '#757575';
        }
    };

    if (loading && !refreshing) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.medicineName}
                        description={`${item.dosage} - ${format(new Date(item.time), 'MMM dd, hh:mm a')}`}
                        left={props => <List.Icon {...props} icon="history" />}
                        right={props => (
                            <Chip
                                mode="outlined"
                                textStyle={{ color: getStatusColor(item.status) }}
                                style={{ borderColor: getStatusColor(item.status) }}
                            >
                                {item.status.toUpperCase()}
                            </Chip>
                        )}
                        style={styles.item}
                    />
                )}
                ItemSeparatorComponent={() => <Divider />}
                ListEmptyComponent={<Text style={styles.emptyText}>No history available.</Text>}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
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
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#888',
    },
});
