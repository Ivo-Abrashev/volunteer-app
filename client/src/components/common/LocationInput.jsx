// src/components/common/LocationInput.jsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix за default marker icon (Leaflet issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Компонент за кликване на картата
function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      
      // Reverse geocoding - вземи адрес от координати
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (onLocationSelect) {
            onLocationSelect({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              address: data.display_name || 'Неизвестна локация',
            });
          }
        })
        .catch((err) => {
          console.error('Грешка при reverse geocoding:', err);
          if (onLocationSelect) {
            onLocationSelect({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              address: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`,
            });
          }
        });
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
  const initialPosition =
  initialLat != null && initialLng != null
    ? [Number(initialLat), Number(initialLng)]
    : null;

const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [mapCenter, setMapCenter] = useState([42.1354, 24.7453]); // Пловдив по подразбиране

  useEffect(() => {
    if (initialLat != null && initialLng != null) {
      const lat = Number(initialLat);
      const lng = Number(initialLng);
      setSelectedPosition([lat, lng]);
      setMapCenter([lat, lng]);
    }
  }, [initialLat, initialLng]);

  // Търсене на локации с Nominatim (OpenStreetMap)
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (onChange) {
      onChange({ target: { name, value: query } });
    }

    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&countrycodes=bg`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (err) {
      console.error('Грешка при търсене:', err);
    }
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

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder="Търси локация... (напр. Централен парк, Пловдив)"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-40 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
              >
                <p className="text-sm font-medium text-gray-900">
                  {result.display_name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-1">
        💡 Напиши адрес или кликни на картата за да избереш локация
      </p>

      {/* Map */}
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
          📍 Координати: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LocationInput;