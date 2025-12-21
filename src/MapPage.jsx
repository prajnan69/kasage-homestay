import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Locate, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { importLibrary } from "@googlemaps/js-api-loader";

/* ---------------- CONFIG ---------------- */

const KASAGE_LOCATION = { lat: 14.415, lng: 74.755 };

const ATTRACTIONS = [
  { id: 1, name: "Benne Hole Falls", lat: 14.3969, lng: 74.7815, distance: 5, type: "Waterfalls" },
  { id: 2, name: "Nishane Gudda", lat: 14.4201, lng: 74.7443, distance: 12, type: "Viewpoint" },
  { id: 3, name: "Manjuntha Temple", lat: 14.4012, lng: 74.7421, distance: 12, type: "Temple" },
  { id: 4, name: "Bhiman Gudda", lat: 14.4513, lng: 74.7219, distance: 18, type: "Trek" },
  { id: 5, name: "Yana Caves", lat: 14.5616, lng: 74.5593, distance: 33, type: "Caves" },
  { id: 6, name: "Gokarna Beach", lat: 14.5479, lng: 74.3188, distance: 55, type: "Beach" },
];

let mapsInitialized = false;

/* ---------------- COMPONENT ---------------- */

export default function MapPage() {
  const mapRef = useRef(null);
  const map = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  /* -------- INIT MAP (STABLE) -------- */

  useEffect(() => {
    if (mapsInitialized) return;
    mapsInitialized = true;

    (async () => {
      const { Map } = await importLibrary("maps");
      const { Marker } = await importLibrary("marker");

      map.current = new Map(mapRef.current, {
        center: KASAGE_LOCATION,
        zoom: 12,
        disableDefaultUI: true,
      });

      // Homestay marker
      new Marker({
        position: KASAGE_LOCATION,
        map: map.current,
        title: "Kasage Homestay",
      });

      // Nearby attractions
      ATTRACTIONS.forEach((p) => {
        const marker = new Marker({
          position: { lat: p.lat, lng: p.lng },
          map: map.current,
          title: p.name,
        });

        marker.addListener("click", () => handleSelect(p));
      });
    })();
  }, []);

  /* -------- HANDLERS -------- */

  const handleSelect = (p) => {
    setSelectedId(p.id);
    map.current?.panTo({ lat: p.lat, lng: p.lng });
    map.current?.setZoom(13);
  };

  const handleRecenter = () => {
    map.current?.panTo(KASAGE_LOCATION);
    map.current?.setZoom(12);
    setSelectedId(null);
  };

  const navigateTo = (p) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
      "_blank"
    );
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">

      {/* Google Map */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Header */}
      <div className="absolute top-4 inset-x-0 z-10 flex flex-col items-center gap-2">
        <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow font-bold text-emerald-700">
          KASAGE HOMESTAY
        </div>

        <button
          onClick={() => navigate("/booking")}
          className="bg-emerald-600 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow"
        >
          <Home size={16} />
          Book Your Stay
        </button>
      </div>

      {/* Recenter */}
      <button
        onClick={handleRecenter}
        className="absolute top-24 right-4 z-10 bg-white p-3 rounded-full shadow"
      >
        <Locate size={18} />
      </button>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="absolute bottom-0 inset-x-0 z-20 h-[55%] bg-white rounded-t-3xl shadow-xl overflow-y-auto"
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />

        <div className="px-4 pb-8">
          <h2 className="text-xl font-bold mb-4">Nearby Gems</h2>

          <div className="space-y-3">
            {ATTRACTIONS.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedId === item.id
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-xs text-gray-500">
                  {item.type} • {item.distance} km
                </p>

                <AnimatePresence>
                  {selectedId === item.id && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo(item);
                      }}
                      className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Navigation size={16} />
                      Start Navigation
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
