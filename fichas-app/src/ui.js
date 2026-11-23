import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

export const C = { bg: '#14121A', card: '#1F1C28', line: '#2E2A3B', text: '#F2EEE6', mute: '#A9A3B8', gold: '#D9B45B', red: '#E0675F' };
export const BAR_COLORS = ['#E0675F', '#5B8DEF', '#5FBF8F', '#A78BFA', '#D9B45B', '#F29E4C'];
const numKb = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';

export function Btn({ title, onPress, kind = 'gold', style, label }) {
  const k = { gold: [s.btnGold, s.btnGoldT], ghost: [s.btnGhost, s.btnGhostT], danger: [s.btnDanger, s.btnDangerT] }[kind];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label || title} onPress={onPress} style={({ pressed }) => [s.btn, k[0], pressed && { opacity: 0.7 }, style]}>
      <Text style={[s.btnT, k[1]]}>{title}</Text>
    </Pressable>
  );
}

export const Card = ({ children, style, onPress }) =>
  onPress ? (
    <Pressable onPress={onPress} style={[s.card, style]}>{children}</Pressable>
  ) : (
    <View style={[s.card, style]}>{children}</View>
  );

export const Chip = ({ title, on, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" style={[s.chip, on && s.chipOn]}>
    <Text style={[s.chipT, on && { color: C.bg }]}>{title}</Text>
  </Pressable>
);

export const Input = (p) => <TextInput placeholderTextColor={C.mute} {...p} style={[s.input, p.multiline && { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' }, p.style]} />;
export const Title = ({ children, style }) => <Text style={[s.title, style]}>{children}</Text>;
export const Muted = ({ children, style }) => <Text style={[{ color: C.mute, fontSize: 13 }, style]}>{children}</Text>;
export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Formulário em janela deslizante. fields: [{key,label,type:'text'|'number'|'multiline'|'color'}]
export function EditorModal({ visible, title, fields, initial, onSave, onDelete, onClose }) {
  const [v, setV] = useState({});
  const [erro, setErro] = useState('');
  useEffect(() => {
    if (!visible) return;
    const st = {};
    fields.forEach((f) => {
      const x = initial?.[f.key];
      st[f.key] = x === undefined || x === null ? String(f.def ?? '') : String(x);
    });
    setV(st);
    setErro('');
  }, [visible]);

  const salvar = () => {
    const out = {};
    for (const f of fields) {
      if (f.type === 'number') {
        const n = Number(String(v[f.key]).replace(',', '.'));
        out[f.key] = Number.isNaN(n) ? 0 : n;
      } else if (f.type === 'choice') {
        const o = f.options.find((x) => String(x.v) === v[f.key]);
        out[f.key] = o ? o.v : v[f.key];
      } else out[f.key] = String(v[f.key] ?? '').trim();
    }
    if (fields.some((f) => f.key === 'nome') && !out.nome) return setErro('Dê um nome.');
    const msg = onSave(out);
    if (typeof msg === 'string') setErro(msg);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.backdrop}>
        <View style={s.sheet}>
          <Title style={{ fontSize: 22 }}>{title}</Title>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingVertical: 12 }}>
            {fields.map((f) => (
              <View key={f.key} style={{ gap: 6 }}>
                <Text style={s.label}>{f.label}</Text>
                {f.type === 'color' ? (
                  <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                    {BAR_COLORS.map((c) => (
                      <Pressable key={c} accessibilityLabel={'Cor ' + c} onPress={() => setV({ ...v, [f.key]: c })} style={[s.swatch, { backgroundColor: c }, v[f.key] === c && { borderColor: C.text }]} />
                    ))}
                  </View>
                ) : f.type === 'choice' ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {f.options.map((o) => (
                      <Chip key={String(o.v)} title={o.l} on={v[f.key] === String(o.v)} onPress={() => setV({ ...v, [f.key]: String(o.v) })} />
                    ))}
                  </View>
                ) : (
                  <Input value={v[f.key]} onChangeText={(t) => setV({ ...v, [f.key]: t })} multiline={f.type === 'multiline'} keyboardType={f.type === 'number' ? numKb : 'default'} accessibilityLabel={f.label} />
                )}
              </View>
            ))}
            {!!erro && <Text style={{ color: C.red }}>{erro}</Text>}
          </ScrollView>
          <View style={{ gap: 10 }}>
            <Btn title="Salvar" onPress={salvar} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn title="Cancelar" kind="ghost" onPress={onClose} style={{ flex: 1 }} />
              {onDelete && <Btn title="Excluir" kind="danger" onPress={onDelete} style={{ flex: 1 }} />}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  btn: { minHeight: 48, minWidth: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnT: { fontSize: 16, fontWeight: '600' },
  btnGold: { backgroundColor: C.gold }, btnGoldT: { color: C.bg },
  btnGhost: { borderWidth: 1, borderColor: C.line, backgroundColor: C.bg }, btnGhostT: { color: C.text },
  btnDanger: { borderWidth: 1, borderColor: C.red }, btnDangerT: { color: C.red },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16, gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: C.line, justifyContent: 'center' },
  chipOn: { backgroundColor: C.gold, borderColor: C.gold }, chipT: { color: C.mute, fontWeight: '500' },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, color: C.text, paddingHorizontal: 14, fontSize: 16 },
  title: { color: C.text, fontSize: 28, fontWeight: '700' },
  label: { color: C.mute, fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%', gap: 4 },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: 'transparent' },
});
