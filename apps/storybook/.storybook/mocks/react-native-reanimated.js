/**
 * Stub for react-native-reanimated in Storybook web builds.
 * The actual package uses native modules (TurboModuleRegistry, ReactFabric)
 * not available in react-native-web. Components render without animations.
 */
import React from "react";

const noop = () => {};
const identity = (v) => v;
const useSharedValue = (init) => ({ value: init });
const useAnimatedStyle = (cb) => cb();
const withTiming = identity;
const withSpring = identity;
const withDelay = (_, v) => v;
const withRepeat = identity;
const withSequence = (...vals) => vals[vals.length - 1];
const useAnimatedRef = () => React.createRef();
const useAnimatedScrollHandler = () => noop;
const useAnimatedGestureHandler = () => ({});
const useDerivedValue = (cb) => ({ value: cb() });
const useAnimatedReaction = noop;
const runOnUI = (fn) => fn;
const runOnJS = (fn) => fn;
const makeMutable = (init) => ({ value: init });
const interpolate = identity;
const Extrapolation = { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" };
const Extrapolate = { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" };
const useScrollViewOffset = () => ({ value: 0 });
const useAnimatedKeyboard = () => ({ height: { value: 0 }, state: { value: 0 } });
const useSafeAnimatedRef = () => React.createRef();
const cancelAnimation = noop;
const withDecay = identity;
const withDeceleration = identity;
const FadeIn = { duration: noop, delay: noop, springify: noop };
const FadeOut = { duration: noop, delay: noop, springify: noop };
const SlideInRight = { duration: noop, delay: noop };
const SlideOutLeft = { duration: noop, delay: noop };
const ZoomIn = { duration: noop, delay: noop };
const ZoomOut = { duration: noop, delay: noop };
const Layout = { duration: noop, delay: noop, springify: noop };

const Animated = {
  View: React.forwardRef((props, ref) => React.createElement("div", { ...props, ref })),
  Text: React.forwardRef((props, ref) => React.createElement("span", { ...props, ref })),
  Image: React.forwardRef((props, ref) => React.createElement("img", { ...props, ref })),
  ScrollView: React.forwardRef((props, ref) => React.createElement("div", { ...props, ref })),
  FlatList: React.forwardRef((props, ref) => React.createElement("div", { ...props, ref })),
  createAnimatedComponent: (Component) => React.forwardRef((props, ref) => React.createElement(Component, { ...props, ref })),
};

export default Animated;
export {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  useDerivedValue,
  useAnimatedReaction,
  runOnUI,
  runOnJS,
  makeMutable,
  interpolate,
  Extrapolation,
  Extrapolate,
  useScrollViewOffset,
  useAnimatedKeyboard,
  useSafeAnimatedRef,
  cancelAnimation,
  withDecay,
  withDeceleration,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  Layout,
  Animated,
};
