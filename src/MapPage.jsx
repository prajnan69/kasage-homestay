import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Locate, Phone, Map, ExternalLink, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- CONFIGURATION ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const BOOKING_PHONE_NUMBER = "8660627034"; // Replace with real booking number
const DISTANCE_THRESHOLD_KM = 20; // Radius to consider "In Location"

// Coordinates for KASAGE HOMESTAY (Approx based on Benne Hole proximity)
// You can update this with the exact coords from the Google Maps link if you have them.
const KASAGE_LOCATION = { lat: 14.415, lng: 74.755 }; 

const ATTRACTIONS = [
  { id: 1, name: "Benne Hole Falls", lat: 14.3969, lng: 74.7815, distance: 5, type: "Waterfalls" },
  { id: 2, name: "Nishane Gudda", lat: 14.4201, lng: 74.7443, distance: 12, type: "Viewpoint" },
  { id: 3, name: "Manjuntha Temple", lat: 14.4012, lng: 74.7421, distance: 12, type: "Temple" },
  { id: 4, name: "Bhiman Gudda", lat: 14.4513, lng: 74.7219, distance: 18, type: "Trek" },
  { id: 5, name: "Yana Caves", lat: 14.5616, lng: 74.5593, distance: 33, type: "Caves" },
  { id: 6, name: "Gokarna Beach", lat: 14.5479, lng: 74.3188, distance: 55, type: "Beach" },
];

const MAP_STYLES = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ lightness: 100 }, { visibility: "simplified" }] },
];

// --- UTILITY: Calculate Distance (Haversine Formula) ---
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // New States for Location Check
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const navigate = useNavigate();

  // 1. Load Google Maps Script
  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existingScript) {
      existingScript.addEventListener("load", initMap);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.body.appendChild(script);

    return () => {
        if (existingScript) {
            existingScript.removeEventListener("load", initMap);
        }
    };
  }, []);

  // 2. Get User Location & Check Distance
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const loc = { lat: userLat, lng: userLng };
          
          setUserLocation(loc);
          
          setIsLoadingLocation(false);
        },
        (err) => {
          console.error("Location denied or error", err);
          // Default to Kasage if location denied (or show prompt, depends on preference)
          setUserLocation(KASAGE_LOCATION);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  }, []);

  // 3. Initialize Map
  const initMap = () => {
    if (!mapRef.current) return;
    
    // Default center is Kasage if user location isn't ready yet
    const center = userLocation || KASAGE_LOCATION;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 11,
      disableDefaultUI: true,
      styles: MAP_STYLES,
      zoomControl: false,
    });

    ATTRACTIONS.forEach((p) => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstance.current,
        title: p.name,
        animation: window.google.maps.Animation.DROP,
      });
      marker.addListener("click", () => handleSelectAttraction(p));
    });

    setIsMapReady(true);
  };

  // 4. Update Map Center when User Location is found (if inside app)
  useEffect(() => {
    if (userLocation && mapInstance.current) {
      mapInstance.current.setCenter(userLocation);
      new window.google.maps.Marker({
        position: userLocation,
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3B82F6",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
        title: "You are here",
      });
    }
  }, [userLocation, isMapReady]);

  const handleSelectAttraction = (attraction) => {
    setSelectedId(attraction.id);
    if (mapInstance.current) {
      mapInstance.current.panTo({ lat: attraction.lat, lng: attraction.lng });
      mapInstance.current.setZoom(13);
    }
  };

  const navigateTo = (p) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${p.lat},${p.lng}`;
    window.open(url, "_blank");
  };

  const handleRecenter = () => {
    if (userLocation && mapInstance.current) {
      mapInstance.current.panTo(userLocation);
      mapInstance.current.setZoom(11);
      setSelectedId(null);
    }
  };

  // --- RENDER LOGIC ---

  // 1. Loading Screen
  if (isLoadingLocation) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-emerald-800">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Locate size={40} className="mb-4 text-emerald-600" />
        </motion.div>
        <p className="font-medium animate-pulse">Locating you...</p>
      </div>
    );
  }

  // 3. Main App (If user is nearby OR bypassed check)
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100 text-slate-800 font-sans">
      <div ref={mapRef} className="absolute inset-0 h-full w-full z-0" />

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-0 right-0 z-10 flex flex-col items-center gap-2 pointer-events-none"
      >
        <div className="bg-white/90 backdrop-blur-md shadow-lg px-6 py-3 rounded-full flex items-center gap-2 pointer-events-auto border border-white/50">
          <span className="text-sm font-bold tracking-wide text-emerald-800">
            KASAGE HOMESTAY
          </span>
        </div>

        {/* Book Your Stay Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/booking')}
          className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-emerald-200 pointer-events-auto flex items-center gap-2"
        >
          <Home size={16} />
          Book Your Stay
        </motion.button>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleRecenter}
        className="absolute top-20 right-4 z-10 bg-white shadow-lg p-3 rounded-full text-gray-600"
      >
        <Locate size={20} />
      </motion.button>

      {/* Bottom Sheet */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 z-20 h-[55%] flex flex-col"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-white/90 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]" />
        <div className="relative z-30 w-full flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="relative z-30 flex-1 overflow-y-auto px-4 pb-8 no-scrollbar touch-pan-y">
          <div className="mb-4 px-2">
            <h2 className="text-xl font-bold text-gray-800">Nearby Gems</h2>
            <p className="text-xs text-gray-500">Curated spots for your adventure</p>
          </div>

          <div className="space-y-3">
            {ATTRACTIONS.sort((a, b) => a.distance - b.distance).map((item, index) => (
              <ListItem 
                key={item.name} 
                item={item} 
                isSelected={selectedId === item.id}
                onSelect={() => handleSelectAttraction(item)}
                onNavigate={() => navigateTo(item)}
                index={index}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ListItem({ item, isSelected, onSelect, onNavigate, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer
        ${isSelected ? "bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500" : "bg-white border-gray-100 shadow-sm hover:shadow-md active:scale-[0.98]"}
      `}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${isSelected ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>
             {item.type === 'Waterfalls' ? '🌊' : item.type === 'Temple' ? '🛕' : item.type === 'Trek' ? '🥾' : item.type === 'Beach' ? '🏖️' : '⛰️'}
          </div>
          <div>
            <h3 className={`font-bold ${isSelected ? "text-emerald-900" : "text-gray-800"}`}>{item.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px]">{item.type}</span>
              <span>• {item.distance} km</span>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 pt-0">
            <motion.button whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); onNavigate(); }} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-emerald-200 shadow-lg">
              <Navigation size={18} /> Start Navigation
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
