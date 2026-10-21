import { SettingsIcon } from "./SettingsIcon";
import { LocationIcon } from "./LocationIcon";
import { cameraPadding, nativeStyles } from "../theme/nativeStyles";
import { Button, pressOpacity } from "./Button";
import { useWaypoints } from "../hooks/useWaypoints";
import { WaypointPin } from "./WaypointPin";
import {
  SaveWaypointSheet,
  WaypointListSheet,
  WaypointDetailSheet,
} from "./WaypointSheets";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { Linking, Platform, Pressable } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paragraph, Spinner, styled, useTheme, YStack } from "tamagui";
import { mapStyles, useMapSettings } from "../hooks/useMapSettings";
import { MapOverlays } from "./MapOverlays";
import { MapSettingsSheet } from "./MapSettings";
import { useCenterOnUser } from "../hooks/useCenterOnUser";

import { readMapCamera, saveMapCamera } from "../lib/mapCamera";

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

if (accessToken) {
  Mapbox.setAccessToken(accessToken);
}

const MapboxLogo = styled(Image, { w: 88, h: 24, rotate: "-90deg", shrink: 0 });

const MapView = styled(Mapbox.MapView, { f: 1 });

export const Map = () => {
  const camera = useRef<Mapbox.Camera>(null);
  const waypointAnnotations = useRef<
    Record<number, Mapbox.PointAnnotation | null>
  >({});
  const theme = useTheme();
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const sheet = useRef<BottomSheetModal>(null);
  const saveWaypointSheet = useRef<BottomSheetModal>(null);
  const waypointDetailSheet = useRef<BottomSheetModal>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<number | null>(null);
  const [editingWaypoint, setEditingWaypoint] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const pendingEdit = useRef(false);
  const pendingListSelection = useRef<number | null>(null);
  const waypointListSheet = useRef<BottomSheetModal>(null);
  const [draftCoordinates, setDraftCoordinates] = useState<
    [number, number] | null
  >(null);
  const [draftColor, setDraftColor] = useState(0);
  const mapHeight = useRef(0);
  const { waypoints, addWaypoint, removeWaypoint, updateWaypoint } =
    useWaypoints();
  const [initialCamera] = useState(readMapCamera);
  const [tilted, setTilted] = useState(initialCamera.pitch > 0);
  const mapSettings = useMapSettings();
  const { settings } = mapSettings;
  const toggleTilt = () => {
    camera.current?.setCamera({
      pitch: tilted ? 0 : 60,
      animationDuration: 600,
    });
    setTilted(!tilted);
  };
  const insets = useSafeAreaInsets();
  const { centerOnUser, locating, showUserLocation } = useCenterOnUser(camera);
  const centerDraft = (sheetTop: number) => {
    if (!draftCoordinates || !mapHeight.current) return;
    camera.current?.setCamera({
      centerCoordinate: draftCoordinates,
      padding: cameraPadding({
        pt: insets.top,
        pb: Math.max(0, mapHeight.current - sheetTop),
      }),
      animationMode: "easeTo",
      animationDuration: 300,
    });
  };
  const dismissDraft = () => {
    setDraftCoordinates(null);
    setDraftName("");
    setEditingWaypoint(null);
    setDraftColor(0);
    camera.current?.setCamera({
      padding: cameraPadding({}),
      animationMode: "easeTo",
      animationDuration: 300,
    });
  };
  if (!accessToken) {
    return (
      <YStack f={1} ai="center" jc="center" p="6" bg="background">
        <Paragraph text="center">
          Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local to load your map.
        </Paragraph>
      </YStack>
    );
  }

  return (
    <YStack
      f={1}
      onLayout={(event) => {
        mapHeight.current = event.nativeEvent.layout.height;
      }}
    >
      <MapView
        logoEnabled={false}
        attributionPosition={{
          left: Platform.OS === "ios" ? -10 : insets.left + 2,
          bottom: Platform.OS === "ios" ? 94 : insets.bottom + 94,
        }}
        onLongPress={(feature) => {
          if (feature.geometry.type !== "Point") return;
          const [longitude, latitude] = feature.geometry.coordinates;
          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;
          setDraftName("");
          setEditingWaypoint(null);
          setDraftColor(0);
          setDraftCoordinates([
            ((((longitude + 180) % 360) + 360) % 360) - 180,
            latitude,
          ]);
          saveWaypointSheet.current?.present();
        }}
        onMapIdle={(state) => {
          if (!draftCoordinates) saveMapCamera(state);
        }}
        styleURL={mapStyles[settings.style].url}
        projection={settings.globe ? "globe" : "mercator"}
        compassEnabled={settings.compass}
        scaleBarEnabled={settings.scale}
        scaleBarUnits={settings.units}
        scrollEnabled={settings.pan}
        zoomEnabled={settings.zoom}
        rotateEnabled={settings.rotate}
        pitchEnabled={settings.pitch}
      >
        <Mapbox.Camera ref={camera} defaultSettings={initialCamera} />
        <MapOverlays settings={settings} />
        {waypoints.map((waypoint, index) => (
          <Mapbox.PointAnnotation
            key={`${index}-${waypoint.join(",")}`}
            id={`waypoint-${index}`}
            ref={(annotation) => {
              waypointAnnotations.current[index] = annotation;
            }}
            selected={selectedWaypoint === index}
            onSelected={() => {
              if (selectedWaypoint === index) return;
              setSelectedWaypoint(index);
              waypointDetailSheet.current?.present();
            }}
            coordinate={[waypoint[1], waypoint[2]]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <WaypointPin
              color={waypoint[3]}
              outlined
              scale={selectedWaypoint === index ? 2 : 1}
              onLayout={() => waypointAnnotations.current[index]?.refresh()}
            />
          </Mapbox.PointAnnotation>
        ))}
        {draftCoordinates ? (
          <Mapbox.PointAnnotation
            key={`draft-${draftColor}`}
            id="waypoint-draft"
            coordinate={draftCoordinates}
            anchor={{ x: 0.5, y: 1 }}
          >
            <WaypointPin color={draftColor} outlined />
          </Mapbox.PointAnnotation>
        ) : null}
        {showUserLocation ? <Mapbox.LocationPuck /> : null}
      </MapView>
      <YStack
        pos="absolute"
        l={insets.left + 2}
        b={insets.bottom + 4}
        w={24}
        h={88}
        ai="center"
        jc="center"
        o={pressOpacity}
        accessibilityRole="link"
        accessibilityLabel="Mapbox"
        onPress={() => {
          void Linking.openURL("https://www.mapbox.com/");
        }}
      >
        <MapboxLogo
          source={require("../../assets/mapboxLogo.svg")}
          contentFit="contain"
        />
      </YStack>
      <YStack
        pos="absolute"
        r={insets.right + 12}
        b={insets.bottom + 12}
        w={52}
        gap={12}
        ai="center"
      >
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            controlsCollapsed ? "Expand map controls" : "Collapse map controls"
          }
          accessibilityState={{ expanded: !controlsCollapsed }}
          onPress={() => setControlsCollapsed((collapsed) => !collapsed)}
          style={({ pressed }) =>
            nativeStyles({
              w: 28,
              h: 28,
              br: 14,
              shrink: 0,
              ai: "center",
              jc: "center",
              as: "center",
              bg: theme.buttonBackground.val,
              o: pressed ? 0.6 : 1,
            })
          }
        >
          <Image
            pointerEvents="none"
            style={nativeStyles({ w: 12, h: 8 })}
            source={{
              uri: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"><path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="${theme.color.val}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${controlsCollapsed ? 180 : 0} 6 4)"/></svg>`)}`,
            }}
          />
        </Pressable>
        {!controlsCollapsed ? (
          <>
            <Button
              w={52}
              h={52}
              p={0}
              rounded={26}
              ai="center"
              jc="center"
              bg="buttonBackground"
              accessibilityLabel="Center map on my location"
              accessibilityHint="Requests location access if needed"
              accessibilityState={{ busy: locating, disabled: locating }}
              disabled={locating}
              onPress={centerOnUser}
            >
              {locating ? <Spinner c="color" /> : <LocationIcon />}
            </Button>
            <Button
              w={52}
              h={52}
              p={0}
              rounded={26}
              ai="center"
              jc="center"
              bg="buttonBackground"
              accessibilityLabel="Open waypoints"
              onPress={() => waypointListSheet.current?.present()}
            >
              <WaypointPin monochrome />
            </Button>
            <Button
              w={52}
              h={52}
              p={0}
              rounded={26}
              ai="center"
              jc="center"
              bg="buttonBackground"
              accessibilityLabel="Open map settings"
              onPress={() => sheet.current?.present()}
            >
              <SettingsIcon />
            </Button>
          </>
        ) : null}
      </YStack>
      <SaveWaypointSheet
        sheetRef={saveWaypointSheet}
        coordinates={draftCoordinates}
        name={draftName}
        onNameChange={setDraftName}
        editing={editingWaypoint !== null}
        color={draftColor}
        onColorChange={setDraftColor}
        onPositionChange={centerDraft}
        onDismiss={dismissDraft}
        onSave={(name, coordinates, color) => {
          if (editingWaypoint === null) addWaypoint(name, coordinates, color);
          else updateWaypoint(editingWaypoint, name, coordinates, color);
        }}
      />
      <WaypointListSheet
        sheetRef={waypointListSheet}
        waypoints={waypoints}
        onDelete={removeWaypoint}
        onSelect={(waypoint, index) => {
          pendingListSelection.current = index;
          camera.current?.setCamera({
            centerCoordinate: [waypoint[1], waypoint[2]],
            zoomLevel: 12,
            animationMode: "flyTo",
            animationDuration: 1000,
          });
        }}
        onDismiss={() => {
          const index = pendingListSelection.current;
          pendingListSelection.current = null;
          if (index === null || !waypoints[index]) return;
          setSelectedWaypoint(index);
          waypointDetailSheet.current?.present();
        }}
      />
      <WaypointDetailSheet
        sheetRef={waypointDetailSheet}
        waypoint={
          selectedWaypoint === null ? undefined : waypoints[selectedWaypoint]
        }
        onEdit={() => {
          pendingEdit.current = true;
          waypointDetailSheet.current?.dismiss();
        }}
        onDelete={() => {
          if (selectedWaypoint !== null) removeWaypoint(selectedWaypoint);
          setSelectedWaypoint(null);
          waypointDetailSheet.current?.dismiss();
        }}
        onDismiss={() => {
          const waypoint =
            selectedWaypoint === null ? undefined : waypoints[selectedWaypoint];
          if (pendingEdit.current && waypoint && selectedWaypoint !== null) {
            setEditingWaypoint(selectedWaypoint);
            setDraftName(waypoint[0]);
            setDraftColor(waypoint[3]);
            setDraftCoordinates([waypoint[1], waypoint[2]]);
            requestAnimationFrame(() => saveWaypointSheet.current?.present());
          }
          pendingEdit.current = false;
          setSelectedWaypoint(null);
        }}
      />
      <MapSettingsSheet sheetRef={sheet} {...mapSettings} onTilt={toggleTilt} />
    </YStack>
  );
};
