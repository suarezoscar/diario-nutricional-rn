
// Mock oficial de AsyncStorage (módulo nativo).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
)

// Mock de react-native-svg: todos los elementos SVG se renderizan como View.
jest.mock('react-native-svg', () => {
  const React = require('react')
  const { View } = require('react-native')
  const Mock = (props: object) => React.createElement(View, props)
  return new Proxy({}, { get: () => Mock })
})