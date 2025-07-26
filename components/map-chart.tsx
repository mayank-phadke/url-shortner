import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import geoData from "@/lib/features.json";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GeoClick {
  country: string;
  count: number;
}

interface MapChartProps {
  geoClicks?: GeoClick[];
}

export default function MapChart({ geoClicks = [] }: MapChartProps) {
  const [fillDefault, setFillDefault] = useState<string>("#D6D6DA");
  const [fillPressed, setFillPressed] = useState<string>("#D6D6DA");

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setFillDefault(style.getPropertyValue("--foreground").trim());
    setFillPressed(style.getPropertyValue("--background").trim());
  }, []);

  // Build a lookup for country click counts
  const countryClicks: Record<string, number> = {};
  geoClicks.forEach(({ country, count }) => {
    countryClicks[country] = count;
  });

  // Find max count for gradient scaling
  const maxCount = Math.max(...geoClicks.map((g) => g.count), 1);

  // Helper to get color for a given count (theme-based gradient)
  function hexToRgb(hex: string) {
    hex = hex.replace("#", "");
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    const num = parseInt(hex, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
  }

  function getGradientColor(count: number) {
    if (count === 0) return fillDefault;
    // Use theme background as min, foreground as max
    const minColor = hexToRgb(fillDefault.replace(/[^#a-fA-F0-9]/g, ""));
    const maxColor = hexToRgb(fillPressed.replace(/[^#a-fA-F0-9]/g, ""));
    const ratio = Math.min(count / maxCount, 1);
    const rgb = minColor.map((min, i) =>
      Math.round(min + (maxColor[i] - min) * ratio)
    );
    return `rgb(${rgb.join(",")})`;
  }

  return (
    <TooltipProvider>
      <ComposableMap
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <ZoomableGroup>
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const clickCount = countryClicks[countryName] || 0;
                const fillColor = getGradientColor(clickCount);
                return (
                  <Tooltip key={geo.rsmKey}>
                    <TooltipTrigger asChild>
                      <Geography
                        geography={geo}
                        style={{
                          default: {
                            fill: fillColor,
                            outline: "none",
                          },
                          hover: {
                            fill: fillPressed,
                            outline: "none",
                          },
                          pressed: {
                            fill: fillPressed,
                            outline: "none",
                          },
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {countryName}
                      {clickCount > 0 ? ` (${clickCount} clicks)` : ""}
                    </TooltipContent>
                  </Tooltip>
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </TooltipProvider>
  );
}
