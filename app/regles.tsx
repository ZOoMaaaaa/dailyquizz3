import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Regles() {
  const router = useRouter();
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

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Règles du DailyQuizz</Text>
          <Text style={styles.rule}>Chaque jour, découvre un nouveau questionnaire à choix multiples (QCM).</Text>
          <Text style={styles.rule}>Chaque bonne réponse te rapporte 1 point.</Text>
          <Text style={styles.rule}>Plus tu réponds vite, plus tu gagnes du temps bonus (converti en points).</Text>
          <Text style={styles.rule}>Une saison dure 1 mois...</Text>
          <Text style={styles.rule}>Les questions sont les mêmes pour tous...</Text>
          <Text style={styles.rule}>Reste fair-play, amuse-toi... et deviens le maître du DailyQuizz !</Text>
        </ScrollView>
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
    margin: 20,
    marginTop: 50,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    borderColor: '#00ffe7',
    borderWidth: 2,
    flex: 1,
  },
  closeRow: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  scroll: {
    paddingBottom: 50,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#00ffe7',
    marginBottom: 20,
    textAlign: 'center',
  },
  rule: {
    fontFamily: 'Orbitron_500Medium',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 15,
    lineHeight: 24,
  },
});
