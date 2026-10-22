import { Pressable } from "react-native";
import {
  BottomSheetBackdrop,
  useBottomSheet,
  type BottomSheetBackgroundProps,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme, YStack } from "tamagui";

export const SheetBackground = ({ style }: BottomSheetBackgroundProps) => {
  const theme = useTheme();
  return (
    <YStack
      style={style}
      bg="background"
      rounded={24}
      bs={`0px -6px 18px -8px ${theme.sheetEdge.val}`}
    />
  );
};

export const SheetHandle = () => {
  return (
    <YStack ai="center" jc="center" h={28}>
      <YStack w={36} h={4} rounded={2} bg="border-color" />
    </YStack>
  );
};

export const Backdrop = (props: BottomSheetBackdropProps) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );
};

// Preserve hit testing without dimming the map.
export const ClearBackdrop = ({ style }: BottomSheetBackdropProps) => {
  const { close } = useBottomSheet();
  return (
    <Pressable
      style={style}
      accessibilityRole="button"
      accessibilityLabel="Dismiss waypoint sheet"
      onPress={() => close()}
    />
  );
};
