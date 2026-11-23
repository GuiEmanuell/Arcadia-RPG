import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { api } from '../api';
import { SISTEMAS, criarDados } from '../sistemas';
import { Btn, Card, Input, Muted, Title, C } from '../ui';

export default function NewScreen({ onBack, onCreated }) {
  const [sistema, setSistema] = useState('D&D 5e');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);

  const criar = async () => {
    if (!nome.trim()) return setErro('Dê um nome ao personagem.');
    setBusy(true);
    try {
      onCreated(await api.create({ nome: nome.trim(), sistema, dados: criarDados(sistema) }));
    } catch {
      setErro('Não consegui salvar. O servidor está rodando?');
      setBusy(false);
    }
  };

  return (
    <View style={s.wrap}>
      <Btn title="‹ Voltar" kind="ghost" onPress={onBack} style={{ alignSelf: 'flex-start' }} />
      <Title>Nova ficha</Title>
      <Input placeholder="Nome do personagem" value={nome} onChangeText={setNome} accessibilityLabel="Nome do personagem" />
      <Muted>Escolha um modelo (tudo pode ser editado depois)</Muted>
      {Object.entries(SISTEMAS).map(([n, v]) => (
        <Card key={n} onPress={() => setSistema(n)} style={sistema === n && { borderColor: C.gold }}>
          <Text style={s.t}>{n}</Text>
          <Muted>{v.desc}</Muted>
        </Card>
      ))}
      {!!erro && <Text style={{ color: C.red }}>{erro}</Text>}
      <Btn title={busy ? 'Criando…' : 'Criar ficha'} onPress={criar} style={{ marginTop: 'auto', marginBottom: 24 }} />
    </View>
  );
}

const s = StyleSheet.create({ wrap: { flex: 1, padding: 20, gap: 12 }, t: { color: C.text, fontSize: 17, fontWeight: '600' } });
