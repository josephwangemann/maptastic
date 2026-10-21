export type Waypoint = [
  name: string,
  longitude: number,
  latitude: number,
  color: number,
];

export const pinColors = [
  "pinBlue",
  "pinRed",
  "pinOrange",
  "pinGreen",
  "pinPurple",
  "pinWhite",
] as const;

export const isWaypoint = (value: unknown): value is Waypoint =>
  Array.isArray(value) &&
  value.length === 4 &&
  typeof value[0] === "string" &&
  value[0].trim().length > 0 &&
  value[0].length <= 80 &&
  typeof value[1] === "number" &&
  Number.isFinite(value[1]) &&
  Math.abs(value[1]) <= 180 &&
  typeof value[2] === "number" &&
  Number.isFinite(value[2]) &&
  Math.abs(value[2]) <= 90 &&
  Number.isInteger(value[3]) &&
  value[3] >= 0 &&
  value[3] < pinColors.length;

export const createWaypoint = (
  name: string,
  coordinates: [number, number],
  color: number,
): Waypoint => {
  const waypoint: Waypoint = [
    name.trim().slice(0, 80),
    Number(coordinates[0].toFixed(6)),
    Number(coordinates[1].toFixed(6)),
    color,
  ];
  if (!isWaypoint(waypoint)) throw new Error("Invalid waypoint");
  return waypoint;
};

export const decodeWaypoints = (serialized: string | undefined): Waypoint[] => {
  try {
    const value: unknown = JSON.parse(serialized ?? "[]");
    return Array.isArray(value) ? value.filter(isWaypoint) : [];
  } catch {
    return [];
  }
};
