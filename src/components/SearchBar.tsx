"use client";

import { useState, useRef, useEffect } from "react";

const AVAILABLE_LOCATIONS = [
  "Calgary",
  "Edmonton",
  "Red Deer",
  "Penhold",
  "Sylvan Lake"
];

export default function SearchBar() {
  const [cityInput, setCityInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const checkinInputRef = useRef<HTMLInputElement>(null);

  // Filter locations based on input text
  const filteredLocations = AVAILABLE_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(cityInput.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCalendarClick = () => {
    if (checkinInputRef.current) {
      checkinInputRef.current.focus();
      try {
        checkinInputRef.current.showPicker();
      } catch (err) {
        console.error("Failed to show date picker: ", err);
      }
    }
  };

  const handleLocationSelect = (loc: string) => {
    setCityInput(loc);
    setIsDropdownOpen(false);
  };

  return (
    <form
      action="/properties"
      method="GET"
      className="bg-surface-container-lowest hairline-border p-2 flex flex-col md:flex-row gap-2 mt-8 shadow-sm rounded-sm w-full relative"
    >
      {/* Location Input - flex-[1.5] for a larger share of space on desktop */}
      <div ref={dropdownRef} className="flex-[1.5] flex items-center px-4 gap-3 min-w-0 relative">
        <span className="material-symbols-outlined text-primary-container select-none">
          location_on
        </span>
        <input
          name="city"
          type="text"
          value={cityInput}
          onChange={(e) => {
            setCityInput(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full border-none focus:ring-0 focus:outline-none font-sans text-sm text-on-surface bg-transparent"
          placeholder="Where in Alberta?"
          autoComplete="off"
        />

        {/* Dropdown Menu */}
        {isDropdownOpen && filteredLocations.length > 0 && (
          <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white hairline-border ambient-shadow rounded-sm z-50 overflow-hidden font-sans text-sm">
            <div className="py-1">
              {filteredLocations.map((loc) => (
                <div
                  key={loc}
                  onClick={() => handleLocationSelect(loc)}
                  className="px-4 py-3 hover:bg-surface-container-low text-on-surface hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-primary-container text-base select-none">
                    location_on
                  </span>
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px bg-outline-variant hidden md:block my-2 self-stretch" />

      {/* Date Input - flex-1 */}
      <div className="flex-1 flex items-center px-4 gap-3 min-w-0">
        <span
          className="material-symbols-outlined text-primary-container select-none cursor-pointer hover:text-primary transition-colors"
          onClick={handleCalendarClick}
        >
          calendar_today
        </span>
        <input
          ref={checkinInputRef}
          name="checkin"
          type="text"
          onFocus={(e) => {
            e.target.type = "date";
            try {
              e.target.showPicker();
            } catch (err) {}
          }}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.type = "text";
            }
          }}
          className="w-full border-none focus:ring-0 focus:outline-none font-sans text-sm text-on-surface bg-transparent cursor-pointer"
          placeholder="Check-in Date"
        />
      </div>

      <button
        type="submit"
        className="bg-primary-container text-white px-8 py-3.5 font-sans font-semibold text-xs uppercase tracking-widest hover:bg-primary transition-colors cursor-pointer shrink-0"
      >
        Browse Properties
      </button>
    </form>
  );
}
