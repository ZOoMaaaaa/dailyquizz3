import {
  Orbitron_500Medium,
  Orbitron_700Bold,
  useFonts,
} from '@expo-google-fonts/orbitron';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  AppState,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Orbitron_500Medium,
    Orbitron_700Bold,
  });

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Erreur', error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      Alert.alert('Vérifiez votre boîte mail pour activer votre compte.');
    }

    if (data.user) {
      const { error: insertError } = await supabase
        .from('joueurs')
        .insert({ id: data.user.id });

      if (insertError) {
        Alert.alert('Erreur lors de la création du joueur :', insertError.message);
      } else {
        router.replace('/auth');
      }
    }

    setLoading(false);
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require('../images_app/cyberpunk-bg.jpg')}
      style={styles.background}
    >
      <Stack.Screen options={{ title: 'Créer un compte' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Créer un compte</Text>

        <TextInput
          placeholder="email@address.com"
          placeholderTextColor="#aaa"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor="#aaa"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />

        <Pressable
          onPress={handleSignUp}
          disabled={loading}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Créer le compte</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/auth')}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.buttonText}>Déjà un compte ?</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    marginHorizontal: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 20,
    borderColor: '#00ffe7',
    borderWidth: 2,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#00ffe7',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderColor: '#ff00c8',
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontFamily: 'Orbitron_500Medium',
  },
  button: {
    backgroundColor: '#00ffe7',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ff00c8',
  },
  buttonText: {
    color: '#000',
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
  },
});
