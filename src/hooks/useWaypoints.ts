import { useMMKVString } from "react-native-mmkv";
import { useMemo } from "react";
import { storage } from "../lib/storage";
import { createWaypoint, decodeWaypoints } from "../lib/waypoints";

export const useWaypoints = () => {
  const [serialized, setSerialized] = useMMKVString("waypoints.v1", storage);
  const waypoints = useMemo(() => decodeWaypoints(serialized), [serialized]);

  const addWaypoint = (
    name: string,
    coordinates: [number, number],
    color: number,
  ) => {
    const waypoint = createWaypoint(name, coordinates, color);
    setSerialized((previous) =>
      JSON.stringify([...decodeWaypoints(previous), waypoint]),
    );
  };
  const removeWaypoint = (index: number) => {
    setSerialized(
      JSON.stringify(waypoints.filter((_, candidate) => candidate !== index)),
    );
  };
  const updateWaypoint = (
    index: number,
    name: string,
    coordinates: [number, number],
    color: number,
  ) => {
    const waypoint = createWaypoint(name, coordinates, color);
    setSerialized((previous) =>
      JSON.stringify(
        decodeWaypoints(previous).map((item, candidate) =>
          candidate === index ? waypoint : item,
        ),
      ),
    );
  };
  return { waypoints, addWaypoint, removeWaypoint, updateWaypoint };
};
