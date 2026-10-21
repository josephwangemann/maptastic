import type { MapState } from "@rnmapbox/maps";
import { storage } from "./storage";

const cameraKey = "map.camera.v1";

type SavedCamera = {
  centerCoordinate: [number, number];
  zoomLevel: number;
  heading: number;
  pitch: number;
};

const worldView: SavedCamera = {
  centerCoordinate: [0, 0],
  zoomLevel: 0,
  heading: 0,
  pitch: 0,
};

const isSavedCamera = (value: unknown): value is SavedCamera => {
  if (!value || typeof value !== "object") return false;
  const camera = value as Partial<SavedCamera>;
  return (
    Array.isArray(camera.centerCoordinate) &&
    camera.centerCoordinate.length === 2 &&
    camera.centerCoordinate.every(Number.isFinite) &&
    Math.abs(camera.centerCoordinate[1]) <= 90 &&
    typeof camera.zoomLevel === "number" &&
    Number.isFinite(camera.zoomLevel) &&
    camera.zoomLevel >= 0 &&
    camera.zoomLevel <= 25 &&
    typeof camera.heading === "number" &&
    Number.isFinite(camera.heading) &&
    typeof camera.pitch === "number" &&
    Number.isFinite(camera.pitch) &&
    camera.pitch >= 0 &&
    camera.pitch <= 85
  );
};

export const readMapCamera = (): SavedCamera => {
  try {
    const saved = storage.getString(cameraKey);
    const camera: unknown = saved ? JSON.parse(saved) : undefined;
    return isSavedCamera(camera) ? camera : worldView;
  } catch {
    return worldView;
  }
};

export const saveMapCamera = ({ properties, gestures }: MapState) => {
  if (gestures.isGestureActive) return;
  const camera = {
    centerCoordinate: properties.center.slice(0, 2),
    zoomLevel: properties.zoom,
    heading: properties.heading,
    pitch: properties.pitch,
  };
  if (!isSavedCamera(camera)) return;
  const serialized = JSON.stringify(camera);
  if (storage.getString(cameraKey) !== serialized) {
    storage.set(cameraKey, serialized);
  }
};
