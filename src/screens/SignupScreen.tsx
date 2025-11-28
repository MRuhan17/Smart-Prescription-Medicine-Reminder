import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/AuthService';

interface SignupScreenProps {
    navigation: any;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const { login } = useAuth();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        return password.length >= 6;
    };

    const handleSignup = async () => {
        // Validation
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setEmailError('');
        setPasswordError('');
        setLoading(true);
        try {
            const response = await AuthService.signup(email, password, name);
            await login(response.data.token, response.data.user);
        } catch (error) {
            console.error(error);
            Alert.alert('Signup Failed', 'Unable to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Title style={styles.title}>Create Account</Title>
                <TextInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    disabled={loading}
                />
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setEmailError('');
                    }}
                    mode="outlined"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={!!emailError}
                    disabled={loading}
                />
                <HelperText type="error" visible={!!emailError}>
                    {emailError}
                </HelperText>
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setPasswordError('');
                    }}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    error={!!passwordError}
                    disabled={loading}
                />
                <HelperText type="error" visible={!!passwordError}>
                    {passwordError}
                </HelperText>
                <Button
                    mode="contained"
                    onPress={handleSignup}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Sign Up
                </Button>
                <Button
                    onPress={() => navigation.navigate('Login')}
                    style={styles.link}
                    disabled={loading}
                >
                    Already have an account? Login
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        color: '#4A90E2',
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 10,
        paddingVertical: 6,
    },
    link: {
        marginTop: 10,
    },
});
