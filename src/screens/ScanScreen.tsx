import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Card, TextInput, Title } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { OcrService } from '../services/OcrService';
import { MedicineService } from '../services/MedicineService';
import { Medicine } from '../types';

export default function ScanScreen({ navigation }: { navigation: any }) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [scannedMedicines, setScannedMedicines] = useState<Partial<Medicine>[]>([]);

    useEffect(() => {
        (async () => {
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasPermission(cameraStatus.status === 'granted' && mediaStatus.status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            processImage(result.assets[0].uri);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            processImage(result.assets[0].uri);
        }
    };

    const processImage = async (uri: string) => {
        setLoading(true);
        try {
            const response = await OcrService.processImage(uri);
            setScannedMedicines(response.data.medicines);
        } catch (error) {
            Alert.alert('Error', 'Failed to process image');
        } finally {
            setLoading(false);
        }
    };

    const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
        const updatedMedicines = [...scannedMedicines];
        updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
        setScannedMedicines(updatedMedicines);
    };

    const removeMedicine = (index: number) => {
        const updatedMedicines = [...scannedMedicines];
        updatedMedicines.splice(index, 1);
        setScannedMedicines(updatedMedicines);
    };

    const saveMedicines = async () => {
        if (scannedMedicines.length === 0) {
            Alert.alert('No Medicines', 'Please add at least one medicine to save.');
            return;
        }

        setSaving(true);
        try {
            const promises = scannedMedicines
                .filter(med => med.name && med.name.trim() !== '')
                .map(med => {
                    // Ensure all required fields have values
                    const medicineToSave: any = {
                        name: med.name!,
                        dosage: med.dosage || 'As directed',
                        frequency: med.frequency || 'daily',
                        time: med.time || '09:00 AM',
                    };
                    return MedicineService.add(medicineToSave);
                });

            if (promises.length === 0) {
                Alert.alert('Error', 'No valid medicines to save. Please ensure at least one medicine has a name.');
                return;
            }

            await Promise.all(promises);

            Alert.alert('Success', `${promises.length} medicine(s) saved successfully`);
            navigation.navigate('Medicines');
            // Reset
            setImage(null);
            setScannedMedicines([]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save medicines');
        } finally {
            setSaving(false);
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Requesting permissions...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No access to camera or gallery</Text>
                <Text style={styles.subtitle}>Please enable camera and gallery permissions in settings.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {!image ? (
                <View style={styles.actionContainer}>
                    <Title style={styles.title}>Scan Prescription</Title>
                    <Text style={styles.subtitle}>Take a photo or upload an image to extract medicines</Text>
                    <Button icon="camera" mode="contained" onPress={takePicture} style={styles.button}>
                        Take Photo
                    </Button>
                    <Button icon="image" mode="outlined" onPress={pickImage} style={styles.button}>
                        Upload from Gallery
                    </Button>
                </View>
            ) : (
                <View style={styles.resultContainer}>
                    <Image source={{ uri: image }} style={styles.previewImage} />

                    {loading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator animating={true} size="large" />
                            <Text style={{ marginTop: 10 }}>Analyzing prescription...</Text>
                        </View>
                    ) : (
                        scannedMedicines.length > 0 && (
                            <View>
                                <Title style={{ marginTop: 20 }}>Extracted Medicines</Title>
                                {scannedMedicines.map((med, index) => (
                                    <Card key={index} style={styles.medCard}>
                                        <Card.Content>
                                            <TextInput
                                                label="Medicine Name"
                                                value={med.name || ''}
                                                onChangeText={(text) => handleMedicineChange(index, 'name', text)}
                                                mode="outlined"
                                                style={{ marginBottom: 10 }}
                                            />
                                            <TextInput
                                                label="Dosage"
                                                value={med.dosage || ''}
                                                onChangeText={(text) => handleMedicineChange(index, 'dosage', text)}
                                                mode="outlined"
                                                style={{ marginBottom: 10 }}
                                            />
                                            <TextInput
                                                label="Frequency"
                                                value={med.frequency || ''}
                                                onChangeText={(text) => handleMedicineChange(index, 'frequency', text)}
                                                mode="outlined"
                                                style={{ marginBottom: 10 }}
                                            />
                                            <Button
                                                icon="delete"
                                                mode="text"
                                                textColor="#F44336"
                                                onPress={() => removeMedicine(index)}
                                            >
                                                Remove
                                            </Button>
                                        </Card.Content>
                                    </Card>
                                ))}
                                <Button
                                    mode="contained"
                                    onPress={saveMedicines}
                                    loading={saving}
                                    disabled={scannedMedicines.length === 0}
                                    style={styles.saveButton}
                                >
                                    Save {scannedMedicines.length} Medicine{scannedMedicines.length !== 1 ? 's' : ''}
                                </Button>
                                <Button mode="text" onPress={() => { setImage(null); setScannedMedicines([]); }}>
                                    Scan Another
                                </Button>
                            </View>
                        )
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    actionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    resultContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        color: '#4A90E2',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    errorText: {
        fontSize: 18,
        color: '#F44336',
        textAlign: 'center',
        marginBottom: 10,
    },
    button: {
        width: '100%',
        marginBottom: 15,
        paddingVertical: 8,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    loading: {
        alignItems: 'center',
        marginTop: 20,
    },
    medCard: {
        marginBottom: 15,
        backgroundColor: '#F5F7FA',
    },
    saveButton: {
        marginTop: 10,
        marginBottom: 10,
        paddingVertical: 6,
    },
});
