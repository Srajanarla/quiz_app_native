import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import QuizApp from './Screens/QuizApp';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#282c34" />
      <QuizApp />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c34',
  },
});

export default App;

