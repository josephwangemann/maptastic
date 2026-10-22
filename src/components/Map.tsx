import { SettingsIcon } from "./SettingsIcon";
import { LocationIcon } from "./LocationIcon";
import { SearchIcon } from "./SearchIcon";
import { ResetViewIcon } from "./ResetViewIcon";
import { SearchSheet } from "./SearchSheet";
import type { Waypoint } from "../lib/waypoints";
import type { MapSearchResult } from "../lib/mapSearch";
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
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paragraph, Spinner, styled, useTheme, YStack } from "tamagui";
import { mapStyles, useMapSettings } from "../hooks/useMapSettings";
import { MapOverlays } from "./MapOverlays";
import { MapSettingsSheet } from "./MapSettings";
import { useCenterOnUser } from "../hooks/useCenterOnUser";
import { useRadar } from "../hooks/useRadar";

import { readMapCamera, saveMapCamera } from "../lib/mapCamera";

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

if (accessToken) {
  Mapbox.setAccessToken(accessToken);
}

const MapboxLogo = styled(Image, { w: 88, h: 24, rotate: "-90deg", shrink: 0 });

const MapView = styled(Mapbox.MapView, { f: 1 });

const needsOrientationReset = (heading: number, pitch: number) => {
  const bearing = ((((heading + 180) % 360) + 360) % 360) - 180;
  return Math.abs(bearing) > 0.01 || Math.abs(pitch) > 0.01;
};

