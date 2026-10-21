import { nativeStyles } from "../theme/nativeStyles";
import { Button, pressOpacity } from "./Button";
import { config } from "../../tamagui.config";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRef, type RefObject } from "react";
import { Alert, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getVariableValue,
  H4,
  Paragraph,
  styled,
  useTheme,
  XStack,
  YStack,
} from "tamagui";
import { pinColors, type Waypoint } from "../lib/waypoints";
import {
  Backdrop,
  ClearBackdrop,
  SheetBackground,
  SheetHandle,
} from "./SheetChrome";
import { WaypointPin } from "./WaypointPin";

const SheetButton = styled(Button, {
  bg: "buttonBackground",
  c: "color",
  bw: 1,
  bc: "border-color",
});
const saveSnapPoints = ["50%", "90%"];
const listSnapPoints = ["60%", "90%"];
const colorNames = ["Blue", "Red", "Orange", "Green", "Purple", "White"];

type SaveProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  coordinates: [number, number] | null;
  name: string;
  onNameChange: (name: string) => void;
  editing: boolean;
  color: number;
  onColorChange: (color: number) => void;
  onPositionChange: (top: number) => void;
  onDismiss: () => void;
  onSave: (name: string, coordinates: [number, number], color: number) => void;
};

export const SaveWaypointSheet = ({
  sheetRef,
  coordinates,
  name,
  onNameChange,
  editing,
  color,
  onColorChange,
  onPositionChange,
  onDismiss,
  onSave,
}: SaveProps) => {
  const saving = useRef(false);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const save = () => {
    if (!coordinates || !name.trim() || saving.current) return;
    saving.current = true;
    try {
      onSave(name, coordinates, color);
      Keyboard.dismiss();
      sheetRef.current?.dismiss();
    } catch {
      saving.current = false;
      Alert.alert("Unable to save waypoint", "Please try again.");
    }
  };
  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={saveSnapPoints}
      enableDynamicSizing={false}
      backdropComponent={Backdrop}
      backgroundComponent={SheetBackground}
      handleComponent={SheetHandle}
      topInset={insets.top}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onAnimate={(_, toIndex, __, toPosition) => {
        if (toIndex >= 0) onPositionChange(toPosition + insets.top);
      }}
      onChange={(index, position) => {
        if (index >= 0) onPositionChange(position + insets.top);
      }}
      onDismiss={() => {
        Keyboard.dismiss();
        saving.current = false;
        onDismiss();
      }}
    >
      <BottomSheetScrollView keyboardShouldPersistTaps="handled">
        <YStack px="5" gap="4" pb={insets.bottom + 24}>
          <XStack ai="center" gap="2">
            <WaypointPin color={color} />
            <H4>{editing ? "Edit waypoint" : "Save waypoint"}</H4>
          </XStack>
          <YStack bg="buttonBackground" bw={1} bc="border-color" rounded={12}>
            <BottomSheetTextInput
              style={nativeStyles({
                c: theme.color.val,
                ff: getVariableValue(config.fonts.body.family),
                fs: 16,
                minH: 52,
                px: 16,
                py: 12,
              })}
              keyboardAppearance="dark"
              selectionColor={theme.color.val}
              cursorColor={theme.color.val}
              accessibilityLabel="Waypoint name"
              placeholder="Name this place"
              placeholderTextColor={theme["placeholder-color"].val}
              value={name}
              onChangeText={onNameChange}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={save}
            />
          </YStack>
          <Paragraph c="placeholder-color">
            {coordinates
              ? `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`
              : ""}
          </Paragraph>
          <XStack gap="2" jc="space-between">
            {pinColors.map((token, index) => (
              <Button
                key={token}
                w={40}
                h={40}
                p={0}
                rounded={20}
                bg={token}
                bw={color === index ? 3 : 0}
                bc="accent-background"
                accessibilityLabel={`${colorNames[index]} pin`}
                accessibilityState={{ selected: color === index }}
                onPress={() => onColorChange(index)}
              />
            ))}
          </XStack>
          <XStack gap="3">
            <SheetButton
              f={1}
              onPress={() => {
                Keyboard.dismiss();
                sheetRef.current?.dismiss();
              }}
            >
              Cancel
            </SheetButton>
            <SheetButton f={1} disabled={!name.trim()} onPress={save}>
              Save
            </SheetButton>
          </XStack>
        </YStack>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

type ListProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  waypoints: Waypoint[];
  onSelect: (waypoint: Waypoint, index: number) => void;
  onDismiss: () => void;
  onDelete: (index: number) => void;
};

