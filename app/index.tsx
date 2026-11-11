
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function BoasVindas() {
  const router = useRouter();

  function entrar() {
    router.replace('/(tabs)/home');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.conteudo}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/lembrete.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.titulo}>
          Seus lembretes,{'\n'}
          <Text style={styles.destaque}>sempre em dia!</Text>
        </Text>

        <Text style={styles.descricao}>
          Organize suas tarefas, acompanhe seus compromissos
          e tenha mais tranquilidade no seu dia a dia.
        </Text>

        <View style={styles.ilustracao}>
          <View style={styles.circulo}>
            <Text style={styles.icone}>✓</Text>
          </View>
          <Text style={styles.textoIlustracao}>
            Não deixe nada importante passar!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botao}
          onPress={entrar}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotao}>ENTRAR</Text>
          <Text style={styles.seta}>→</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.rodape}>
        ORGANIZE • PLANEJE • REALIZE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 65,
    paddingBottom: 30,
  },

  conteudo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  titulo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 40,
  },

  destaque: {
    color: '#2563EB',
  },

  descricao: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    paddingHorizontal: 8,
  },

  ilustracao: {
    alignItems: 'center',
    marginTop: 38,
    marginBottom: 35,
  },

  circulo: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icone: {
    fontSize: 38,
    color: '#16A34A',
    fontWeight: 'bold',
  },

  textoIlustracao: {
    color: '#475569',
    fontSize: 14,
    marginTop: 12,
  },

  botao: {
    width: '100%',
    height: 58,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  seta: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 12,
  },

  rodape: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 2,
  },
});
