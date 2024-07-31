import { StyleSheet } from 'react-native';
import Weather from './Weather';

export default function App() {
  return (
    <Weather />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
