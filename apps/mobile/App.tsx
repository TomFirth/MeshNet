import 'react-native-get-random-values';
import 'fast-text-encoding';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/sqlite.service';
import { useMesh } from './src/hooks/useMesh';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useMesh(); // Start the background gossip simulator

  useEffect(() => {
    initDatabase()
      .then(() => {
        setDbReady(true);
      })
      .catch(err => {
        console.error('Database Init Failed', err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Database Error</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Initializing MeshNet...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
});
