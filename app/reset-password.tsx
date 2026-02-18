import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handlePasswordReset = async () => {
    if (password.length < 6) {
      Alert.alert('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert('Mot de passe mis à jour');
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réinitialiser le mot de passe</Text>
      <TextInput
        secureTextEntry
        placeholder="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Pressable onPress={handlePasswordReset} style={styles.button}>
        <Text style={styles.buttonText}>Mettre à jour</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 22,
    color: '#00ffe7',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Orbitron_700Bold',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderColor: '#ff00c8',
    borderWidth: 2,
    borderRadius: 10,
    color: 'white',
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00ffe7',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontFamily: 'Orbitron_700Bold',
  },
});
