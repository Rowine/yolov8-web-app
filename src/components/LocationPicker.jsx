import { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const DEFAULT_CENTER = {
  lat: 40.7128,
  lng: -74.006,
};

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "400px",
};

export const LocationPicker = ({ apiKey, onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_CENTER);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const inputRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const getAddressFromCoordinates = useCallback(
    async (lat, lng) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.results?.[0]) {
          const formattedAddress = data.results[0].formatted_address;
          setAddress(formattedAddress);
          onLocationSelect?.({ lat, lng, address: formattedAddress });
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, onLocationSelect]
  );

  const getCoordinatesFromAddress = useCallback(
    async (searchAddress) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            searchAddress
          )}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.results?.[0]?.geometry?.location) {
          const { lat, lng } = data.results[0].geometry.location;
          setSelectedLocation({ lat, lng });
          onLocationSelect?.({ lat, lng, address: searchAddress });
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, onLocationSelect]
  );

  const handleMapClick = useCallback(
    (event) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setSelectedLocation({ lat, lng });
        getAddressFromCoordinates(lat, lng);
      }
    },
    [getAddressFromCoordinates]
  );

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      getCoordinatesFromAddress(address);
    }
  };

  useEffect(() => {
    if (isLoaded && !mapLoaded) {
      setMapLoaded(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setSelectedLocation(userLocation);
            getAddressFromCoordinates(userLocation.lat, userLocation.lng);
          },
          () => {
            getAddressFromCoordinates(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
          }
        );
      } else {
        getAddressFromCoordinates(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      }
    }
  }, [isLoaded, mapLoaded, getAddressFromCoordinates]);

  if (loadError) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-600">
        Error loading Google Maps. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-md">
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleAddressSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter a location"
          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
          aria-label="Location address"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Search"}
        </button>
      </form>

      <div className="rounded-md overflow-hidden border border-gray-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={selectedLocation}
          zoom={14}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          <Marker position={selectedLocation} />
        </GoogleMap>
      </div>
    </div>
  );
};
