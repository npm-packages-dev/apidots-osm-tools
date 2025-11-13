<p align="center">
  <h1 align="center">@apidots/osm-tools</h1>
</p>

<p align="center">
  <strong>The complete OpenStreetMap toolkit for React</strong><br />
  Autocomplete • Geocode • Reverse • POI Search • Routing • Distance
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@apidots/osm-tools">
    <img src="https://img.shields.io/npm/v/@apidots/osm-tools.svg?style=flat-square&logo=npm" />
  </a>
  <a href="https://www.npmjs.com/package/@apidots/osm-tools">
    <img src="https://img.shields.io/npm/dm/@apidots/osm-tools.svg?style=flat-square&color=success" />
  </a>
  <a href="https://bundlephobia.com/package/@apidots/osm-tools">
    <img src="https://img.shields.io/bundlephobia/min/@apidots/osm-tools?style=flat-square" />
  </a>
  <a href="http://makeapullrequest.com">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" />
  </a>
</p>

---

## Features

- **Autocomplete** – Real-time place suggestions
- **Geocode** – Address → Coordinates
- **Reverse Geocode** – Coordinates → Address
- **POI Search** – Find nearby cafes, hospitals, shops
- **Distance & Time** – Driving distance + ETA
- **Full Route** – GeoJSON route with turn-by-turn
- **React Hooks** – `useGeocode`, `useRoute`, etc.
- **Custom Servers** – Use your own Nominatim/OSRM/Overpass
- **Tree-shakable**, **ESM-ready**, minimal footprint
- Only `axios` as dependency

---

## Installation

```bash
npm install @apidots/osm-tools
# or
yarn add @apidots/osm-tools
# or
pnpm add @apidots/osm-tools
```

---

## Quick Examples

### 1. Autocomplete Search
```tsx
import { useAutocomplete } from '@apidots/osm-tools';

function SearchBox() {
  const [query, setQuery] = useState('');
  const { suggestions, loading } = useAutocomplete(query);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search places..."
      />
      {loading && <p>Loading...</p>}
      <ul>
        {suggestions.map((s) => (
          <li key={s.place_id}>{s.display_name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. Geocode Address
```tsx
import { useGeocode } from '@apidots/osm-tools';

function AddressToCoords() {
  const { results } = useGeocode('Eiffel Tower, Paris');

  return (
    <ul>
      {results.map((r, i) => (
        <li key={i}>
          {r.display_name}: {r.lat}, {r.lon}
        </li>
      ))}
    </ul>
  );
}
```

### 3. Reverse Geocode
```tsx
import { useReverseGeocode } from '@apidots/osm-tools';

function CoordsToAddress() {
  const { address, loading } = useReverseGeocode(48.8584, 2.2945);

  return <p>{loading ? 'Loading...' : address}</p>;
}
```

### 4. POI Search (Nearby Cafes)
```tsx
import { usePOISearch } from '@apidots/osm-tools';

function NearbyCafes() {
  const { pois } = usePOISearch(40.7128, -74.0060, 'cafe', 500);

  return (
    <ul>
      {pois.map((poi) => (
        <li key={poi.id}>{poi.name} ({poi.type})</li>
      ))}
    </ul>
  );
}
```

### 5. Distance & Time
```tsx
import { useDistanceTime } from '@apidots/osm-tools';

function TripSummary() {
  const { result } = useDistanceTime(
    28.6139, 77.2090,  // Delhi
    19.0760, 72.8777   // Mumbai
  );

  if (!result) return null;

  return (
    <div>
      Distance: {result.distance} km | Time: {result.duration} mins
    </div>
  );
}
```

### 6. Full Route with GeoJSON (Leaflet)
```tsx
import { useRoute } from '@apidots/osm-tools';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function RouteMap() {
  const start = "77.2090,28.6139"; // Delhi
  const end = "72.8777,19.0760";   // Mumbai
  const { route, loading, error } = useRoute(start, end);

  return (
    <div style={{ height: '500px' }}>
      <MapContainer center={[28.6139, 77.2090]} zoom={5} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {loading && <p>Loading route...</p>}
        {error && <p>Error: {error}</p>}
        {route && <GeoJSON data={route.geometry} style={{ color: 'blue', weight: 4 }} />}
      </MapContainer>

      {route && (
        <div style={{ marginTop: 10 }}>
          <strong>Distance:</strong> {(route.distance / 1000).toFixed(1)} km
          &nbsp;|&nbsp;
          <strong>Time:</strong> {(route.duration / 60).toFixed(0)} mins
        </div>
      )}
    </div>
  );
}

export default RouteMap;
```

---

### Using fetchRoute (No React)
```ts
import { fetchRoute } from '@apidots/osm-tools';

async function main() {
  const route = await fetchRoute("77.2090,28.6139", "72.8777,19.0760");

  console.log("Distance:", (route.distance / 1000).toFixed(1), "km");
  console.log("Duration:", (route.duration / 60).toFixed(0), "minutes");
  console.log("GeoJSON:", route.geometry);
}

main();
```

---

## Author

**APIDOTS PRIVATE LIMITED**  
🌐 Website: [https://apidots.com](https://apidots.com)  
💻 GitHub: [https://github.com/npm-packages-dev/apidots-osm-tools](https://github.com/npm-packages-dev/apidots-osm-tools)

---

## License

**MIT License © 2025 APIDOTS PRIVATE LIMITED**
