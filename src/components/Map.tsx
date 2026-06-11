"use client";

interface MapProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export default function Map({ selectedCity, onSelectCity }: MapProps) {
  const cities = [
    { name: "Edmonton", top: "20%", left: "45%", type: "major" },
    { name: "Red Deer", top: "45%", left: "42%", type: "major" },
    { name: "Penhold", top: "48%", left: "46%", type: "minor" },
    { name: "Sylvan Lake", top: "43%", left: "35%", type: "minor" },
    { name: "Calgary", top: "70%", left: "40%", type: "major" },
  ];

  return (
    <div className="absolute inset-0 bg-[#e5e7eb] overflow-hidden flex flex-col justify-between">
      {/* Grid Overlay for "Map" Feel */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#4d6453 1px, transparent 1px), linear-gradient(90deg, #4d6453 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Map Zoom UI Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
        <button className="bg-surface shadow-md p-2 rounded-sm hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined select-none">add</span>
        </button>
        <button className="bg-surface shadow-md p-2 rounded-sm hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined select-none">remove</span>
        </button>
        <button className="bg-surface shadow-md p-2 rounded-sm hover:bg-surface-container-low mt-4 transition-colors">
          <span className="material-symbols-outlined select-none">my_location</span>
        </button>
      </div>

      {/* Alberta Landmass Shape (SVG for Atmosphere) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-5 grayscale pointer-events-none"
        fill="currentColor"
        viewBox="0 0 1000 1000"
      >
        <path d="M400,100 L600,100 L650,400 L620,900 L380,900 L350,400 Z" />
      </svg>

      {/* Interactive City Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {cities.map((city) => {
          const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
          
          if (city.type === "major") {
            return (
              <div
                key={city.name}
                className="absolute pointer-events-auto cursor-pointer group transition-transform duration-200 hover:scale-110"
                style={{ top: city.top, left: city.left }}
                onClick={() => onSelectCity(city.name)}
              >
                <div
                  className={`px-3 py-1 font-sans font-bold text-xs rounded shadow-lg flex items-center gap-1 transition-all duration-300 ${
                    isSelected
                      ? "bg-brand-gold-champagne text-white scale-105 border border-white"
                      : "bg-primary text-on-primary group-hover:bg-primary-container"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-sm select-none"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    push_pin
                  </span>
                  {city.name}
                </div>
                <div
                  className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] mx-auto transition-colors ${
                    isSelected ? "border-t-brand-gold-champagne" : "border-t-primary group-hover:border-t-primary-container"
                  }`}
                />
              </div>
            );
          } else {
            // Minor nodes
            return (
              <div
                key={city.name}
                className="absolute pointer-events-auto cursor-pointer group transition-all duration-200 hover:scale-105"
                style={{ top: city.top, left: city.left }}
                onClick={() => onSelectCity(city.name)}
              >
                <div
                  className={`px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full shadow-md border transition-all duration-300 ${
                    isSelected
                      ? "bg-brand-gold-champagne text-white border-white scale-105"
                      : "bg-primary-container text-on-primary-container border-primary group-hover:bg-primary group-hover:text-white"
                  }`}
                >
                  {city.name}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Legend & Summary Box */}
      <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur-md p-4 rounded border border-outline-variant shadow-2xl z-10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif text-md text-primary font-semibold">
              Alberta Corporate Reach
            </h4>
            <p className="text-[10px] font-sans text-on-surface-variant uppercase tracking-wider">
              {selectedCity === "All"
                ? "Click a location marker to filter suites"
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
