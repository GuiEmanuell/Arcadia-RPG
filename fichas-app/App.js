import React, { useState } from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';
import ListScreen from './src/screens/ListScreen';
import NewScreen from './src/screens/NewScreen';
import SheetScreen from './src/screens/SheetScreen';
import HomeScreen from './src/screens/HomeScreen';
import { C } from './src/ui';

export default function App() {
  const [route, setRoute] = useState({ name: 'home' });
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {route.name === 'home' && <HomeScreen onEnter={() => setRoute({ name: 'list' })} />}
      {route.name === 'list' && (
        <ListScreen onNew={() => setRoute({ name: 'new' })} onOpen={(f) => setRoute({ name: 'sheet', ficha: f })} />
      )}
      {route.name === 'new' && (
        <NewScreen onBack={() => setRoute({ name: 'list' })} onCreated={(f) => setRoute({ name: 'sheet', ficha: f })} />
      )}
      {route.name === 'sheet' && <SheetScreen ficha={route.ficha} onBack={() => setRoute({ name: 'list' })} />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 54 },
});
