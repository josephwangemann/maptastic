import { YStack } from "tamagui";
import { pinColors } from "../lib/waypoints";

export const WaypointPin = ({
  color = 0,
  monochrome = false,
  outlined = false,
  scale = 1,
  onLayout,
}: {
  color?: number;
  monochrome?: boolean;
  outlined?: boolean;
  scale?: number;
  onLayout?: () => void;
}) => (
  <YStack
    w={32 * scale}
    h={40 * scale}
    onLayout={onLayout}
    ai="center"
    jc="center"
    collapsable={false}
    pe="none"
  >
    <YStack
      w={24 * scale}
      h={24 * scale}
      rounded={12 * scale}
      bblr={0}
      rotate="-45deg"
      bw={outlined ? 2 * scale : 0}
      bc="pinOutline"
      bg={monochrome ? "color" : pinColors[color]}
      ai="center"
      jc="center"
    >
      <YStack
        w={8 * scale}
        h={8 * scale}
        rounded={4 * scale}
        bg="buttonBackground"
      />
    </YStack>
  </YStack>
);
