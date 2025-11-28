import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, Title, HelperText } from 'react-native-paper';
import { MedicineService } from '../services/MedicineService';
import { NotificationService } from '../services/NotificationService';
import { Medicine } from '../types';

export default function ReminderScreen({ navigation, route }: { navigation: any, route: any }) {
    const medicineToEdit: Medicine | undefined = route.params?.medicine;

    const [name, setName] = useState(medicineToEdit?.name || '');
    const [dosage, setDosage] = useState(medicineToEdit?.dosage || '');
    const [frequency, setFrequency] = useState<string>(medicineToEdit?.frequency || 'daily');
    const [time, setTime] = useState(medicineToEdit?.time || '08:00 AM');
    const [loading, setLoading] = useState(false);

    const hasTimeError = () => {
        // Simple regex for HH:MM AM/PM
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] [AP]M$/;
        return !timeRegex.test(time);
    };

    const handleSave = async () => {
        if (!name || !dosage || !time) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (hasTimeError()) {
            Alert.alert('Error', 'Invalid time format. Use HH:MM AM/PM (e.g., 08:30 AM)');
            return;
        }

        setLoading(true);
        try {
            const medicineData: Partial<Medicine> = {
                name,
                dosage,
                frequency: frequency as 'daily' | 'weekly' | 'custom',
                time
            };

            if (medicineToEdit) {
                await MedicineService.update(medicineToEdit.id, medicineData);
                Alert.alert('Success', `${name} updated successfully`);
            } else {
                await MedicineService.add(medicineData);
                Alert.alert('Success', `${name} added successfully`);
            }

            // Schedule local notification
            await NotificationService.scheduleNotification(
                `Time for your ${name}`,
                `Take ${dosage} now!`,
                { seconds: 5 } // Mock trigger: 5 seconds from now
            );

            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save reminder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.title}>{medicineToEdit ? 'Edit Medicine' : 'Add Medicine'}</Title>

            <TextInput
                label="Medicine Name *"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Amoxicillin"
            />

            <TextInput
                label="Dosage *"
                value={dosage}
                onChangeText={setDosage}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., 500mg"
            />

            <Text style={styles.label}>Frequency</Text>
            <SegmentedButtons
                value={frequency}
                onValueChange={setFrequency}
                buttons={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'custom', label: 'Custom' },
                ]}
                style={styles.input}
            />

            <TextInput
                label="Time *"
                value={time}
                onChangeText={setTime}
                mode="outlined"
                style={styles.input}
                placeholder="HH:MM AM/PM"
                error={time.length > 0 && hasTimeError()}
            />
            <HelperText type="error" visible={time.length > 0 && hasTimeError()}>
                Format: HH:MM AM/PM (e.g., 08:30 AM)
            </HelperText>

            <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.button}
            >
                {medicineToEdit ? 'Update Reminder' : 'Save Reminder'}
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: '#4A90E2',
    },
    input: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        color: '#333',
    },
    button: {
        marginTop: 10,
        paddingVertical: 6,
    },
});
