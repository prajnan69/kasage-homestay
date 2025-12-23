import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Locate, MapPin, Clock, ArrowRight, Car, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { importLibrary } from "@googlemaps/js-api-loader";

/* ---------------- CONFIGURATION ---------------- */

const KASAGE_LOCATION = { lat: 14.527666, lng: 74.627038 };

const ATTRACTIONS = [
  { 
    id: 1, 
    name: "Benne Hole Falls", 
    lat: 14.504559, 
    lng: 74.624682, 
    distance: "5 km", 
    time: "5 min",
    type: "Waterfalls", 
    image: "/Benne-hole.png",
    color: "#0ea5e9" 
  },
  { 
    id: 2, 
    name: "Gokarna-OM beach", 
    lat: 14.519188,
    lng: 74.323062, 
    distance: "50 km", 
    time: "70 mins",
    type: "Beach", 
    image: "/Om-beach.png",
    color: "#f59e0b" 
  },
  { 
    id: 3, 
    name: "Manjuntha Temple", 
    lat: 14.571188,
    lng: 74.667687 , 
    distance: "12 km", 
    time: "15 min",
    type: "Temple", 
    image: "/Manjunatha-temple.png",
    color: "#ea580c" 
  },
  { 
    id: 4, 
    name: "Bhiman Gudda", 
    lat: 14.462563,
    lng: 74.687313, 
    distance: "18 km", 
    time: "30 min",
    type: "Trek", 
    image: "/Bhiman-gudda.png",
    color: "#10b981" 
  },
  { 
    id: 5, 
    name: "Yana Caves", 
    lat: 14.589688,
    lng: 74.566563 , 
    distance: "33 km", 
    time: "48 min",
    type: "Caves", 
    image: "/Yana.png",
    color: "#64748b" 
  },
  { 
    id: 6, 
    name: "Honnavara Boating", 
    lat: 14.282063,
    lng: 74.451062, 
    distance: "52 km", 
    time: "72 min",
    type: "Boating", 
    image: "/Honnavara-Boating.png",
    color: "#64748b" 
  },
  { 
    id: 7, 
    name: "Nishane Gudda", 
    lat: 14.478938,
    lng: 74.663187, 
    distance: "52 km", 
    time: "21 min",
    type: "Trek", 
    image: "/Nishane-gudda.png",
    color: "#64748b" 
  },
];

/* Default Map Style */
const MAP_STYLES = [];

let mapsInitialized = false;

