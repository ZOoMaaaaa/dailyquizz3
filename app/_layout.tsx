import {
  Orbitron_500Medium,
  Orbitron_700Bold,
  useFonts,
} from '@expo-google-fonts/orbitron';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AuthProvider from '../providers/AuthProvider';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Orbitron_500Medium,
    Orbitron_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffe7" />
        <Text style={{ color: '#00ffe7', fontSize: 24, marginTop: 20 }}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
