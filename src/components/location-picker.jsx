import { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

// Define the center of the map (default location)
const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

// Map container style
const containerStyle = {
  width: "100%",
  height: "400px",
};

const LocationPicker = ({ apiKey, onLocationSelect }) => {
  // State for selected location
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const inputRef = useRef(null);

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  // Function to get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = useCallback(
    async (lat, lng) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const formattedAddress = data.results[0].formatted_address;
          setAddress(formattedAddress);

          if (onLocationSelect) {
            onLocationSelect({
              lat,
              lng,
              address: formattedAddress,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, onLocationSelect]
  );

  // Function to get coordinates from address (geocoding)
  const getCoordinatesFromAddress = useCallback(
    async (address) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setSelectedLocation({ lat, lng });

          if (onLocationSelect) {
            onLocationSelect({
              lat,
              lng,
              address,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, onLocationSelect]
  );

  // Handle map click
  const handleMapClick = useCallback(
    (removeEventListener) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setSelectedLocation({ lat, lng });
        getAddressFromCoordinates(lat, lng);
      }
    },
    [getAddressFromCoordinates]
  );

  // Handle address input change
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      getCoordinatesFromAddress(address);
    }
  };

  // Initialize map when loaded
  useEffect(() => {
    if (isLoaded && !mapLoaded) {
      setMapLoaded(true);
      // Get user's current location if available
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
          (error) => {
            console.error("Error getting user location:", error);
            // Use default location if user location is not available
            getAddressFromCoordinates(defaultCenter.lat, defaultCenter.lng);
          }
        );
      } else {
        // Use default location if geolocation is not supported
        getAddressFromCoordinates(defaultCenter.lat, defaultCenter.lng);
      }
    }
  }, [isLoaded, mapLoaded, getAddressFromCoordinates]);

  // Render loading state
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
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Search"}
        </button>
      </form>

      <div className="rounded-md overflow-hidden border border-gray-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={containerStyle}
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

      <div className="text-sm text-gray-500">
        {isLoading ? (
          <p>Loading location data...</p>
        ) : (
          <p>
            Click anywhere on the map to select a location or search by address.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
