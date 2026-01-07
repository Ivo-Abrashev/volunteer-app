// src/components/common/MapView.jsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix за marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Компонент за центриране на картата
function MapCenter({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);

  return null;
}

const MapView = ({ lat, lng, location, height = '200px' }) => {
  const mapRef = useRef(null);

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const hasCoords = Number.isFinite(latNum) && Number.isFinite(lngNum);

  if (!hasCoords) {
    return (
      <div
        className="rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">📍 Локацията не е зададена</p>
      </div>
    );
  }

  const position = [latNum, lngNum];

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={position}
        zoom={14}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <strong>{location}</strong>
            <br />
            <span className="text-xs text-gray-600">
              {latNum.toFixed(6)}, {lngNum.toFixed(6)}
            </span>
          </Popup>
        </Marker>
        <MapCenter center={position} />
      </MapContainer>
    </div>
  );
};

export default MapView;