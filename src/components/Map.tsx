"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const CITIES = [
  { name: "Edmonton", coords: [53.5461, -113.4938] as [number, number], type: "major" },
  { name: "Red Deer", coords: [52.2681, -113.8112] as [number, number], type: "major" },
  { name: "Penhold", coords: [52.1378, -113.8617] as [number, number], type: "minor" },
  { name: "Sylvan Lake", coords: [52.3083, -113.9833] as [number, number], type: "minor" },
  { name: "Calgary", coords: [51.0447, -114.0719] as [number, number], type: "major" },
];

export default function Map({ selectedCity, onSelectCity }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize Leaflet Map centered on central Alberta
    const map = L.map(mapContainerRef.current, {
      center: [52.35, -114.0],
      zoom: 6.5,
      zoomControl: false, // Custom styled controls are rendered on top
      attributionControl: false,
    });

    mapRef.current = map;

    // Add a premium, minimal, light grey map theme (CartoDB Positron)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    // Render city markers
    CITIES.forEach((city) => {
      const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();

      const icon = L.divIcon({
        className: "custom-div-icon",
        html: createMarkerHtml(city.name, city.type, isSelected),
        iconSize: city.type === "major" ? [120, 42] : [100, 30],
        iconAnchor: city.type === "major" ? [60, 42] : [50, 30],
      });

      const marker = L.marker(city.coords, { icon }).addTo(map);
      markersRef.current[city.name] = marker;

      // Handle marker click
      marker.on("click", () => {
        onSelectCity(city.name);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker styles and zoom level when selectedCity changes
  useEffect(() => {
    if (!mapRef.current) return;

    CITIES.forEach((city) => {
      const marker = markersRef.current[city.name];
      if (marker) {
        const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
        const icon = L.divIcon({
          className: "custom-div-icon",
          html: createMarkerHtml(city.name, city.type, isSelected),
          iconSize: city.type === "major" ? [120, 42] : [100, 30],
          iconAnchor: city.type === "major" ? [60, 42] : [50, 30],
        });
        marker.setIcon(icon);
      }
    });

    const activeCity = CITIES.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase());
    if (activeCity && mapRef.current) {
      mapRef.current.setView(activeCity.coords, 9, { animate: true, duration: 1 });
    } else if (selectedCity === "All" && mapRef.current) {
      mapRef.current.setView([52.35, -114.0], 6.5, { animate: true, duration: 1 });
    }
  }, [selectedCity]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapRef.current?.setView([52.35, -114.0], 6.5, { animate: true });
  };

  return (
    <div className="absolute inset-0 bg-[#f9faf8] overflow-hidden flex flex-col justify-between">
      {/* Leaflet Mount Node */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Map Zoom UI Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10 font-sans">
        <button
          type="button"
          onClick={handleZoomIn}
          className="bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-sm hover:bg-surface-container-low transition-colors border border-outline-variant cursor-pointer"
        >
          <span className="material-symbols-outlined select-none text-primary">add</span>
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-sm hover:bg-surface-container-low transition-colors border border-outline-variant cursor-pointer"
        >
          <span className="material-symbols-outlined select-none text-primary">remove</span>
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-sm hover:bg-surface-container-low mt-4 transition-colors border border-outline-variant cursor-pointer"
        >
          <span className="material-symbols-outlined select-none text-primary">my_location</span>
        </button>
      </div>

      {/* Legend & Summary Box */}
      <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur-md p-4 rounded border border-outline-variant shadow-2xl z-10 font-sans pointer-events-auto">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif text-sm text-primary font-semibold">
              Alberta Corporate Reach
            </h4>
            <p className="text-[10px] font-sans text-on-surface-variant uppercase tracking-wider">
              {selectedCity === "All"
                ? "Click a map pin to filter suites"
                : `Showing suites in ${selectedCity}`}
            </p>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-fixed text-xs select-none">
                check_circle
              </span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary flex items-center justify-center text-on-primary text-[8px] font-bold">
              5+ Cities
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function createMarkerHtml(name: string, type: string, isSelected: boolean): string {
  if (type === "major") {
    // Styled pins matching StayAlberta
    const bgClass = isSelected
      ? "bg-brand-gold-champagne text-white border-white scale-105"
      : "bg-primary text-white border-primary hover:bg-primary-container";
    const arrowBorderClass = isSelected ? "border-t-brand-gold-champagne" : "border-t-primary";

    return `
      <div class="flex flex-col items-center">
        <div class="px-3 py-1.5 font-sans font-bold text-xs rounded shadow-lg flex items-center gap-1 border transition-all duration-300 ${bgClass}">
          <span class="material-symbols-outlined text-sm select-none" style="font-variation-settings: 'FILL' 1">
            push_pin
          </span>
          <span>${name}</span>
        </div>
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] mx-auto transition-colors ${arrowBorderClass}"></div>
      </div>
    `;
  } else {
    // Minor nodes (Penhold, Sylvan Lake)
    const bgClass = isSelected
      ? "bg-brand-gold-champagne text-white border-white scale-105"
      : "bg-primary-container text-on-primary-container border-primary hover:bg-primary hover:text-white";

    return `
      <div class="flex justify-center">
        <div class="px-2.5 py-1.5 text-[10px] font-sans font-bold uppercase tracking-wider rounded shadow-md border transition-all duration-300 ${bgClass}">
          ${name}
        </div>
      </div>
    `;
  }
}
