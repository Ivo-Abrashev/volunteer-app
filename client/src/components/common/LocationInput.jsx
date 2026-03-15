// src/components/common/LocationInput.jsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getReadableAddress = (data) => {
  if (!data) return '';

  const address = data.address || {};
  const streetName =
    address.road ||
    address.pedestrian ||
    address.footway ||
    address.path ||
    address.cycleway ||
    address.residential ||
    '';

  const street = [streetName, address.house_number].filter(Boolean).join(' ');
  const area =
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.city_district ||
    '';
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    '';

  return [street, area, city].filter(Boolean).join(', ') || data.display_name || '';
};

function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition([lat, lng]);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=bg&lat=${lat}&lon=${lng}`
        );

        if (!response.ok) {
          throw new Error(`Reverse geocoding failed with status ${response.status}`);
        }

        const data = await response.json();
        const readableAddress = getReadableAddress(data);

        if (onLocationSelect) {
          onLocationSelect({
            lat,
            lng,
            address: readableAddress || 'Избрана локация на картата',
          });
        }
      } catch (err) {
        console.error('Грешка при reverse geocoding:', err);
        if (onLocationSelect) {
          onLocationSelect({
            lat,
            lng,
            address: 'Избрана локация на картата',
          });
        }
      }
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Избрана локация</Popup>
    </Marker>
  ) : null;
}

const LocationInput = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  onLocationSelect,
  initialLat,
  initialLng,
}) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);

  const initialPosition =
    initialLat != null && initialLng != null
      ? [Number(initialLat), Number(initialLng)]
      : null;

  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [mapCenter, setMapCenter] = useState([42.1354, 24.7453]);

  useEffect(() => {
    if (initialLat != null && initialLng != null) {
      const lat = Number(initialLat);
      const lng = Number(initialLng);
      setSelectedPosition([lat, lng]);
      setMapCenter([lat, lng]);
    }
  }, [initialLat, initialLng]);

  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (onChange) {
      onChange({ target: { name, value: query } });
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (query.length < 3) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&q=${encodeURIComponent(
            query
          )}&limit=5&countrycodes=bg&accept-language=bg`
        );
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      } catch (err) {
        console.error('Грешка при търсене:', err);
      }
    }, 1000);
  };

  const handleSelectResult = (result) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };

    setSearchQuery(result.display_name);
    setSelectedPosition([location.lat, location.lng]);
    setMapCenter([location.lat, location.lng]);
    setShowResults(false);

    if (onChange) {
      onChange({ target: { name, value: result.display_name } });
    }

    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder="Търси локация... (напр. бул. България 1, Пловдив)"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-40 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
              >
                <p className="text-sm font-medium text-gray-900">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-1">
        Напиши адрес или кликни на картата, за да избереш локация
      </p>

      <div className="relative z-0 mt-4 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '350px', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={selectedPosition}
            setPosition={setSelectedPosition}
            onLocationSelect={onLocationSelect}
          />
        </MapContainer>
      </div>

      {selectedPosition && (
        <p className="text-sm text-gray-600 mt-2">
          Координати: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LocationInput;
