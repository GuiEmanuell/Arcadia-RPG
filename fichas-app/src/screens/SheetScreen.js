import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { api } from '../api';
import { CAMPOS, RESUMO, SUGESTOES, TITULOS, uid } from '../catalog';
import { SISTEMAS, aplicarRegras, calcPericia, mapaAtributos, migrar, resumoConfig } from '../sistemas';
import { Btn, Card, Chip, EditorModal, Input, Muted, clamp, C } from '../ui';

const ABAS = ['Barras', 'Atributos', 'Perícias', 'Habilidades', 'Magias', 'Itens', 'Notas'];
const CAMPOS_BARRA = [
  { key: 'nome', label: 'Nome da barra' },
  { key: 'atual', label: 'Valor atual', type: 'number' },
  { key: 'min', label: 'Mínimo', type: 'number' },
  { key: 'max', label: 'Máximo (ignorado se for automático)', type: 'number' },
  { key: 'cor', label: 'Cor', type: 'color', def: '#E0675F' },
];
const CAMPOS_ATTR = [
  { key: 'nome', label: 'Nome do atributo' },
  { key: 'valor', label: 'Valor', type: 'number' },
  { key: 'min', label: 'Mínimo', type: 'number' },
  { key: 'max', label: 'Máximo', type: 'number' },
];
const semAcento = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function SheetScreen({ ficha, onBack }) {
  const S = SISTEMAS[ficha.sistema];
  const [nome, setNome] = useState(ficha.nome);
  const [d, setD] = useState(() => {
    const base = { barras: [], atributos: [], habilidades: [], magias: [], itens: [], notas: '', config: {}, ...ficha.dados };
    return { pericias: [], ...migrar(base, ficha.sistema) };
  });
  const [aba, setAba] = useState('Barras');
  const [status, setStatus] = useState('Salvo');
  const [modal, setModal] = useState(null); // { kind, item }
  const [busca, setBusca] = useState('');
  const primeira = useRef(true);

  // Salvamento automático: espera 800 ms sem mudanças e envia ao backend
  useEffect(() => {
    if (primeira.current) { primeira.current = false; return; }
    setStatus('Salvando…');
    const t = setTimeout(async () => {
      try { await api.update(ficha.id, { nome: nome.trim() || ficha.nome, dados: d }); setStatus('Salvo'); }
      catch { setStatus('Erro ao salvar'); }
    }, 800);
    return () => clearTimeout(t);
  }, [d, nome]);

  // Toda alteração passa por aqui: depois de mudar, as barras automáticas são recalculadas
  const commit = (fn) => setD((p) => aplicarRegras(fn(p), ficha.sistema));
  const set = (k, v) => commit((p) => ({ ...p, [k]: v }));
  const upsert = (k, item) => commit((p) => ({ ...p, [k]: p[k].some((x) => x.id === item.id) ? p[k].map((x) => (x.id === item.id ? item : x)) : [...p[k], item] }));
  const mexe = (k, id, fn) => commit((p) => ({ ...p, [k]: p[k].map((x) => (x.id === id ? fn(x) : x)) }));
  const remove = (k, id) => { commit((p) => ({ ...p, [k]: p[k].filter((x) => x.id !== id) })); setModal(null); };
  const close = () => setModal(null);

  const attrs = mapaAtributos(d.atributos);

  // ---------- Barras / Atributos ----------
  const salvaBarra = (item) => (v) => {
    if (v.min > v.max) return 'O mínimo não pode ser maior que o máximo.';
    const { modo, ...resto } = v;
    upsert('barras', { ...item, ...resto, ...(item.auto ? { manual: modo === 'nao' } : {}), id: item.id || uid(), atual: clamp(v.atual, v.min, v.max) });
    close();
  };
  const salvaAttr = (item) => (v) => {
    if (v.min > v.max) return 'O mínimo não pode ser maior que o máximo.';
    upsert('atributos', { ...item, ...v, id: item.id || uid(), valor: clamp(v.valor, v.min, v.max) });
    close();
  };

  // ---------- Perícias ----------
  const treino = S?.treino || { tipo: 'numero', rotulo: 'Treino' };
  const camposPericia = (item) => [
    { key: 'nome', label: 'Nome da perícia' },
    { key: 'attr', label: 'Atributo', type: 'choice', options: [{ l: 'Nenhum', v: '' }, ...d.atributos.map((a) => ({ l: a.chave || a.nome, v: a.chave || a.nome }))] },
    treino.tipo === 'tier'
      ? { key: 'treino', label: 'Treino', type: 'choice', options: treino.rotulos.map((l, i) => ({ l, v: i })) }
      : { key: 'treino', label: `${treino.rotulo} (pontos)`, type: 'number', def: 0 },
    ...(ficha.sistema === 'Call of Cthulhu' && !item.baseAttr ? [{ key: 'base', label: 'Valor base (%)', type: 'number', def: 0 }] : []),
    { key: 'outros', label: 'Outros (bônus extra)', type: 'number', def: 0 },
  ];
  const restauraPadrao = () => {
    if (!S) return;
    const tem = new Set(d.pericias.map((p) => semAcento(p.nome)));
    const faltam = S.pericias().filter((p) => !tem.has(semAcento(p.nome)));
    if (faltam.length) set('pericias', [...d.pericias, ...faltam]);
  };
  const filtradas = [...d.pericias]
    .filter((p) => !busca || semAcento(p.nome).includes(semAcento(busca)))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const listaKey = ['habilidades', 'magias', 'itens'].includes(aba.toLowerCase()) ? aba.toLowerCase() : null;

  const configCard = () =>
    S && S.config.length > 0 ? (
      <Card>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.nome}>Cálculo automático</Text>
            <Muted>{resumoConfig(S, d.config)}</Muted>
          </View>
          <Btn title="Editar" kind="ghost" onPress={() => setModal({ kind: 'config' })} label="Editar cálculo automático" />
        </View>
      </Card>
    ) : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.top}>
        <Btn title="‹" kind="ghost" onPress={onBack} label="Voltar" style={{ paddingHorizontal: 0 }} />
        <View style={{ flex: 1 }}>
          <Input value={nome} onChangeText={setNome} accessibilityLabel="Nome do personagem" style={{ fontSize: 20, fontWeight: '700' }} />
        </View>
      </View>
      <Muted style={{ paddingHorizontal: 20, paddingTop: 4 }}>{ficha.sistema} · {status}</Muted>
      <View style={{ height: 60 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, padding: 8, paddingHorizontal: 20 }}>
          {ABAS.map((a) => <Chip key={a} title={a} on={aba === a} onPress={() => setAba(a)} />)}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
        {aba === 'Barras' && (
          <>
            {configCard()}
            {d.barras.map((b) => {
              const pct = b.max > b.min ? ((b.atual - b.min) / (b.max - b.min)) * 100 : 0;
              const auto = b.auto && !b.manual;
              return (
                <Card key={b.id}>
                  <View style={s.row}>
                    <Text style={s.nome}>{b.nome}</Text>
                    <Text style={s.val}>{b.atual} / {b.max}</Text>
                  </View>
                  <View style={s.track}><View style={{ width: `${pct}%`, height: 10, borderRadius: 5, backgroundColor: b.cor }} /></View>
                  <Muted>{auto ? 'Máximo calculado automaticamente' : `Mínimo ${b.min} · Máximo ${b.max}`}</Muted>
                  <View style={s.row}>
                    {[-5, -1, 1, 5].map((n) => (
                      <Btn key={n} title={n > 0 ? `+${n}` : `${n}`} kind="ghost" label={`${b.nome} ${n}`} style={{ flex: 1, paddingHorizontal: 0 }}
                        onPress={() => mexe('barras', b.id, (x) => ({ ...x, atual: clamp(x.atual + n, x.min, x.max) }))} />
                    ))}
                    <Btn title="Editar" kind="ghost" onPress={() => setModal({ kind: 'barra', item: b })} label={`Editar barra ${b.nome}`} style={{ flex: 1.4, paddingHorizontal: 0 }} />
                  </View>
                </Card>
              );
            })}
            <Btn title="+ Nova barra" onPress={() => setModal({ kind: 'barra', item: { cor: '#5B8DEF', min: 0, max: 10, atual: 10 } })} />
          </>
        )}

        {aba === 'Atributos' && (
          <>
            <View style={s.grid}>
              {d.atributos.map((a) => (
                <Card key={a.id} style={s.attr} onPress={() => setModal({ kind: 'attr', item: a })}>
                  <Text style={{ color: C.mute }}>{a.nome}</Text>
                  <Text style={s.big}>{a.valor}</Text>
                  {S?.bonusAttr && <Text style={s.bonus}>{S.bonusAttr(a.valor)}</Text>}
                  <Muted>{a.min} a {a.max}</Muted>
                  <View style={s.row}>
                    <Btn title="−" kind="ghost" label={`Diminuir ${a.nome}`} style={{ flex: 1, paddingHorizontal: 0 }}
                      onPress={() => mexe('atributos', a.id, (x) => ({ ...x, valor: clamp(x.valor - 1, x.min, x.max) }))} />
                    <Btn title="+" kind="ghost" label={`Aumentar ${a.nome}`} style={{ flex: 1, paddingHorizontal: 0 }}
                      onPress={() => mexe('atributos', a.id, (x) => ({ ...x, valor: clamp(x.valor + 1, x.min, x.max) }))} />
                  </View>
                </Card>
              ))}
            </View>
            <Muted>Toque no cartão para editar nome, valor, mínimo e máximo. Barras automáticas (como o PV) se recalculam sozinhas.</Muted>
            <Btn title="+ Novo atributo" onPress={() => setModal({ kind: 'attr', item: { valor: 10, min: 0, max: 20 } })} />
          </>
        )}

        {aba === 'Perícias' && (
          <>
            {configCard()}
            <Input placeholder="Buscar perícia" value={busca} onChangeText={setBusca} accessibilityLabel="Buscar perícia" />
            {filtradas.length === 0 && <Muted>Nenhuma perícia. Crie a sua ou restaure as padrão.</Muted>}
            {filtradas.map((sk) => {
              const r = calcPericia(ficha.sistema, sk, attrs, d.config);
              const t = sk.treino || 0;
              return (
                <Card key={sk.id} onPress={() => setModal({ kind: 'pericia', item: sk })}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.nome}>{sk.nome}</Text>
                      <Muted>{[sk.attr ? `(${sk.attr})` : '', r.sub].filter(Boolean).join(' · ')}</Muted>
                    </View>
                    <Text style={s.val}>{r.texto}</Text>
                  </View>
                  <View style={s.row}>
                    {treino.tipo === 'tier' ? (
                      <Chip title={`Treino: ${treino.rotulos[t] ?? treino.rotulos[0]}`} on={t > 0}
                        onPress={() => mexe('pericias', sk.id, (x) => ({ ...x, treino: ((x.treino || 0) + 1) % treino.rotulos.length }))} />
                    ) : (
                      <Muted>{treino.rotulo}: {t}</Muted>
                    )}
                    <Muted>Outros: {sk.outros || 0}</Muted>
                  </View>
                </Card>
              );
            })}
            <Btn title="+ Nova perícia" onPress={() => setModal({ kind: 'pericia', item: { attr: '', treino: 0, outros: 0 } })} />
            {S && S.pericias().length > 0 && <Btn title="Adicionar perícias padrão que faltam" kind="ghost" onPress={restauraPadrao} />}
          </>
        )}

        {listaKey && (
          <>
            {d[listaKey].length === 0 && <Muted>Nada aqui ainda. Crie o seu ou use uma sugestão.</Muted>}
            {d[listaKey].map((x) => (
              <Card key={x.id} onPress={() => setModal({ kind: listaKey, item: x })}>
                <View style={s.row}><Text style={s.nome}>{x.nome}</Text><Text style={{ color: C.gold }}>{RESUMO[listaKey](x)}</Text></View>
                {!!x.descricao && <Muted>{x.descricao}</Muted>}
              </Card>
            ))}
            <Btn title={`+ ${TITULOS[listaKey]} personalizado`} onPress={() => setModal({ kind: listaKey, item: {} })} />
            <Muted>Sugestões rápidas</Muted>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SUGESTOES[listaKey].map((sg) => <Chip key={sg.nome} title={`+ ${sg.nome}`} onPress={() => upsert(listaKey, { ...sg, id: uid() })} />)}
            </View>
          </>
        )}

        {aba === 'Notas' && <Input value={d.notas} onChangeText={(t) => set('notas', t)} multiline placeholder="História, anotações da sessão…" style={{ minHeight: 280 }} accessibilityLabel="Notas" />}
      </ScrollView>

      <EditorModal visible={modal?.kind === 'barra'} title={modal?.item?.id ? 'Editar barra' : 'Nova barra'}
        fields={[...CAMPOS_BARRA, ...(modal?.item?.auto ? [{ key: 'modo', label: 'Máximo da barra', type: 'choice', options: [{ l: 'Automático', v: 'sim' }, { l: 'Manual', v: 'nao' }] }] : [])]}
        initial={modal?.item ? { ...modal.item, modo: modal.item.manual ? 'nao' : 'sim' } : undefined}
        onSave={salvaBarra(modal?.item || {})} onDelete={modal?.item?.id ? () => remove('barras', modal.item.id) : null} onClose={close} />
      <EditorModal visible={modal?.kind === 'attr'} title={modal?.item?.id ? 'Editar atributo' : 'Novo atributo'} fields={CAMPOS_ATTR} initial={modal?.item}
        onSave={salvaAttr(modal?.item || {})} onDelete={modal?.item?.id ? () => remove('atributos', modal.item.id) : null} onClose={close} />
      <EditorModal visible={modal?.kind === 'pericia'} title={modal?.item?.id ? 'Editar perícia' : 'Nova perícia'} fields={camposPericia(modal?.item || {})} initial={modal?.item}
        onSave={(v) => { upsert('pericias', { ...modal.item, ...v, id: modal.item.id || uid() }); close(); }}
        onDelete={modal?.item?.id ? () => remove('pericias', modal.item.id) : null} onClose={close} />
      <EditorModal visible={modal?.kind === 'config'} title="Cálculo automático" fields={S?.config || []} initial={d.config}
        onSave={(v) => { set('config', { ...d.config, ...v }); close(); }} onClose={close} />
      {listaKey && (
        <EditorModal visible={modal?.kind === listaKey} title={(modal?.item?.id ? 'Editar ' : 'Nova ') + TITULOS[listaKey].toLowerCase()} fields={CAMPOS[listaKey]} initial={modal?.item}
          onSave={(v) => { upsert(listaKey, { ...modal.item, ...v, id: modal.item.id || uid() }); close(); }}
          onDelete={modal?.item?.id ? () => remove(listaKey, modal.item.id) : null} onClose={close} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' },
  nome: { color: C.text, fontSize: 17, fontWeight: '600' },
  val: { color: C.gold, fontSize: 17, fontWeight: '700' },
  track: { height: 10, borderRadius: 5, backgroundColor: C.line },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  attr: { width: '47.5%', alignItems: 'center' },
  big: { color: C.text, fontSize: 34, fontWeight: '700' },
  bonus: { color: C.gold, fontSize: 15, fontWeight: '700' },
});
