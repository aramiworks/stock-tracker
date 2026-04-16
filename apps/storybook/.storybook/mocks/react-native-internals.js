// Mock for react-native internal shims that react-native-reanimated imports.
// These don't exist in react-native-web and contain Flow syntax in react-native,
// so we provide a no-op shim for the web Storybook build.
export default {};
export const findHostInstance_DEPRECATED = () => null;
