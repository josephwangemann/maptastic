import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { fetchRadarTime, radarRefreshInterval } from "../lib/radar";

export const useRadar = (enabled: boolean) => {
  const [frame, setFrame] = useState({
    time: null as string | null,
    loading: false,
    error: false,
  });

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let foreground =
      AppState.currentState !== "background" &&
      AppState.currentState !== "inactive";
    let request: AbortController | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const timeout = setTimeout(() => controller.abort(), 15000);
      setFrame((previous) => ({ ...previous, loading: true, error: false }));
      try {
        const time = await fetchRadarTime(controller.signal);
        if (!disposed && foreground && !controller.signal.aborted) {
          setFrame({ time, loading: false, error: false });
        }
      } catch {
        if (!disposed && foreground && request === controller) {
          setFrame((previous) => ({
            ...previous,
            loading: false,
            error: true,
          }));
        }
      } finally {
        clearTimeout(timeout);
      }
    };
    const start = () => {
      void refresh();
      interval = setInterval(() => void refresh(), radarRefreshInterval);
    };
    if (foreground) start();
    const subscription = AppState.addEventListener("change", (state) => {
      foreground = state === "active";
      clearInterval(interval);
      request?.abort();
      if (foreground) start();
    });
    return () => {
      disposed = true;
      clearInterval(interval);
      request?.abort();
      subscription.remove();
    };
  }, [enabled]);

  return frame;
};
