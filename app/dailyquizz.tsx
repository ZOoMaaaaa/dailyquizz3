import {
  Orbitron_500Medium,
  Orbitron_700Bold,
  useFonts,
} from '@expo-google-fonts/orbitron';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

const { width } = Dimensions.get('window');
const DUREE_PAR_QUESTION = 13;
const DUREE_ENTRE_QUESTIONS = 3;

interface Quizz {
  id: number;
  question: string;
  bonne_reponse: string;
  reponses: string[];
}

export default function DailyQuizzContent() {
  const [listeQuestion, setListeQuestion] = useState<Quizz[]>([]);
  const { user } = useAuth();
  const [bonnesReponses, setBonnesReponses] = useState(0);
  const [tempsRestant, setTempsRestant] = useState(0);
  const [questionEnCours, setQuestionEnCours] = useState(0);
  const [count, setCount] = useState(DUREE_PAR_QUESTION);
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [interQuestion, setInterQuestion] = useState(false);
  const [compteTransition, setCompteTransition] = useState(DUREE_ENTRE_QUESTIONS);
  const [reponsesJoueur, setReponsesJoueur] = useState<
    { id: number; question: string; bonneReponse: string; reponseJoueur: string }[]
  >([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const nb_questions = 9;

  const [fontsLoaded] = useFonts({
    Orbitron_500Medium,
    Orbitron_700Bold,
  });

  const initQuestion = (question: any): Quizz => ({
    id: question.id,
    question: question.question,
    bonne_reponse: question.reponse,
    reponses: shuffle(question.propositions),
  });

  const shuffle = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const shuffleList = (array: Quizz[]): Quizz[] =>
    array.sort(() => Math.random() - 0.5);

  const fetchQuizz = async () => {
    if (!user) return;

    const { error: updateError } = await supabase
      .from('joueurs')
      .update({ partie_quotidienne: true })
      .eq('id', user.id);

    if (updateError) {
      console.error("Erreur mise à jour 'partie_quotidienne':", updateError.message);
      Alert.alert('Erreur', 'Impossible de marquer la partie comme jouée.');
      return;
    }

    const { data, error } = await supabase.rpc('get_random_questions', {
      nb_questions,
      joueur_id: user.id,
    });

    if (error) {
      console.error('Erreur RPC:', error.message);
      Alert.alert('Erreur', 'Impossible de récupérer les questions.');
    } else if (Array.isArray(data) && data.length > 0) {
      const questions = data.map(initQuestion);
      setListeQuestion(shuffleList(questions));
    } else {
      Alert.alert('Aucune question', 'Tu as déjà répondu à toutes les questions disponibles !');
    }
  };

  useEffect(() => {
    fetchQuizz();
  }, []);

  useEffect(() => {
    if (!interQuestion) {
      intervalRef.current = setInterval(() => {
        setCount((prev) => (prev <= 0.1 ? 0 : parseFloat((prev - 0.1).toFixed(2))));
      }, 100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [interQuestion]);

  useEffect(() => {
    if (count <= 0 && !interQuestion) {
      if (questionEnCours < nb_questions - 1) {
        setInterQuestion(true);
        setCompteTransition(DUREE_ENTRE_QUESTIONS);
      } else {
        setQuestionEnCours(nb_questions);
      }
    }
  }, [count, interQuestion]);

  useEffect(() => {
    setIsBlinking(count <= 3 && count > 0);
    if (count > 3) setBlinkVisible(true);
  }, [count]);

  useEffect(() => {
    let blinkInterval: ReturnType<typeof setInterval>;
    if (isBlinking) {
      blinkInterval = setInterval(() => {
        setBlinkVisible((prev) => !prev);
      }, 500);
    }
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [isBlinking]);

  useEffect(() => {
    if (interQuestion) {
      transitionRef.current = setInterval(() => {
        setCompteTransition((prev) => {
          if (prev <= 1) {
            clearInterval(transitionRef.current!);
            setInterQuestion(false);
            setQuestionEnCours((prev) => prev + 1);
            return DUREE_ENTRE_QUESTIONS;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (transitionRef.current) clearInterval(transitionRef.current);
    };
  }, [interQuestion]);

  useEffect(() => {
    if (questionEnCours >= nb_questions) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCount(0);
      router.replace({
        pathname: '/score',
        params: {
          bonnesReponses: bonnesReponses.toString(),
          tempsRestant: tempsRestant.toFixed(2),
          reponsesJoueur: JSON.stringify(reponsesJoueur),
        },
      });
    } else {
      setCount(DUREE_PAR_QUESTION);
    }
  }, [questionEnCours]);

  const updateScore = (reponse: string = '') => {
    const questionActuelle = listeQuestion[questionEnCours];

    if (reponse && questionActuelle?.bonne_reponse === reponse) {
      setBonnesReponses((prev) => prev + 1);
      setTempsRestant((prev) => prev + count);
    }

    setReponsesJoueur((prev) => [
      ...prev,
      {
        id: questionActuelle.id,
        question: questionActuelle.question,
        bonneReponse: questionActuelle.bonne_reponse,
        reponseJoueur: reponse,
      },
    ]);

    if (questionEnCours < nb_questions - 1) {
      setInterQuestion(true);
      setCompteTransition(DUREE_ENTRE_QUESTIONS);
    } else {
      setQuestionEnCours((prev) => prev + 1);
    }
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
      source={require('../images_app/cyberpunk-bg.jpg')}
      style={styles.background}
    >
      <Stack.Screen options={{ title: 'Daily Quizz' }} />
      <View style={styles.contentBox}>
        {listeQuestion.length === 0 ? (
          <Text style={styles.loadingText}>Chargement des questions...</Text>
        ) : questionEnCours < listeQuestion.length ? (
          interQuestion ? (
            <View style={styles.transitionContainer}>
              <Text style={styles.transitionText}>Prochaine question dans</Text>
              <Text style={styles.transitionCountdown}>{compteTransition}...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.question}>
                {listeQuestion[questionEnCours].question}
              </Text>

              <FlatList
                data={listeQuestion[questionEnCours].reponses}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable onPress={() => updateScore(item)} style={styles.optionContainer}>
                    <Text style={styles.optionText}>{item}</Text>
                  </Pressable>
                )}
                contentContainerStyle={styles.optionsList}
              />

              <View style={styles.stats}>
                <Text style={styles.statsText}>Score : {bonnesReponses}</Text>
                <Text style={styles.statsText}>Temps : {tempsRestant.toFixed(2)}s</Text>
              </View>

              <View style={styles.timer}>
                <Text
                  style={[
                    styles.timerText,
                    isBlinking && {
                      color: '#ff3c3c',
                      opacity: blinkVisible ? 1 : 0.9,
                    },
                  ]}
                >
                  {count.toFixed(2)}s
                </Text>
              </View>
            </>
          )
        ) : (
          <Text style={styles.endText}>C'est fini !</Text>
        )}
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
  contentBox: {
    marginHorizontal: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 20,
    borderColor: '#00ffe7',
    borderWidth: 2,
  },
  question: {
    fontFamily: 'Orbitron_700Bold',
    color: '#00ffe7',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsList: {
    gap: 15,
  },
  optionContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff00c8',
  },
  optionText: {
    fontFamily: 'Orbitron_500Medium',
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  stats: {
    marginTop: 20,
    alignItems: 'center',
  },
  statsText: {
    fontFamily: 'Orbitron_500Medium',
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 5,
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
    fontSize: 24,
  },
  timer: {
    marginTop: 25,
    alignItems: 'center',
  },
  timerText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 26,
    color: '#00ffe7',
    textShadowColor: '#00ffe7',
    textShadowRadius: 10,
  },
  endText: {
    fontFamily: 'Orbitron_700Bold',
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 20,
  },
  transitionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  transitionText: {
    fontFamily: 'Orbitron_700Bold',
    color: '#00ffe7',
    fontSize: 22,
    marginBottom: 10,
  },
  transitionCountdown: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 40,
    color: '#ff00c8',
  },
});
