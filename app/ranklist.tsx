import { Orbitron_500Medium, Orbitron_700Bold, useFonts } from '@expo-google-fonts/orbitron';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

type Score = {
  id: number;
  score: number;
  player: string;
  joueurs: { pseudo: string | null } | null;
};

export default function RankList() {
  const [rankList, setRankList] = useState<Score[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Orbitron_500Medium,
    Orbitron_700Bold,
  });

  useEffect(() => {
    const fetchScores = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('id, score, player, joueurs (pseudo)')
        .order('score', { ascending: false });

      if (error) {
        Alert.alert('Erreur de récupération des scores');
        console.error(error);
      } else {
        setRankList(data as any);
      }
    };

    fetchScores();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffe7" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../images_app/cyberpunk-bg.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.closeRow}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="red" />
          </Pressable>
        </View>

        <Text style={styles.title}>Classement</Text>

        <FlatList
          data={rankList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.scoreItem}>
              <Text style={styles.rank}>{index + 1}.</Text>
              <View style={styles.info}>
                <Text style={styles.player}>Joueur: {item.joueurs?.pseudo || 'Inconnu'}</Text>
                <Text style={styles.score}>Score: {item.score}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
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
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flex: 1,
  },
  closeRow: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 28,
    color: '#00ffe7',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderColor: '#ff00c8',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  rank: {
    fontFamily: 'Orbitron_700Bold',
    color: '#ff00c8',
    fontSize: 20,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  player: {
    fontFamily: 'Orbitron_500Medium',
    color: '#ffffff',
    fontSize: 16,
  },
  score: {
    fontFamily: 'Orbitron_500Medium',
    color: '#cccccc',
    fontSize: 14,
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
    marginTop: 20,
  },
});
