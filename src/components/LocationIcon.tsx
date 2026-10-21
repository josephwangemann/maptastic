import { YStack } from "tamagui";

export const LocationIcon = () => (
  <YStack w={24} h={24} ai="center" jc="center" pe="none">
    <YStack w={16} h={16} rounded={8} bw={2} bc="color" ai="center" jc="center">
      <YStack w={6} h={6} rounded={3} bg="color" />
    </YStack>
    <YStack pos="absolute" t={0} l={11} w={2} h={5} bg="color" rounded={1} />
    <YStack pos="absolute" b={0} l={11} w={2} h={5} bg="color" rounded={1} />
    <YStack pos="absolute" l={0} t={11} w={5} h={2} bg="color" rounded={1} />
    <YStack pos="absolute" r={0} t={11} w={5} h={2} bg="color" rounded={1} />
  </YStack>
);
