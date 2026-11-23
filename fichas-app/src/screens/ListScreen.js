import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, RefreshControl, Platform, Pressable } from 'react-native';
import { api, API_URL } from '../api';
import { Btn, Card, Muted, Title, C } from '../ui';

export default function ListScreen({ onNew, onOpen }) {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      setFichas(await api.list());
      setErro(false);
    } catch {
      setErro(true);
    }
    setLoading(false);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const removerFicha = async (f) => {
    setErroExclusao('');
    try {
      await api.remove(f.id);
      setFichas((atuais) => atuais.filter((item) => item.id !== f.id));
    } catch {
      setErroExclusao(`Não foi possível excluir "${f.nome}". Confira a conexão com o servidor e tente novamente.`);
    }
  };

  const excluir = (f) => {
    const mensagem = `Excluir "${f.nome}"? Isso não pode ser desfeito.`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm(mensagem)) removerFicha(f);
      return;
    }
    Alert.alert('Excluir ficha', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removerFicha(f) },
    ]);
  };

  return (
    <View style={s.wrap}>
      <Title style={{ fontFamily: undefined }}>Minhas fichas</Title>
      {erro && (
        <Card>
          <Text style={{ color: C.red, fontWeight: '600' }}>Não consegui falar com o servidor</Text>
          <Muted>Confira se o backend está rodando e se o celular está na mesma rede Wi-Fi. Endereço usado: {API_URL}</Muted>
          <Btn title="Tentar de novo" kind="ghost" onPress={carregar} />
        </Card>
      )}
      {!!erroExclusao && (
        <Card>
          <Text style={{ color: C.red, fontWeight: '600' }}>{erroExclusao}</Text>
        </Card>
      )}
      <FlatList
        data={fichas}
        keyExtractor={(f) => String(f.id)}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={carregar} tintColor={C.gold} />}
        ListEmptyComponent={!loading && !erro ? <Muted>Nenhuma ficha ainda. Crie a primeira abaixo.</Muted> : null}
        renderItem={({ item: f }) => {
          const b = f.dados?.barras?.[0];
          const pct = b && b.max > b.min ? ((b.atual - b.min) / (b.max - b.min)) * 100 : 0;
          return (
            <Card>
              <Pressable onPress={() => onOpen(f)} accessibilityRole="button" accessibilityLabel={`Abrir ficha ${f.nome}`}>
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.nome}>{f.nome}</Text>
                    <Muted>{f.sistema}</Muted>
                  </View>
                  {b && <Text style={s.pill}>{b.nome} {b.atual}/{b.max}</Text>}
                </View>
                {b && <View style={s.track}><View style={{ width: `${pct}%`, height: 6, borderRadius: 3, backgroundColor: b.cor || C.red }} /></View>}
              </Pressable>
              <Btn title="Excluir" kind="danger" onPress={() => excluir(f)} label={`Excluir ${f.nome}`} style={{ alignSelf: 'flex-start', minHeight: 44 }} />
            </Card>
          );
        }}
      />
      <Btn title="+ Nova ficha" onPress={onNew} style={{ marginBottom: 24 }} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nome: { color: C.text, fontSize: 17, fontWeight: '600' },
  pill: { color: C.gold, backgroundColor: C.line, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2, fontWeight: '600', overflow: 'hidden' },
  track: { height: 6, borderRadius: 3, backgroundColor: C.line },
});
