import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ReponseJoueur = {
  id: number;
  question: string;
  bonneReponse: string;
  reponseJoueur: string;
};

export default function Answers() {
  const { bonnesReponses, tempsRestant, reponsesJoueur } = useLocalSearchParams();
  const [reponses, setReponses] = useState<ReponseJoueur[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (reponsesJoueur) {
      try {
        const parsed = JSON.parse(reponsesJoueur as string);
        setReponses(parsed);
      } catch (error) {
        console.error("Erreur parsing JSON réponses joueur :", error);
      }
    }
  }, [reponsesJoueur]);

  return (
    <ImageBackground
      source={require('../images_app/cyberpunk-bg.jpg')}
      style={styles.background}
    >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="red" />
          </Pressable>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Résultats du Quizz</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.score}>
            Bonnes réponses : {bonnesReponses} / {reponses.length}
          </Text>
          <Text style={styles.score}>Temps restant : {tempsRestant}s</Text>

          {reponses.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.question}>{item.question}</Text>
              <Text
                style={[
                  styles.reponse,
                  item.reponseJoueur === item.bonneReponse
                    ? styles.correct
                    : styles.incorrect,
                ]}
              >
                Votre réponse : {item.reponseJoueur}
              </Text>
              {item.reponseJoueur !== item.bonneReponse && (
                <Text style={styles.bonneReponse}>
                  Bonne réponse : {item.bonneReponse}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 5,
  },
  closeButton: {
    padding: 5,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffe7',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  score: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00ffe7',
    marginBottom: 20,
  },
  question: {
    color: '#00ffe7',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reponse: {
    fontSize: 14,
    marginBottom: 5,
  },
  correct: {
    color: '#00ff88',
  },
  incorrect: {
    color: '#ff3b3b',
  },
  bonneReponse: {
    color: '#ffffff',
    fontStyle: 'italic',
  },
});
