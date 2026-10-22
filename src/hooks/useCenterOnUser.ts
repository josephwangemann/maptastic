import type { Camera } from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Alert, Linking } from "react-native";

export const useCenterOnUser = (cameraRef: RefObject<Camera | null>) => {
  const [locating, setLocating] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const centerOnUser = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLocating(true);
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      if (!mountedRef.current) return;
      if (!permission.granted) {
        setShowUserLocation(false);
        if (!permission.canAskAgain) {
          Alert.alert(
            "Location access is off",
            "Enable location access in Settings, then tap the location button again.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  void Linking.openSettings().catch(() => {
                    Alert.alert(
                      "Unable to open Settings",
                      "Open your device settings to enable location access for Maptastic.",
                    );
                  });
                },
              },
            ],
          );
        }
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        Alert.alert(
          "Location services are off",
          "Turn on location services on your device, then try again.",
        );
        return;
      }

      const position = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("Location timed out")),
            15000,
          );
        }),
      ]);
      if (!mountedRef.current) return;
      setShowUserLocation(true);
      cameraRef.current?.setCamera({
        centerCoordinate: [position.coords.longitude, position.coords.latitude],
        zoomLevel: 12,
        animationMode: "flyTo",
        animationDuration: 1000,
      });
    } catch {
      if (mountedRef.current) {
        Alert.alert(
          "Unable to find your location",
          "Check that location services are on and try again.",
        );
      }
    } finally {
      clearTimeout(timeout);
      busyRef.current = false;
      if (mountedRef.current) setLocating(false);
    }
  };

  return { centerOnUser, locating, showUserLocation };
};
