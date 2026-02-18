import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { Database } from '../types/supabase';

type Joueur = Database['public']['Tables']['joueurs']['Row'];
type JoueurAmis = Pick<Joueur, 'amis'>;

export default function Amis() {
  const { user } = useAuth();
  const router = useRouter();
  const [pseudo, setPseudo] = useState('');
  const [listeAmis, setListeAmis] = useState<any[]>([]);

  const fetchAmis = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('joueurs')
      .select('amis')
      .eq('id', user.id)
      .single<JoueurAmis>();

    if (data?.amis?.length) {
      const { data: amisDetails } = await supabase
        .from('joueurs')
        .select('id, pseudo')
        .in('id', data.amis);
      setListeAmis(amisDetails || []);
    } else {
      setListeAmis([]);
    }
  };

  const ajouterAmi = async () => {
    if (!user) return;
    if (pseudo.trim() === '') return;

    const { data: joueurTrouve, error } = await supabase
      .from('joueurs')
      .select('id')
      .eq('pseudo', pseudo.trim())
      .single();

    if (error) {
      console.error("Erreur lors de la recherche du joueur :", error.message);
    }
    if (!joueurTrouve) {
      Alert.alert("Pseudo introuvable");
      return;
    }

    if (joueurTrouve.id === user.id) {
      Alert.alert("Tu ne peux pas t'ajouter toi-même");
      return;
    }

    const { data: utilisateur } = await supabase
      .from('joueurs')
      .select('amis')
      .eq('id', user.id)
      .single();

    const amis = utilisateur?.amis || [];

    if (amis.includes(joueurTrouve.id)) {
      Alert.alert("Cet utilisateur est déjà dans ta liste !");
      return;
    }

    const { error: updateError } = await supabase
      .from('joueurs')
      .update({ amis: [...amis, joueurTrouve.id] })
      .eq('id', user.id);

    if (updateError) {
      Alert.alert("Erreur lors de l'ajout");
    } else {
      setPseudo('');
      fetchAmis();
      Alert.alert("Ami ajouté !");
    }
  };

  const supprimerAmi = async (amiId: string, amiPseudo: string) => {
    if (!user) return;
    Alert.alert(
      "Confirmation",
      `Supprimer ${amiPseudo} de ta liste d'amis ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const { data: utilisateur } = await supabase
              .from('joueurs')
              .select('amis')
              .eq('id', user!.id)
              .single();

            const nouveauxAmis = (utilisateur?.amis || []).filter((id: string) => id !== amiId);

            const { error } = await supabase
              .from('joueurs')
              .update({ amis: nouveauxAmis })
              .eq('id', user!.id);

            if (error) {
              Alert.alert("Erreur lors de la suppression");
            } else {
              fetchAmis();
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchAmis();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.closeRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="red" />
        </Pressable>
      </View>
      <Text style={styles.title}>Ajouter un ami</Text>

      <TextInput
        placeholder="Entre son pseudo"
        placeholderTextColor="#999"
        value={pseudo}
        onChangeText={setPseudo}
        style={styles.input}
      />

      <Pressable onPress={ajouterAmi} style={styles.addButton}>
        <Text style={styles.addButtonText}>Ajouter</Text>
      </Pressable>

      <Text style={styles.subtitle}>Mes amis</Text>
      <FlatList
        data={listeAmis}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.amiRow}>
            <Text style={styles.ami}>{item.pseudo}</Text>
            <Pressable onPress={() => supprimerAmi(item.id, item.pseudo)}>
              <Ionicons name="trash-bin" size={20} color="#ff4d4d" />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 20,
    paddingTop: 50,
  },
  closeRow: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 20,
    color: '#00ffe7',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
    color: '#fff',
    marginTop: 25,
  },
  input: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderColor: '#ff00c8',
    borderWidth: 2,
    color: '#fff',
    fontFamily: 'Orbitron_500Medium',
  },
  addButton: {
    backgroundColor: '#00ffe7',
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Orbitron_700Bold',
  },
  amiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: '#222',
    borderBottomWidth: 1,
  },
  ami: {
    color: '#ccc',
    fontFamily: 'Orbitron_500Medium',
    fontSize: 14,
  },
});
