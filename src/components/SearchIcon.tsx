import { YStack } from "tamagui";

export const SearchIcon = () => (
  <YStack w={24} h={24} pe="none">
    <YStack
      pos="absolute"
      t={2}
      l={2}
      w={15}
      h={15}
      rounded={8}
      bw={2}
      bc="color"
    />
    <YStack
      pos="absolute"
      t={17}
      l={14}
      w={10}
      h={2}
      rounded={1}
      rotate="45deg"
      bg="color"
    />
  </YStack>
);
