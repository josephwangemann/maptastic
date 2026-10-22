import type { TextStyle, ViewStyle } from "react-native";

import { appShorthands } from "./shorthands";

export const northArrowRotation = (heading: number): ViewStyle => {
  "worklet";
  return { transform: [{ rotate: `${-heading}deg` }] };
};

const keys = {
  ...appShorthands,
  w: "width",
  h: "height",
  minH: "minHeight",
  shrink: "flexShrink",
  bg: "backgroundColor",
  c: "color",
  o: "opacity",
  px: "paddingHorizontal",
  py: "paddingVertical",
  pt: "paddingTop",
  pb: "paddingBottom",
  pl: "paddingLeft",
  pr: "paddingRight",
  p: "padding",
  mx: "marginHorizontal",
  my: "marginVertical",
  mt: "marginTop",
  mb: "marginBottom",
  ml: "marginLeft",
  mr: "marginRight",
} as const;

type NativeStyle = ViewStyle & TextStyle;
type ShortStyle = { [K in keyof typeof keys]?: NativeStyle[(typeof keys)[K]] };

type NativeOutput<S> = {
  [
    K in keyof S as K extends keyof typeof keys ? (typeof keys)[K] : never
  ]: S[K];
};

export const nativeStyles = <S extends ShortStyle>(short: S): NativeOutput<S> =>
  Object.fromEntries(
    Object.entries(short).map(([key, value]) => [
      keys[key as keyof typeof keys],
      value,
    ]),
  ) as NativeOutput<S>;

export const cameraPadding = ({
  pt = 0,
  pb = 0,
  pl = 0,
  pr = 0,
}: {
  pt?: number;
  pb?: number;
  pl?: number;
  pr?: number;
}) => ({
  paddingTop: pt,
  paddingBottom: pb,
  paddingLeft: pl,
  paddingRight: pr,
});
