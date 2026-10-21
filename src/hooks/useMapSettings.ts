import { useMMKVObject } from "react-native-mmkv";
import { storage } from "../lib/storage";

export const mapStyles = {
  standard: { label: "Standard 3D", url: "mapbox://styles/mapbox/standard" },
  streets: { label: "Streets", url: "mapbox://styles/mapbox/streets-v12" },
  outdoors: { label: "Outdoors", url: "mapbox://styles/mapbox/outdoors-v12" },
  satellite: { label: "Satellite", url: "mapbox://styles/mapbox/satellite-v9" },
  hybrid: {
    label: "Satellite + streets",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  light: { label: "Light", url: "mapbox://styles/mapbox/light-v11" },
  dark: { label: "Dark", url: "mapbox://styles/mapbox/dark-v11" },
} as const;

export const defaultMapSettings = {
  style: "satellite" as keyof typeof mapStyles,
  lighting: "day" as "dawn" | "day" | "dusk" | "night",
  pois: true,
  transit: true,
  places: true,
  roads: true,
  terrain: false,
  exaggeration: 1,
  hillshade: false,
  contours: false,
  traffic: false,
  buildings: false,
  globe: true,
  compass: false,
  scale: true,
  units: "metric" as "metric" | "imperial" | "nautical",
  pan: true,
  zoom: true,
  rotate: true,
  pitch: true,
};

export type MapSettings = typeof defaultMapSettings;
export type BooleanSetting = {
  [K in keyof MapSettings]: MapSettings[K] extends boolean ? K : never;
}[keyof MapSettings];

export const useMapSettings = () => {
  const [stored, setStored] = useMMKVObject<
    Partial<MapSettings> & {
      basemapDefaultsVersion?: number;
      globeDefaultsVersion?: number;
    }
  >("map.settings.v1", storage);
  const settings = {
    ...defaultMapSettings,
    ...stored,
    globe: stored?.globeDefaultsVersion === 1 ? (stored.globe ?? true) : true,
    // Apply the new satellite default to existing installs without losing other preferences.
    style:
      stored?.basemapDefaultsVersion === 2
        ? (stored.style ?? "satellite")
        : "satellite",
  } satisfies MapSettings;
  const update = <K extends keyof MapSettings>(
    key: K,
    value: MapSettings[K],
  ) => {
    setStored((previous) => ({
      ...defaultMapSettings,
      ...previous,
      style: settings.style,
      globe: settings.globe,
      basemapDefaultsVersion: 2,
      globeDefaultsVersion: 1,
      [key]: value,
    }));
  };
  return {
    settings,
    update,
    reset: () =>
      setStored({
        ...defaultMapSettings,
        basemapDefaultsVersion: 2,
        globeDefaultsVersion: 1,
      }),
  };
};
