import {
  Orbitron_500Medium,
  Orbitron_700Bold,
  useFonts,
} from '@expo-google-fonts/orbitron';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { Tables } from '../types/supabase';

export default function ScoreDisplay() {
  type Score = Tables<'scores'>;
  const { bonnesReponses, tempsRestant, reponsesJoueur } = useLocalSearchParams();
  const { user } = useAuth();
  const [userScore, setUserScore] = useState<Score | null>(null);
  const router = useRouter();

  const nbBonnesReponses = bonnesReponses;

  const bonnesReponsesStr = Array.isArray(bonnesReponses)
    ? bonnesReponses[0]
    : bonnesReponses || '0';
  const tempsRestantStr = Array.isArray(tempsRestant)
    ? tempsRestant[0]
    : tempsRestant || '0';

  const [fontsLoaded] = useFonts({
    Orbitron_500Medium,
    Orbitron_700Bold,
  });

  useEffect(() => {
    if (user) {
      fetchAndRegisterScore();
    }
  }, [user]);

  const fetchAndRegisterScore = async () => {
    const { data: joueur, error: joueurError } = await supabase
      .from('joueurs')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();

    if (joueurError || !joueur) {
      console.log("Erreur joueur :", joueurError?.message);
      Alert.alert("Erreur", "Impossible de récupérer votre profil joueur.");
      return;
    }

    const { data: existingScore, error: scoreError } = await supabase
      .from('scores')
      .select('*')
      .eq('player', joueur.id)
      .maybeSingle();

    if (scoreError) {
      console.log("Erreur récupération score :", scoreError.message);
    }

    setUserScore(existingScore);
    await registerScore(existingScore, joueur.id);
  };

  const registerScore = async (existingScore: Score | null, joueurId: string) => {
    const scoreBase = parseFloat(bonnesReponsesStr);
    const timeBonus = parseFloat(tempsRestantStr);
    const scoreTotal = Math.round(scoreBase * 10 * (1 + timeBonus / 100) * 100);

    const newScore: Partial<Score> = {
      score: existingScore ? existingScore.score + scoreTotal : scoreTotal,
      player: joueurId,
      id: existingScore?.id,
    };

    const { error } = existingScore?.score != null
      ? await supabase.from('scores').update({ score: newScore.score }).eq('player', joueurId).select()
      : await supabase.from('scores').insert({ score: newScore.score!, player: joueurId }).select();

    if (error) {
      Alert.alert("Erreur lors de l'enregistrement du score");
      console.log(error);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement des polices...</Text>
      </View>
    );
  }

  const scoreBase = parseFloat(bonnesReponsesStr) * 10;
  const total = scoreBase * (1 + parseFloat(tempsRestantStr) / 100) * 100;

  return (
    <ImageBackground
      source={require('../images_app/cyberpunk-bg.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>C'est fini !</Text>
        <Text style={styles.text}>Score de base : {scoreBase}</Text>
        <Text style={styles.text}>Temps restant : {parseFloat(tempsRestantStr).toFixed(2)}s</Text>
        <Text style={styles.total}>Score total : {total.toFixed(0)}</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/ranklist')}
          >
            <Text style={styles.buttonText}>Voir le classement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: '/answers',
                params: {
                  reponsesJoueur: reponsesJoueur as string,
                  bonnesReponses: nbBonnesReponses,
                  tempsRestant: tempsRestant as string,
                },
              })
            }
          >
            <Text style={styles.buttonText}>Voir les réponses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#ff00c8' }]}
            onPress={() => router.push('/')}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>Retour au menu</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    marginHorizontal: 25,
    padding: 25,
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
  text: {
    fontFamily: 'Orbitron_500Medium',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 5,
  },
  total: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 22,
    color: '#ff00c8',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontFamily: 'Orbitron_700Bold',
    color: '#00ffe7',
    fontSize: 20,
  },
  buttonGroup: {
    marginTop: 30,
  },
  button: {
    backgroundColor: '#00ffe7',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  buttonText: {
    fontFamily: 'Orbitron_700Bold',
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
  },
});
