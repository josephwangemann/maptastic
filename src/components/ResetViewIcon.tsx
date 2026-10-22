import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { styled, useTheme } from "tamagui";
import { northArrowRotation } from "../theme/nativeStyles";

const Arrow = styled(Animated.View, {
  w: 24,
  h: 24,
  shrink: 0,
  as: "center",
  ai: "center",
  jc: "center",
  pe: "none",
});
const Needle = styled(Image, { w: 24, h: 24, shrink: 0 });

export const ResetViewIcon = ({
  heading,
}: {
  heading: SharedValue<number>;
}) => {
  const theme = useTheme();
  const rotation = useAnimatedStyle(() => northArrowRotation(heading.value));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2 L18 12 H6 Z" fill="${theme.color.val}"/><path d="M12 22 L6 12 H18 Z" fill="${theme["placeholder-color"].val}"/></svg>`;
  return (
    <Arrow style={rotation}>
      <Needle
        source={{ uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }}
        contentFit="contain"
        contentPosition="center"
      />
    </Arrow>
  );
};
