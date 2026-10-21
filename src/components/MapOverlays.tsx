import Mapbox from "@rnmapbox/maps";
import { useTheme } from "tamagui";
import type { MapSettings } from "../hooks/useMapSettings";

export const MapOverlays = ({ settings }: { settings: MapSettings }) => {
  const theme = useTheme();
  return (
    <>
      {settings.style === "standard" ? (
        <Mapbox.StyleImport
          id="basemap"
          existing
          config={{
            lightPreset: settings.lighting,
            show3dBuildings: settings.buildings,
            showPointOfInterestLabels: settings.pois,
            showTransitLabels: settings.transit,
            showPlaceLabels: settings.places,
            showRoadLabels: settings.roads,
          }}
        />
      ) : null}
      {settings.terrain || settings.hillshade ? (
        <Mapbox.RasterDemSource
          id="app-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxZoomLevel={14}
        >
          {settings.terrain ? (
            <Mapbox.Terrain style={{ exaggeration: settings.exaggeration }} />
          ) : (
            <></>
          )}
          {settings.hillshade ? (
            <Mapbox.HillshadeLayer
              id="app-hillshade"
              style={{ hillshadeExaggeration: 0.5 }}
            />
          ) : (
            <></>
          )}
        </Mapbox.RasterDemSource>
      ) : null}
      {settings.contours ? (
        <Mapbox.VectorSource
          id="app-contours"
          url="mapbox://mapbox.mapbox-terrain-v2"
        >
          <Mapbox.LineLayer
            id="app-contour-lines"
            sourceLayerID="contour"
            minZoomLevel={10}
            style={{
              lineColor: theme.contour.val,
              lineWidth: 1,
              lineOpacity: 0.6,
            }}
          />
          <Mapbox.SymbolLayer
            id="app-contour-labels"
            sourceLayerID="contour"
            minZoomLevel={12}
            style={{
              symbolPlacement: "line",
              textField: ["concat", ["to-string", ["get", "ele"]], " m"],
              textSize: 10,
              textColor: theme.contourLabel.val,
              textHaloColor: theme.mapHalo.val,
              textHaloWidth: 1,
            }}
          />
        </Mapbox.VectorSource>
      ) : null}
      {settings.traffic ? (
        <Mapbox.VectorSource
          id="app-traffic"
          url="mapbox://mapbox.mapbox-traffic-v1"
        >
          <Mapbox.LineLayer
            id="app-traffic-lines"
            sourceLayerID="traffic"
            minZoomLevel={6}
            style={{
              lineColor: [
                "match",
                ["get", "congestion"],
                "low",
                theme.trafficLow.val,
                "moderate",
                theme.trafficModerate.val,
                "heavy",
                theme.trafficHeavy.val,
                "severe",
                theme.trafficSevere.val,
                theme.trafficLow.val,
              ],
              lineOpacity: [
                "case",
                [
                  "in",
                  ["get", "congestion"],
                  ["literal", ["low", "moderate", "heavy", "severe"]],
                ],
                1,
                0,
              ],
              lineWidth: 3,
              lineOffset: 2,
            }}
          />
        </Mapbox.VectorSource>
      ) : null}
      {settings.buildings && settings.style !== "standard" ? (
        <Mapbox.VectorSource
          id="app-buildings"
          url="mapbox://mapbox.mapbox-streets-v8"
        >
          <Mapbox.FillExtrusionLayer
            id="app-building-extrusions"
            sourceLayerID="building"
            minZoomLevel={15}
            maxZoomLevel={24}
            filter={["==", ["get", "extrude"], "true"]}
            style={{
              fillExtrusionColor: theme.building.val,
              fillExtrusionHeight: ["to-number", ["get", "height"], 0],
              fillExtrusionBase: ["to-number", ["get", "min_height"], 0],
              fillExtrusionOpacity: 0.8,
            }}
          />
        </Mapbox.VectorSource>
      ) : null}
    </>
  );
};
