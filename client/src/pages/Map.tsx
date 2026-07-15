import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Issue } from '../data/issues';
import IssueCard from '../components/IssueCard';

const API_URL = import.meta.env.VITE_API_URL || 'https://civicpulse-i4n5.onrender.com/api';

const statusColors: Record<string, string> = {
  Reported: '#d97706',
  'In Progress': '#3b82f6',
  Resolved: '#22c55e',
};

const createIcon = (color: string) =>
  L.divIcon({
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="13" r="6" fill="white"/>
    </svg>`,
  });

const reportedIcon = createIcon(statusColors['Reported']);
const progressIcon = createIcon(statusColors['In Progress']);
const resolvedIcon = createIcon(statusColors['Resolved']);

const iconForStatus = (status: string) => {
  if (status === 'Reported') return reportedIcon;
  if (status === 'In Progress') return progressIcon;
  return resolvedIcon;
};

const LocateUser = () => {
  useMapEvents({
    locationfound() {},
  });
  return null;
};

const MapLegend = () => (
  <div className="map-legend">
    {Object.entries(statusColors).map(([label, color]) => (
      <div key={label} className="map-legend-item">
        <span className="map-legend-dot" style={{ background: color }} />
        {label}
      </div>
    ))}
  </div>
);

const Map = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selected, setSelected] = useState<Issue | null>(null);
  const center: [number, number] = [40.7580, -73.9855];

  const fetchIssues = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/issues`);
      const data = await res.json();
      setIssues(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleVote = async (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i._id === id ? { ...i, votes: i.votes + 1 } : i)),
    );
    setSelected((prev) =>
      prev && prev._id === id ? { ...prev, votes: prev.votes + 1 } : prev,
    );
    try {
      const res = await fetch(`${API_URL}/issues/${id}/vote`, {
        method: 'PATCH',
      });
      if (!res.ok) fetchIssues();
    } catch {
      fetchIssues();
    }
  };

  const locatedCount = issues.filter((i) => i.lat && i.lng).length;

  return (
    <div className="map-page">
      <div className="container">
        <h1 className="map-heading">Issue Map</h1>
        <p className="map-sub">
          {locatedCount} of {issues.length} issues located on the map
        </p>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={14}
          className="leaflet-map"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocateUser />
          {issues.filter((i) => i.lat !== 0 || i.lng !== 0).map((issue) => (
            <Marker
              key={issue._id}
              position={[issue.lat, issue.lng]}
              icon={iconForStatus(issue.status)}
              eventHandlers={{
                click: () => setSelected(issue),
              }}
            />
          ))}
          <MapLegend />
        </MapContainer>
      </div>

      <div className="container">
        <div className="map-selected">
          <h3 className="map-selected-title">Selected</h3>
          {selected ? (
            <IssueCard issue={selected} onVote={handleVote} />
          ) : (
            <p className="map-selected-hint">
              Click a marker to see issue details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