export const WaypointListSheet = ({
  sheetRef,
  waypoints,
  onSelect,
  onDelete,
  onDismiss,
}: ListProps) => {
  const insets = useSafeAreaInsets();
  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={listSnapPoints}
      enableDynamicSizing={false}
      onDismiss={onDismiss}
      backdropComponent={Backdrop}
      backgroundComponent={SheetBackground}
      handleComponent={SheetHandle}
      topInset={insets.top}
    >
      <BottomSheetFlatList<Waypoint>
        data={waypoints}
        keyExtractor={(_, index) => String(index)}
        ListHeaderComponent={
          <XStack px="5" py="3" ai="center" jc="space-between">
            <H4>
              Waypoints{waypoints.length > 0 ? ` · ${waypoints.length}` : ""}
            </H4>
          </XStack>
        }
        ListEmptyComponent={
          <YStack p="5">
            <Paragraph c="placeholder-color">
              Long press on the map to create a waypoint
            </Paragraph>
          </YStack>
        }
        ListFooterComponent={<YStack h={insets.bottom + 24} />}
        renderItem={({ item, index }) => (
          <XStack px="5" py="2" gap="3" ai="center">
            <XStack
              f={1}
              ai="center"
              gap="3"
              minH={52}
              o={pressOpacity}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${item[0]}`}
              onPress={() => {
                onSelect(item, index);
                sheetRef.current?.dismiss();
              }}
            >
              <WaypointPin color={item[3]} />
              <YStack f={1}>
                <Paragraph fw="600">{item[0]}</Paragraph>
                <Paragraph fs={12} c="placeholder-color">
                  {item[2].toFixed(6)}, {item[1].toFixed(6)}
                </Paragraph>
              </YStack>
            </XStack>
            <SheetButton
              size="sm"
              accessibilityLabel={`Delete ${item[0]}`}
              onPress={() => onDelete(index)}
            >
              Delete
            </SheetButton>
          </XStack>
        )}
      />
    </BottomSheetModal>
  );
};

type DetailProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  waypoint: Waypoint | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onDismiss: () => void;
};

export const WaypointDetailSheet = ({
  sheetRef,
  waypoint,
  onEdit,
  onDelete,
  onDismiss,
}: DetailProps) => {
  const insets = useSafeAreaInsets();
  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onDismiss}
      backdropComponent={ClearBackdrop}
      backgroundComponent={SheetBackground}
      handleComponent={SheetHandle}
    >
      <BottomSheetView>
        <YStack px="5" pt="2" pb={insets.bottom + 20} gap="4">
          {waypoint ? (
            <XStack ai="center" gap="3">
              <WaypointPin color={waypoint[3]} outlined />
              <YStack f={1} gap="1">
                <H4>{waypoint[0]}</H4>
                <Paragraph c="placeholder-color" fs={13}>
                  {waypoint[2].toFixed(6)}, {waypoint[1].toFixed(6)}
                </Paragraph>
              </YStack>
            </XStack>
          ) : null}
          <XStack gap="3">
            <SheetButton f={1} onPress={onEdit}>
              Edit
            </SheetButton>
            <SheetButton f={1} onPress={onDelete}>
              Delete
            </SheetButton>
          </XStack>
        </YStack>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