/* ---------------- HELPER ICONS ---------------- */
const createMarkerIcon = (color, scale = 1) => {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 6 * scale,
  };
};

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  
  // Directions Services
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);
  
  const attractionMarkers = useRef([]);

  const [selectedId, setSelectedId] = useState(null);
  const [mapError, setMapError] = useState(null);
  const navigate = useNavigate();
  const cardsContainerRef = useRef(null);

  /* -------- INITIALIZE MAP -------- */
  useEffect(() => {
    // Global error handler for Google Maps authentication/activation errors
    window.gm_authFailure = () => {
      console.error("Google Maps Authentication Failure");
      setMapError("Maps API not activated or API key invalid. Please enable 'Maps JavaScript API' in Google Cloud Console.");
    };

    if (mapsInitialized) return;
    mapsInitialized = true;

    const initMap = async () => {
      const { Map } = await importLibrary("maps");
      const { Marker } = await importLibrary("marker");
      // Import Directions Libraries
      const { DirectionsService, DirectionsRenderer } = await importLibrary("routes");

      mapInstance.current = new Map(mapRef.current, {
        center: KASAGE_LOCATION,
        zoom: 12,
        styles: MAP_STYLES,
        disableDefaultUI: true,
        clickableIcons: false,
      });

      // Init Directions Service
      directionsService.current = new DirectionsService();
      directionsRenderer.current = new DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: true, // IMPORTANT: We use our own custom icons, so hide Google's A/B markers
        polylineOptions: {
          strokeColor: "#059669", // Emerald Green Route
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });

      /* 🏡 KASAGE HOMESTAY MARKER */
      new Marker({
        position: KASAGE_LOCATION,
        map: mapInstance.current,
        title: "Kasage Homestay",
        zIndex: 100,
        label: {
          text: "OUR HOME",
          color: "#047857",
          fontSize: "12px",
          fontWeight: "800",
          className: "bg-white px-1 rounded",
        },
        icon: {
          path: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z", 
          fillColor: "#059669", 
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 2,
          anchor: new google.maps.Point(12, 12),
          labelOrigin: new google.maps.Point(12, 26),
        },
      });

      /* 📍 ATTRACTION MARKERS */
      ATTRACTIONS.forEach((p) => {
        const marker = new Marker({
          position: { lat: p.lat, lng: p.lng },
          map: mapInstance.current,
          label: {
            text: p.name,
            color: "#374151",
            fontSize: "11px",
            fontWeight: "600",
          },
          icon: createMarkerIcon(p.color),
        });

        marker.addListener("click", () => handleSelectLocation(p));
        attractionMarkers.current.push({ id: p.id, marker, color: p.color });
      });

    };

    initMap();

    return () => {
      window.gm_authFailure = null;
    };
  }, []);

  /* -------- HANDLE SELECTION (API CALL) -------- */
  
  const handleSelectLocation = (place) => {
    setSelectedId(place.id);

    // 1. Calculate Real Route on Roads
    if (directionsService.current && directionsRenderer.current) {
      directionsService.current.route(
        {
          origin: KASAGE_LOCATION,
          destination: { lat: place.lat, lng: place.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            // Render the route
            directionsRenderer.current.setDirections(result);
            
            // Optional: You could update time/distance dynamically here
            // const leg = result.routes[0].legs[0];
            // console.log(leg.distance.text, leg.duration.text); 
          } else {
            console.error(`Directions request failed: ${status}`);
          }
        }
      );
    }

    // 2. Animate Marker
    attractionMarkers.current.forEach(({ id, marker, color }) => {
      if (id === place.id) {
        marker.setIcon(createMarkerIcon(color, 1.5));
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 700);
      } else {
        marker.setIcon(createMarkerIcon(color, 1));
      }
    });

    // 3. Scroll Card
    const cardId = `card-${place.id}`;
    const el = document.getElementById(cardId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handleRecenter = () => {
    mapInstance.current.panTo(KASAGE_LOCATION);
    mapInstance.current.setZoom(12);
    setSelectedId(null);
    // Clear the route from the map
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections({ routes: [] });
    }
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        mapInstance.current.panTo(pos);
        mapInstance.current.setZoom(14);

        if (userMarker.current) userMarker.current.setMap(null);
        
        userMarker.current = new google.maps.Marker({
          position: pos,
          map: mapInstance.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "You are here",
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  const openNavigation = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  /* ---------------- UI RENDER ---------------- */

  return (
    <div className="relative h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* Error Overlay */}
      {mapError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-red-200 max-w-sm w-full text-center">
            <h3 className="text-red-600 font-bold text-lg mb-2">Map Error</h3>
            <p className="text-gray-700 mb-4">{mapError}</p>
            <p className="text-xs text-gray-500">Check API Key restrictions in Google Cloud Console.</p>
          </div>
        </div>
      )}

      {/* 🗺️ Map */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* 🔝 Floating Top Bar */}
      <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent pt-6 pb-12 pointer-events-none">
         <div className="flex justify-between items-start pointer-events-auto">
            <button 
              onClick={() => navigate('/')} 
              className="bg-white/90 backdrop-blur text-emerald-800 px-4 py-2 rounded-full font-bold shadow-md text-sm flex items-center gap-2"
            >
              <ArrowRight className="rotate-180" size={16}/> Back
            </button>
            <div className="flex flex-col items-end">
              <span className="text-white font-bold text-lg drop-shadow-md">Explore Nearby</span>
              <span className="text-white/80 text-xs drop-shadow-md">Guest Guide</span>
            </div>
         </div>
      </div>

      {/* 🎯 Control Buttons */}
      <div className="absolute top-24 right-4 z-20 flex flex-col gap-3">
        <button
          onClick={handleRecenter}
          className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/50 text-slate-700 hover:text-emerald-600 active:scale-95 transition-all duration-200"
          aria-label="Go to Home"
        >
          <Home size={22} />
        </button>
        <button
          onClick={handleLocateUser}
          className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/50 text-slate-700 hover:text-blue-600 active:scale-95 transition-all duration-200"
          aria-label="Locate Me"
        >
          <Locate size={22} />
        </button>
      </div>

      {/* 🃏 Visual Cards */}
      <div 
        className="absolute bottom-0 inset-x-0 z-30 pb-8 pt-20 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none"
      >
        <div 
          ref={cardsContainerRef}
          className="flex gap-4 overflow-x-auto px-6 no-scrollbar snap-x snap-mandatory pointer-events-auto items-end"
        >
          {/* Home Card */}
          <div className="snap-center min-w-[280px] max-w-[280px] bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 flex flex-col overflow-hidden h-[300px]">
            <div className="h-36 bg-emerald-600 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
              <span className="text-white font-bold text-2xl tracking-widest opacity-90">HOME</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl text-gray-800">Relax at Kasage</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">Your guide to nearby wonders. Tap a card to explore.</p>
              </div>
              <button 
                onClick={() => navigate('/booking')} 
                className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors"
              >
                View Booking
              </button>
            </div>
          </div>

          {/* Attraction Cards */}
          {ATTRACTIONS.map((item) => (
            <motion.div
              key={item.id}
              id={`card-${item.id}`}
              onClick={() => handleSelectLocation(item)}
              layout
              className={`
                snap-center min-w-[280px] max-w-[280px] bg-white/95 backdrop-blur-md rounded-3xl shadow-xl cursor-pointer transition-all duration-300 border border-white/60 overflow-hidden h-[300px] flex flex-col
                ${selectedId === item.id ? "ring-2 ring-emerald-500 scale-100" : "scale-95 opacity-90"}
              `}
            >
              <div className="h-40 w-full relative shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1.5 shadow-sm border border-white/20">
                  <Clock size={12} /> {item.time}
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                   <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white shadow-sm`} style={{ backgroundColor: item.color }}>
                    {item.type}
                  </span>
                  <span className="text-slate-500 text-xs flex items-center gap-1 font-medium">
                    <Car size={12}/> {item.distance}
                  </span>
                </div>

                <div className="mt-auto">
                  {selectedId === item.id ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); openNavigation(item.lat, item.lng); }}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Navigation size={16} /> Start GPS
                    </button>
                  ) : (
                    <div className="text-center text-emerald-600/80 text-xs font-semibold py-2">
                      Tap card to see route
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div className="min-w-[20px]" />
        </div>
      </div>
    </div>
  );
}
