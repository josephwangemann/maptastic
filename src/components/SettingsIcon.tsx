import { YStack } from "tamagui";

export const SettingsIcon = () => (
  <YStack w={24} h={24} jc="space-between" py={3} pe="none">
    {[5, 13, 8].map((offset, index) => (
      <YStack key={index} h={4} jc="center">
        <YStack h={2} w={24} bg="color" rounded={1} />
        <YStack
          pos="absolute"
          l={offset}
          w={6}
          h={6}
          rounded={3}
          bg="buttonBackground"
          bw={2}
          bc="color"
        />
      </YStack>
    ))}
  </YStack>
);
