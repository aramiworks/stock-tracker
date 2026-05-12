/**
 * Stub for react-native-safe-area-context in Storybook web builds.
 * The actual package ships native specs (lib/module/specs/NativeSafeAreaView.js)
 * that import react-native/Libraries/Utilities/codegenNativeComponent, which has
 * no equivalent in react-native-web. Components render with zero insets.
 */
import React from "react";

const insets = { top: 0, bottom: 0, left: 0, right: 0 };
const frame = { x: 0, y: 0, width: 0, height: 0 };
const metrics = { insets, frame };

export const useSafeAreaInsets = () => insets;
export const useSafeAreaFrame = () => frame;
export const initialWindowMetrics = metrics;

export const SafeAreaInsetsContext = React.createContext(insets);
export const SafeAreaFrameContext = React.createContext(frame);

export const SafeAreaProvider = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const SafeAreaView = React.forwardRef((props, ref) =>
  React.createElement("div", { ...props, ref }),
);

export const SafeAreaConsumer = ({ children }) => children(insets);

export default {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  SafeAreaConsumer,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
};
