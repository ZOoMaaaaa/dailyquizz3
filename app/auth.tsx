import {
  Orbitron_500Medium,
  Orbitron_700Bold,
  useFonts,
} from '@expo-google-fonts/orbitron';
import { Stack, useRouter } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

WebBrowser.maybeCompleteAuthSession();

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const [fontsLoaded] = useFonts({
    Orbitron_500Medium,
    Orbitron_700Bold,
  });


  async function signInWithGoogle() {
    const echecAuth = async (message: string) => {
      await supabase.auth.signOut();
      Alert.alert('Échec de connexion Google', message);
      router.replace('/auth');
    };

    try {
      const redirectUrl = makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) { await echecAuth(error.message); return; }
      if (!data?.url) { await echecAuth('Impossible de démarrer la connexion Google. Réessayez.'); return; }

      console.log('[Google OAuth] redirectUrl:', redirectUrl);
      console.log('[Google OAuth] opening URL:', data.url);

      let resolved = false;
      let subscription: ReturnType<typeof Linking.addEventListener> | null = null;

      const callbackUrl = await new Promise<string | null>((resolve) => {
        subscription = Linking.addEventListener('url', ({ url }) => {
          console.log('[Google OAuth] Linking url reçu:', url);
          const scheme = redirectUrl.split(':')[0];
          if (url.startsWith(scheme + ':') && !resolved) {
            resolved = true;
            resolve(url);
          }
        });

        WebBrowser.openBrowserAsync(data.url).then(() => {
          // Attendre 1s après la fermeture du browser : sur Android, l'event
          // Linking peut arriver légèrement après que le browser se ferme
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(null);
            }
          }, 1000);
        });
      });

      subscription?.remove();
      WebBrowser.dismissBrowser();

      console.log('[Google OAuth] callbackUrl:', callbackUrl);

      if (callbackUrl) {
        console.log('[Google OAuth] callbackUrl reçu:', callbackUrl);

        // Extraire les tokens depuis l'URL (fragment ou query)
        const fragmentPart = callbackUrl.includes('#') ? callbackUrl.split('#')[1] : '';
        const queryPart = callbackUrl.includes('?') ? callbackUrl.split('?')[1]?.split('#')[0] : '';
        const params = new URLSearchParams(fragmentPart || queryPart || '');

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        console.log('[Google OAuth] accessToken présent:', !!accessToken);

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            console.error('[Google OAuth] setSession error:', sessionError);
            await echecAuth('La connexion Google n\'a pas pu être finalisée. Réessayez.');
          }
        } else {
          // Fallback PKCE
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(callbackUrl);
          if (sessionError) {
            console.error('[Google OAuth] exchangeCodeForSession error:', sessionError);
            await echecAuth('La connexion Google n\'a pas pu être finalisée. Réessayez.');
          }
        }
      } else {
        await echecAuth('La connexion Google a échoué. Réessayez.');
      }

    } catch (err) {
      console.error('Erreur Google sign-in :', err);
      await echecAuth('Une erreur inattendue est survenue. Réessayez.');
    }
  }

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user]);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Veuillez saisir votre adresse email.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert('Un lien de réinitialisation a été envoyé à votre adresse email.');
    }
  };

  async function signInWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
    } else if (data?.user) {
      router.push('/');
    }

    setLoading(false);
  }

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require('../images_app/cyberpunk-bg.jpg')}
      style={styles.background}
    >
      <Stack.Screen options={{ title: 'Login' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Connexion</Text>

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
        <Pressable onPress={handleResetPassword}>
          <Text style={{ color: '#00ffe7', textAlign: 'center', marginBottom: 10 }}>
            Mot de passe oublié ?
          </Text>
        </Pressable>

        <Pressable onPress={signInWithEmail} disabled={loading} style={styles.button}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/enregistrement')}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.buttonText}>Créer un compte</Text>
        </Pressable>

        <Pressable
          onPress={signInWithGoogle}
          style={[styles.button, { backgroundColor: '#ffffff', marginTop: 20 }]}
        >
          <Text style={[styles.buttonText, { color: '#000' }]}>
            Se connecter avec Google
          </Text>
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
  buttonText: {
    color: '#000',
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#ff00c8',
  },
});