export const Map = () => {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const pinsRef = useRef<Record<number, Mapbox.PointAnnotation | null>>({});
  const theme = useTheme();
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);
  const searchRef = useRef<BottomSheetModal>(null);
  const saveRef = useRef<BottomSheetModal>(null);
  const detailRef = useRef<BottomSheetModal>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<number | null>(null);
  const [editingWaypoint, setEditingWaypoint] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const editRef = useRef(false);
  const selectionRef = useRef<number | null>(null);
  const listRef = useRef<BottomSheetModal>(null);
  const [draftCoordinates, setDraftCoordinates] = useState<
    [number, number] | null
  >(null);
  const [draftColor, setDraftColor] = useState(0);
  const heightRef = useRef(0);
  const { waypoints, addWaypoint, removeWaypoint, updateWaypoint } =
    useWaypoints();
  const [initialCamera] = useState(readMapCamera);
  const mapHeading = useSharedValue(initialCamera.heading);
  const centerRef = useRef(initialCamera.centerCoordinate);
  const [searchProximity, setSearchProximity] = useState<[number, number]>();
  const [searchResult, setSearchResult] = useState<MapSearchResult | null>(
    null,
  );
  const [tilted, setTilted] = useState(initialCamera.pitch > 0);
  const [showResetView, setShowResetView] = useState(
    needsOrientationReset(initialCamera.heading, initialCamera.pitch),
  );
  const mapSettings = useMapSettings();
  const { settings } = mapSettings;
  const radar = useRadar(settings.radar);
  const toggleTilt = () => {
    cameraRef.current?.setCamera({
      pitch: tilted ? 0 : 60,
      animationDuration: 600,
    });
    setTilted(!tilted);
  };
  const resetView = () => {
    cameraRef.current?.setCamera({
      heading: 0,
      pitch: 0,
      animationMode: "easeTo",
      animationDuration: 600,
    });
  };
  const insets = useSafeAreaInsets();
  const { centerOnUser, locating, showUserLocation } =
    useCenterOnUser(cameraRef);
  const centerDraft = (sheetTop: number) => {
    if (!draftCoordinates || !heightRef.current) return;
    cameraRef.current?.setCamera({
      centerCoordinate: draftCoordinates,
      padding: cameraPadding({
        pt: insets.top,
        pb: Math.max(0, heightRef.current - sheetTop),
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
    cameraRef.current?.setCamera({
      padding: cameraPadding({}),
      animationMode: "easeTo",
      animationDuration: 300,
    });
  };
  const selectWaypoint = (waypoint: Waypoint, index: number) => {
    selectionRef.current = index;
    cameraRef.current?.setCamera({
      centerCoordinate: [waypoint[1], waypoint[2]],
      zoomLevel: 12,
      animationMode: "flyTo",
      animationDuration: 1000,
    });
  };
  const presentPendingWaypoint = () => {
    const index = selectionRef.current;
    selectionRef.current = null;
    if (index === null || !waypoints[index]) return;
    setSelectedWaypoint(index);
    detailRef.current?.present();
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
        heightRef.current = event.nativeEvent.layout.height;
      }}
    >
      <MapView
        logoEnabled={false}
        attributionPosition={{
          left: Platform.OS === "ios" ? -10 : insets.left + 2,
          bottom: Platform.OS === "ios" ? 94 : insets.bottom + 94,
        }}
        onLongPress={(feature) => {
          setSearchResult(null);
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
          saveRef.current?.present();
        }}
        onCameraChanged={({ properties }) => {
          mapHeading.value = properties.heading;
          setShowResetView(
            needsOrientationReset(properties.heading, properties.pitch),
          );
          setTilted(properties.pitch > 0.01);
        }}
        onMapIdle={(state) => {
          centerRef.current = [
            state.properties.center[0],
            state.properties.center[1],
          ];
          if (!draftCoordinates && !searchResult) saveMapCamera(state);
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
        <Mapbox.Camera ref={cameraRef} defaultSettings={initialCamera} />
        <MapOverlays settings={settings} radarTime={radar.time} />
        {waypoints.map((waypoint, index) => (
          <Mapbox.PointAnnotation
            key={`${index}-${waypoint.join(",")}`}
            id={`waypoint-${index}`}
            ref={(annotation) => {
              pinsRef.current[index] = annotation;
            }}
            selected={selectedWaypoint === index}
            onSelected={() => {
              if (selectedWaypoint === index) return;
              setSelectedWaypoint(index);
              detailRef.current?.present();
            }}
            coordinate={[waypoint[1], waypoint[2]]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <WaypointPin
              color={waypoint[3]}
              outlined
              scale={selectedWaypoint === index ? 2 : 1}
              onLayout={() => pinsRef.current[index]?.refresh()}
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
            <WaypointPin color={draftColor} outlined scale={2} />
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
            {showResetView ? (
              <Button
                w={52}
                h={52}
                p={0}
                rounded={26}
                ai="center"
                jc="center"
                bg="buttonBackground"
                accessibilityLabel="Reset map to north-up and flat"
                onPress={resetView}
              >
                <ResetViewIcon heading={mapHeading} />
              </Button>
            ) : null}
            <Button
              w={52}
              h={52}
              p={0}
              rounded={26}
              ai="center"
              jc="center"
              bg="buttonBackground"
              accessibilityLabel="Search places"
              onPress={() => {
                setSearchProximity(centerRef.current);
                setSearchResult(null);
                searchRef.current?.present();
              }}
            >
              <SearchIcon />
            </Button>
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
              onPress={() => listRef.current?.present()}
            >
              <WaypointPin monochrome scale={0.85} />
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
              onPress={() => sheetRef.current?.present()}
            >
              <SettingsIcon />
            </Button>
          </>
        ) : null}
      </YStack>
      <SearchSheet
        sheetRef={searchRef}
        proximity={searchProximity}
        onSelect={(result) => {
          setSearchResult(result);
          cameraRef.current?.setCamera({
            centerCoordinate: result.coordinates,
            zoomLevel:
              result.type === "country"
                ? 4
                : result.type === "region"
                  ? 7
                  : result.type === "place"
                    ? 11
                    : 15,
            animationMode: "flyTo",
            animationDuration: 1000,
          });
        }}
      />
      <SaveWaypointSheet
        sheetRef={saveRef}
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
        sheetRef={listRef}
        waypoints={waypoints}
        onDelete={removeWaypoint}
        onSelect={selectWaypoint}
        onDismiss={presentPendingWaypoint}
      />
      <WaypointDetailSheet
        sheetRef={detailRef}
        waypoint={
          selectedWaypoint === null ? undefined : waypoints[selectedWaypoint]
        }
        onEdit={() => {
          editRef.current = true;
          detailRef.current?.dismiss();
        }}
        onDelete={() => {
          if (selectedWaypoint !== null) removeWaypoint(selectedWaypoint);
          setSelectedWaypoint(null);
          detailRef.current?.dismiss();
        }}
        onDismiss={() => {
          const waypoint =
            selectedWaypoint === null ? undefined : waypoints[selectedWaypoint];
          if (editRef.current && waypoint && selectedWaypoint !== null) {
            setEditingWaypoint(selectedWaypoint);
            setDraftName(waypoint[0]);
            setDraftColor(waypoint[3]);
            setDraftCoordinates([waypoint[1], waypoint[2]]);
            requestAnimationFrame(() => saveRef.current?.present());
          }
          editRef.current = false;
          setSelectedWaypoint(null);
        }}
      />
      <MapSettingsSheet
        sheetRef={sheetRef}
        {...mapSettings}
        onTilt={toggleTilt}
        radar={radar}
      />
    </YStack>
  );
};
