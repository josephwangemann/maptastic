export type MapSearchResult = {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  type: string;
};

export const searchMap = async (
  query: string,
  proximity: [number, number] | undefined,
  signal: AbortSignal,
): Promise<{ results: MapSearchResult[]; attribution: string }> => {
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token)
    throw new Error("Map search is unavailable. Please try again later.");

  const params = new URLSearchParams({
    q: query.trim(),
    access_token: token,
    limit: "10",
  });
  if (proximity) params.set("proximity", proximity.join(","));

  const response = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/forward?${params}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? "Too many searches. Please wait a moment and try again."
        : "Couldn't search the map. Please try again.",
    );
  }
  const data = (await response.json()) as {
    features?: {
      geometry?: { type?: string; coordinates?: number[] };
      properties?: {
        mapbox_id?: string;
        name?: string;
        full_address?: string;
        place_formatted?: string;
        feature_type?: string;
      };
    }[];
    attribution?: string;
  };
  if (!Array.isArray(data.features)) {
    throw new Error("Couldn't read search results. Please try again.");
  }
  const results: MapSearchResult[] = [];
  for (const feature of data.features) {
    const properties = feature.properties;
    const coordinates = feature.geometry?.coordinates;
    if (
      feature.geometry?.type !== "Point" ||
      !coordinates ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1]) ||
      Math.abs(coordinates[0]) > 180 ||
      Math.abs(coordinates[1]) > 90 ||
      typeof properties?.mapbox_id !== "string" ||
      typeof properties.name !== "string"
    )
      continue;
    results.push({
      id: properties.mapbox_id,
      name: properties.name,
      address: properties.full_address ?? properties.place_formatted ?? "",
      coordinates: [coordinates[0], coordinates[1]],
      type: properties.feature_type ?? "poi",
    });
  }
  return { results, attribution: data.attribution ?? "© Mapbox" };
};
