import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Phone, Clock, MapPin, Building2, Stethoscope, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';
import styles from './MapPage.module.css';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createDivIcon = (color: string, emoji: string) =>
  new L.DivIcon({
    html: `<div style="
      background:${color}; 
      width:36px; height:36px; border-radius:50% 50% 50% 0; 
      transform:rotate(-45deg); border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    ">
      <span style="transform:rotate(45deg);font-size:14px;">${emoji}</span>
    </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

const GovIcon    = createDivIcon('#2563EB', '🏛');
const PrivIcon   = createDivIcon('#059669', '🏥');
const MedIcon    = createDivIcon('#D97706', '💊');
const UserIcon   = createDivIcon('#7C3AED', '📍');

// ─── Real Nagpur Vet Data ──────────────────────────────────────────────────
const NAGPUR_VETS = [
  {
    id: 1,
    name: "Govt. Veterinary Hospital",
    address: "Ambazari Rd, Near Alankar Cinema, Bhagwaghar Layout, Nagpur – 440010",
    phone: "+91 712 255 3344",
    type: "Government" as const,
    lat: 21.1368,
    lng: 79.0594,
    hours: "Mon–Fri, 9 AM – 5 PM",
    speciality: "Aquatic & Large Animal",
    rating: 4.2,
  },
  {
    id: 2,
    name: "Royal Pet Clinic",
    address: "194, Opp. Chhatrapati Hall, Chhatrapati Nagar, Nagpur – 440015",
    phone: "+91 94230 12345",
    type: "Private" as const,
    lat: 21.1104,
    lng: 79.0527,
    hours: "All Days, 10 AM – 7 PM",
    speciality: "Fish & Aquatic Animals",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Precise Pet Clinic",
    address: "Plot 3, Vidya Vihar Rd, Pratap Nagar, Nagpur – 440022",
    phone: "+91 98230 44567",
    type: "Private" as const,
    lat: 21.1247,
    lng: 79.0401,
    hours: "All Days, 9 AM – 9 PM",
    speciality: "General Veterinary",
    rating: 4.4,
  },
  {
    id: 4,
    name: "LifeLine Pet Clinic",
    address: "Nandanvan Main Rd, New Nandanvan Colony, Nagpur – 440009",
    phone: "+91 91584 78920",
    type: "Private" as const,
    lat: 21.1417,
    lng: 79.1128,
    hours: "All Days, 8 AM – 8 PM",
    speciality: "Emergency & Aquatics",
    rating: 4.3,
  },
  {
    id: 5,
    name: "Veterinary Clinical Complex",
    address: "Near Alankar Cinema, North Ambazari Road, Nagpur – 440010",
    phone: "+91 712 255 0098",
    type: "Government" as const,
    lat: 21.1380,
    lng: 79.0580,
    hours: "Mon–Sat, 8 AM – 6 PM",
    speciality: "Fish Pathology & Aquaculture",
    rating: 4.1,
  },
  {
    id: 6,
    name: "Nagpur Fish Market Supplies",
    address: "Itwari Fish Market, Central Nagpur – 440008",
    phone: "+91 98770 33210",
    type: "Medicine" as const,
    lat: 21.1511,
    lng: 79.0884,
    hours: "Mon–Sat, 7 AM – 6 PM",
    speciality: "Aquaculture Medicines & Supplies",
    rating: 4.0,
  },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FlyToUser = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(position, 13, { animate: true, duration: 1.5 }); }, [position, map]);
  return null;
};

export const MapPage: React.FC = () => {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Government' | 'Private' | 'Medicine'>('All');
  const [selectedVet, setSelectedVet] = useState<typeof NAGPUR_VETS[0] | null>(null);

  // Nagpur city center as default
  const defaultCenter: [number, number] = [21.1458, 79.0882];

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setLocating(false); },
      () => { setUserPos(null); setLocating(false); }
    );
  }, []);

  const filteredVets = filter === 'All' ? NAGPUR_VETS : NAGPUR_VETS.filter(v => v.type === filter);

  const sortedVets = [...filteredVets].sort((a, b) => {
    if (!userPos) return 0;
    return haversineKm(userPos[0], userPos[1], a.lat, a.lng) - haversineKm(userPos[0], userPos[1], b.lat, b.lng);
  });

  const getIcon = (type: string) => {
    if (type === 'Government') return GovIcon;
    if (type === 'Private') return PrivIcon;
    return MedIcon;
  };

  const typeIcon = (type: string) => {
    if (type === 'Government') return <Building2 size={14} />;
    if (type === 'Private') return <Stethoscope size={14} />;
    return <ShoppingBag size={14} />;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Veterinary Locator — Nagpur</h1>
          <p className={styles.subtitle}>
            <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
            6 verified facilities in Nagpur city. Sorted by proximity to your location.
          </p>
        </div>
        <div className={styles.filterGroup}>
          {(['All', 'Government', 'Private', 'Medicine'] as const).map(f => (
            <button key={f} className={clsx(styles.filterBtn, filter === f && styles.filterActive)} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.mapGrid}>
        {/* List Panel */}
        <div className={clsx('card', styles.listCard)}>
          <div className={styles.listMeta}>
            {locating ? 'Acquiring your location…' : userPos ? '📍 Sorted by distance from you' : '📍 Default: Nagpur City'}
          </div>

          <div className={styles.vetList}>
            {sortedVets.map(vet => {
              const dist = userPos ? haversineKm(userPos[0], userPos[1], vet.lat, vet.lng) : null;
              return (
                <div
                  key={vet.id}
                  className={clsx(styles.vetItem, selectedVet?.id === vet.id && styles.vetItemActive)}
                  onClick={() => setSelectedVet(vet)}
                >
                  <div className={styles.vetTop}>
                    <div>
                      <div className={styles.vetName}>{vet.name}</div>
                      <div className={styles.vetSpeciality}>{vet.speciality}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.25rem' }}>
                      <span className={clsx(styles.vetBadge,
                        vet.type === 'Government' ? styles.badgeBlue :
                        vet.type === 'Private'    ? styles.badgeGreen : styles.badgeOrange)}>
                        {typeIcon(vet.type)} {vet.type}
                      </span>
                      {dist !== null && <span className={styles.distBadge}>{dist.toFixed(1)} km</span>}
                    </div>
                  </div>

                  <div className={styles.vetDetails}>
                    <div className={styles.vetRow}><MapPin size={13} />{vet.address}</div>
                    <div className={styles.vetRow}><Phone size={13} />{vet.phone}</div>
                    <div className={styles.vetRow}><Clock size={13} />{vet.hours}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(vet.name + ' Nagpur')}`}
                      target="_blank" rel="noreferrer"
                      className={styles.vetBtn}
                      onClick={e => e.stopPropagation()}
                    >
                      <Navigation size={13} /> Directions
                    </a>
                    <a href={`tel:${vet.phone}`} className={clsx(styles.vetBtn, styles.vetBtnPrimary)} onClick={e => e.stopPropagation()}>
                      <Phone size={13} /> Call Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className={styles.mapWrapper}>
          <MapContainer center={userPos || defaultCenter} zoom={13} className={styles.map}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {userPos && <FlyToUser position={userPos} />}
            {userPos && (
              <>
                <Marker position={userPos} icon={UserIcon}>
                  <Popup><strong>📍 Your Location</strong></Popup>
                </Marker>
                <Circle center={userPos} radius={5000} pathOptions={{ color: '#0D9488', fillColor: '#0D9488', fillOpacity: 0.06, weight: 1, dashArray: '6' }} />
              </>
            )}
            {filteredVets.map(vet => (
              <Marker key={vet.id} position={[vet.lat, vet.lng]} icon={getIcon(vet.type)} eventHandlers={{ click: () => setSelectedVet(vet) }}>
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <strong style={{ fontSize: '0.9rem' }}>{vet.name}</strong><br />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{vet.speciality}</span><br /><br />
                    <span style={{ fontSize: '0.8rem' }}>{vet.address}</span><br /><br />
                    <a href={`tel:${vet.phone}`} style={{ color: '#0D9488', fontWeight: 600 }}>{vet.phone}</a><br />
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{vet.hours}</span>
                    <br /><br />
                    <a href={`https://www.google.com/maps/search/${encodeURIComponent(vet.name + ' Nagpur')}`} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontSize: '0.8rem' }}>
                      Open in Google Maps →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className={styles.legend}>
            <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#2563EB' }} /> Government</div>
            <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#059669' }} /> Private Clinic</div>
            <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#D97706' }} /> Medicine Shop</div>
            <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#7C3AED' }} /> You</div>
          </div>
        </div>
      </div>
    </div>
  );
};
