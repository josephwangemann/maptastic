const radarEndpoint =
  "https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows";

export const radarRefreshInterval = 2 * 60 * 1000;

export const readRadarTime = (xml: string) => {
  const dimension = xml.match(/<Dimension\b[^>]*\bname="time"[^>]*>/i)?.[0];
  const time = dimension?.match(/\bdefault="([^"]+)"/i)?.[1];
  if (!time || !Number.isFinite(Date.parse(time))) {
    throw new Error("Radar time unavailable");
  }
  return time;
};

export const fetchRadarTime = async (signal: AbortSignal) => {
  const response = await fetch(
    `${radarEndpoint}?service=WMS&version=1.3.0&request=GetCapabilities`,
    { signal, cache: "no-store" },
  );
  if (!response.ok) throw new Error("Radar unavailable");
  return readRadarTime(await response.text());
};

export const radarTileUrl = (time: string) =>
  `${radarEndpoint}?service=WMS&version=1.1.1&request=GetMap&layers=conus_bref_qcd&styles=&format=image/png&transparent=true&srs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}&time=${encodeURIComponent(time)}`;
