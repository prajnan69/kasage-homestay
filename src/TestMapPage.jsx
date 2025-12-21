import { useEffect, useState } from "react";

export default function TestMapPage() {
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("API Key is missing from env variables");
      return;
    }

    setStatus("Loading script...");
    
    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existingScript) {
        setStatus("Script already found in DOM. Checking google.maps...");
        checkGoogleMaps();
        return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setStatus("Script loaded. Checking google.maps...");
      checkGoogleMaps();
    };

    script.onerror = (e) => {
      setError("Script load error (check network tab for details). " + e);
    };

    document.body.appendChild(script);
  }, []);

  const checkGoogleMaps = () => {
    if (window.google && window.google.maps) {
      setStatus("window.google.maps is available.");
      try {
        const mapDiv = document.getElementById("test-map");
        if (!mapDiv) {
            setError("Map container not found");
            return;
        }
        setStatus("Initializing map...");
        const map = new window.google.maps.Map(mapDiv, {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 8,
        });
        setStatus("Map initialized successfully!");
      } catch (err) {
        setError("Error initializing map: " + err.message);
        console.error(err);
      }
    } else {
      setError("window.google.maps is NOT available after load.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Map Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>API Key Status:</strong> {apiKey ? "Present" : "Missing"}</p>
        <p><strong>API Key Value (First 10 chars):</strong> {apiKey ? apiKey.substring(0, 10) + "..." : "N/A"}</p>
        <p><strong>Status:</strong> {status}</p>
        {error && <p className="text-red-600 font-bold">Error: {error}</p>}
      </div>

      <div 
        id="test-map" 
        style={{ height: "400px", width: "100%", backgroundColor: "#e5e7eb" }}
      ></div>
    </div>
  );
}
