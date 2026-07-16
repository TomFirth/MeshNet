import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/sqlite.service';

export default function App() {
  useEffect(() => {
    initDatabase()
      .then(() => console.log('MeshNet Database Ready'))
      .catch(err => console.error('Database Init Failed', err));
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
