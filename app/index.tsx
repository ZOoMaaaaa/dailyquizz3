import { Orbitron_700Bold, useFonts } from '@expo-google-fonts/orbitron';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Orbitron_700Bold });
  const pulse = useSharedValue(1);
  const { user, isLoading } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [showPseudoModal, setShowPseudoModal] = useState(false);
  const [pseudo, setPseudo] = useState('');

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.05, { duration: 800 }), -1, true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [user, isLoading]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  const handlePlayPress = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Erreur', 'Utilisateur non identifié.');
        return;
      }

      let { data: joueur, error: joueurError } = await supabase
        .from('joueurs')
        .select('pseudo, partie_quotidienne')
        .eq('id', user.id)
        .single();

      // Pas de profil joueur (ex: connexion Google) → on le crée automatiquement
      if (joueurError?.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('joueurs')
          .insert({ id: user.id });

        if (insertError) {
          Alert.alert('Erreur', 'Impossible de créer votre profil.');
          return;
        }

        const { data: newJoueur, error: fetchError } = await supabase
          .from('joueurs')
          .select('pseudo, partie_quotidienne')
          .eq('id', user.id)
          .single();

        if (fetchError || !newJoueur) {
          Alert.alert('Erreur', 'Impossible de vérifier votre profil.');
          return;
        }

        joueur = newJoueur;
      } else if (joueurError || !joueur) {
        console.error('Erreur Supabase (joueur) :', joueurError);
        Alert.alert('Erreur', 'Impossible de vérifier votre profil.');
        return;
      }

      if (!joueur.pseudo || joueur.pseudo.trim().length < 3) {
        setShowPseudoModal(true);
        return;
      }

      if (joueur.partie_quotidienne === false) {
        router.push('/dailyquizz');
      } else {
        setShowModal(true);
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const handleSavePseudo = async () => {
    if (pseudo.trim().length < 3) {
      Alert.alert('Pseudo trop court (min 3 caractères)');
      return;
    }

    const { error } = await supabase
      .from('joueurs')
      .update({ pseudo: pseudo.trim() })
      .eq('id', user!.id);

    if (error) {
      Alert.alert('Erreur', "Impossible d'enregistrer le pseudo.");
      console.error('Erreur enregistrement pseudo :', error);
      return;
    }

    setShowPseudoModal(false);
    setPseudo('');
    router.push('/');
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../images_app/acceuil-background.png')}
      style={styles.background}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <AnimatedPressable
          style={[styles.playButton, animatedStyle]}
          onPress={handlePlayPress}
        >
          <Text style={styles.playButtonText}>🎮 Jouer</Text>
        </AnimatedPressable>

        <Modal
          transparent
          animationType="fade"
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Partie déjà faite</Text>
              <Text style={styles.modalMessage}>
                Tu as déjà fait ta partie quotidienne aujourd'hui !
              </Text>
              <Pressable
                style={styles.modalButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={showPseudoModal}
          onRequestClose={() => setShowPseudoModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowPseudoModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Choisis un pseudo</Text>
              <Text style={styles.modalMessage}>
                Un pseudo est requis pour jouer.
              </Text>
              <TextInput
                placeholder="Ex: BladeRunner42"
                placeholderTextColor="#aaa"
                value={pseudo}
                onChangeText={setPseudo}
                style={styles.input}
              />
              <Pressable style={styles.modalButton} onPress={handleSavePseudo}>
                <Text style={styles.modalButtonText}>Valider</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Pressable style={styles.button} onPress={() => router.push('/regles')}>
          <Text style={styles.buttonText}>📜 Règles</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/ranklist')}
        >
          <Text style={styles.buttonText}>🏆 Classement</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push('/amis')}>
          <Text style={styles.buttonText}>👥 Amis</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.logoutButton]}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={styles.buttonText}>🚪 Déconnexion</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 290,
  },
  playButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#ff00c8',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 50,
    marginVertical: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#ff00c8',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 26,
    color: '#ffffff',
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#ff00c8',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  logoutButton: {
    borderColor: '#ff4444',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#00ffe7',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderColor: '#ff00c8',
    borderWidth: 2,
    borderRadius: 20,
    padding: 30,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#ff00c8',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 22,
    color: '#ff00c8',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
  },
  modalCloseText: {
    color: '#aaa',
    fontSize: 18,
    fontFamily: 'Orbitron_700Bold',
  },
  modalButton: {
    backgroundColor: '#00ffe7',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
  },
  modalButtonText: {
    fontFamily: 'Orbitron_700Bold',
    color: '#000',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderColor: '#ff00c8',
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontFamily: 'Orbitron_700Bold',
    width: '100%',
  },
});
