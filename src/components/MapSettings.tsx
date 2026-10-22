import { Button } from "./Button";
import { Backdrop, SheetBackground, SheetHandle } from "./SheetChrome";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { RefObject } from "react";
import type { useRadar } from "../hooks/useRadar";
import { Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  styled,
  useTheme,
  H4,
  Paragraph,
  Select,
  XStack,
  YStack,
} from "tamagui";
import {
  mapStyles,
  type BooleanSetting,
  type MapSettings,
  type useMapSettings,
} from "../hooks/useMapSettings";

const SheetButton = styled(Button, {
  bg: "buttonBackground",
  color: "color",
});

const snapPoints = ["60%", "99%"];
const overlays: { key: BooleanSetting; label: string }[] = [
  { key: "radar", label: "Rain radar" },
  { key: "terrain", label: "3D terrain" },
  { key: "hillshade", label: "Hillshade" },
  { key: "contours", label: "Elevation contours" },
  { key: "traffic", label: "Live traffic" },
  { key: "buildings", label: "3D buildings" },
];
const display: { key: BooleanSetting; label: string }[] = [
  { key: "globe", label: "Globe projection" },
  { key: "compass", label: "Compass" },
  { key: "scale", label: "Distance scale" },
];

type Props = ReturnType<typeof useMapSettings> & {
  sheetRef: RefObject<BottomSheetModal | null>;
  onTilt: () => void;
  radar: ReturnType<typeof useRadar>;
};

export const MapSettingsSheet = ({
  sheetRef,
  settings,
  update,
  reset,
  onTilt,
  radar,
}: Props) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const toggleRow = ({
    key,
    label,
  }: {
    key: BooleanSetting;
    label: string;
  }) => {
    return (
      <XStack key={key} ai="center" jc="space-between" gap="4" py="3">
        <Paragraph f={1} fw="600">
          {label}
        </Paragraph>
        <Switch
          accessibilityLabel={label}
          value={settings[key]}
          onValueChange={(value) => update(key, value)}
          trackColor={{
            false: theme["border-color"].val,
            true: theme["accent-background"].val,
          }}
          ios_backgroundColor={theme["border-color"].val}
        />
      </XStack>
    );
  };
  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={Backdrop}
      backgroundComponent={SheetBackground}
      handleComponent={SheetHandle}
      topInset={insets.top}
    >
      <BottomSheetScrollView>
        <YStack bg="background" px="5" pt="2" pb={insets.bottom + 24} gap="5">
          <YStack gap="3">
            <H4>Base</H4>
            <Select<MapSettings["style"]>
              value={settings.style}
              onValueChange={(style) => update("style", style)}
              renderValue={(style) => mapStyles[style].label}
            >
              <Select.Trigger
                bg="buttonBackground"
                bc="border-color"
                minH={52}
                accessibilityLabel="Base map"
              >
                <Select.Value c="color" />
                <Select.Icon />
              </Select.Trigger>
              <Select.Content>
                <Select.Viewport
                  bg="buttonBackground"
                  bw={1}
                  bc="border-color"
                  rounded={12}
                  maxH={400}
                  bs="none"
                >
                  <Select.Group>
                    {Object.entries(mapStyles).map(([key, option]) => (
                      <Select.Item key={key} value={key} minH={48}>
                        <Select.ItemText c="color">
                          {option.label}
                        </Select.ItemText>
                        <Select.ItemIndicator ml="auto" />
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
              </Select.Content>
            </Select>
          </YStack>
          {settings.style === "standard" ? (
            <YStack gap="2">
              <H4>Standard appearance</H4>
              <Paragraph c="placeholder-color">
                Lighting and labels for the Standard basemap.
              </Paragraph>
              <XStack gap="2" wrap="wrap">
                {(["dawn", "day", "dusk", "night"] as const).map((value) => (
                  <SheetButton
                    key={value}
                    size="sm"
                    bg="buttonBackground"
                    bw={1}
                    bc={
                      settings.lighting === value
                        ? "accent-background"
                        : "border-color"
                    }
                    accessibilityState={{
                      selected: settings.lighting === value,
                    }}
                    onPress={() => update("lighting", value)}
                  >
                    {value}
                  </SheetButton>
                ))}
              </XStack>
              {(
                [
                  { key: "pois", label: "Points of interest" },
                  { key: "transit", label: "Transit labels" },
                  { key: "places", label: "Place names" },
                  { key: "roads", label: "Road labels" },
                ] as const
              ).map(toggleRow)}
            </YStack>
          ) : null}
          <YStack>
            <H4>Layers</H4>
            {overlays.map(toggleRow)}
            {settings.radar ? (
              <YStack gap="2" py="3">
                <Paragraph fw="600">Radar opacity</Paragraph>
                <XStack gap="2" wrap="wrap">
                  {[0.35, 0.65, 1].map((opacity) => (
                    <SheetButton
                      key={opacity}
                      size="sm"
                      bw={1}
                      bc={
                        settings.radarOpacity === opacity
                          ? "accent-background"
                          : "border-color"
                      }
                      accessibilityLabel={`Radar opacity ${Math.round(opacity * 100)} percent`}
                      accessibilityState={{
                        selected: settings.radarOpacity === opacity,
                      }}
                      onPress={() => update("radarOpacity", opacity)}
                    >
                      {Math.round(opacity * 100)}%
                    </SheetButton>
                  ))}
                </XStack>
                <Paragraph
                  fs={13}
                  c="placeholder-color"
                  accessibilityLiveRegion="polite"
                >
                  {radar.error
                    ? "Radar refresh unavailable. Retrying automatically."
                    : radar.loading
                      ? "Refreshing radar…"
                      : "Refreshes every 2 minutes"}
                </Paragraph>
                {radar.time ? (
                  <Paragraph fs={13} c="placeholder-color">
                    NOAA/NWS · {new Date(radar.time).toLocaleString()}
                  </Paragraph>
                ) : null}
              </YStack>
            ) : null}
            {settings.terrain ? (
              <YStack gap="2" py="3">
                <Paragraph fw="600">Terrain exaggeration</Paragraph>
                <XStack gap="2">
                  {[1, 1.5, 2, 3].map((value) => (
                    <SheetButton
                      key={value}
                      size="sm"
                      bg="buttonBackground"
                      bw={1}
                      bc={
                        settings.exaggeration === value
                          ? "accent-background"
                          : "border-color"
                      }
                      accessibilityState={{
                        selected: settings.exaggeration === value,
                      }}
                      onPress={() => update("exaggeration", value)}
                    >
                      {value}×
                    </SheetButton>
                  ))}
                </XStack>
              </YStack>
            ) : null}
            <SheetButton onPress={onTilt}>
              Switch between flat and tilted view
            </SheetButton>
          </YStack>
          <YStack>
            <H4>Display</H4>
            {display.map(toggleRow)}
            <Paragraph fw="600" py="3">
              Distance units
            </Paragraph>
            <XStack gap="2" wrap="wrap">
              {(["metric", "imperial", "nautical"] as const).map((unit) => (
                <SheetButton
                  key={unit}
                  size="sm"
                  bg="buttonBackground"
                  bw={1}
                  bc={
                    settings.units === unit
                      ? "accent-background"
                      : "border-color"
                  }
                  accessibilityState={{ selected: settings.units === unit }}
                  onPress={() => update("units", unit)}
                >
                  {unit}
                </SheetButton>
              ))}
            </XStack>
          </YStack>
          <SheetButton onPress={reset}>Reset all settings</SheetButton>
        </YStack>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};
