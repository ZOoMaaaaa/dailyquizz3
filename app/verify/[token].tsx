import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function VerifyScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (!token) return;

    const verifyAccount = async () => {
      try {
        const response = await fetch(`https://Dailyquizz/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyAccount();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Vérification en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      {status === 'success' ? (
        <Text style={styles.success}>Votre compte a bien été vérifié !</Text>
      ) : (
        <Text style={styles.error}>Le lien de vérification est invalide ou expiré.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  success: {
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
