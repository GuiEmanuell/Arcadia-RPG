import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Btn, C, Muted } from '../ui';

export default function HomeScreen({ onEnter }) {
  return (
    <View style={s.wrap}>
      <View style={s.glow} />
      <View style={s.content}>
        <View style={s.symbolWrap} accessibilityElementsHidden>
          <Text style={s.symbol}>✦</Text>
        </View>
        <Muted style={s.eyebrow}>SEU UNIVERSO DE AVENTURAS</Muted>
        <Text style={s.title}>Arcadia</Text>
        <Text style={s.welcome}>Toda grande aventura começa com uma história.</Text>
        <Muted style={s.description}>
          Crie seus personagens, organize suas fichas e prepare-se para viver jornadas inesquecíveis.
        </Muted>
        <Btn title="Entrar" onPress={onEnter} style={s.button} />
      </View>
      <Text style={s.footer}>SUA PRÓXIMA HISTÓRIA COMEÇA AQUI</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, overflow: 'hidden' },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#292239', opacity: 0.55, top: '18%' },
  content: { width: '100%', maxWidth: 420, alignItems: 'center' },
  symbolWrap: { width: 76, height: 76, borderRadius: 24, borderWidth: 1, borderColor: C.gold, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  symbol: { color: C.gold, fontSize: 38 },
  eyebrow: { color: C.gold, letterSpacing: 2, fontSize: 11, fontWeight: '700' },
  title: { color: C.text, fontSize: 52, fontWeight: '800', letterSpacing: 1, marginTop: 8 },
  welcome: { color: C.text, fontSize: 20, fontWeight: '600', textAlign: 'center', lineHeight: 29, marginTop: 28 },
  description: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12, maxWidth: 330 },
  button: { width: '100%', marginTop: 36 },
  footer: { position: 'absolute', bottom: 24, color: C.mute, fontSize: 10, letterSpacing: 2 },
});
