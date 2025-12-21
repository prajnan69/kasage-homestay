import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Star, MapPin, Wifi, Coffee, Car, Utensils, 
  ChevronLeft, Heart, Share2, MessageCircle, Phone 
} from "lucide-react";

// --- CONFIGURATION ---
const PHONE_NUMBER = "9199074233664"; // Format: CountryCode + Number
const PRICE_PER_NIGHT = "₹2,500"; // Update as needed

// Images assumed to be in public/images/ folder
const IMAGES = [
  "/images/exterior.jpg", // Main House View
  "/images/room.jpg",     // Bedroom
  "/images/food.jpg",     // Malnad Cuisine
  "/images/falls.jpg",    // Nearby Scenery
];

const AMENITIES = [
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Car, label: "Parking" },
  { icon: Utensils, label: "Home Food" },
  { icon: Coffee, label: "Coffee Estate" },
];

export default function BookingPage() {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const handleBookNow = () => {
    // Open WhatsApp with a pre-filled message
    const message = "Hi! I saw Kasage Homestay on your app and I'm interested in booking a stay.";
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % IMAGES.length);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 pb-28 font-sans">
      
      {/* --- 1. HERO IMAGE CAROUSEL --- */}
      <div className="relative h-[45vh] w-full overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={IMAGES[activeImage]}
            alt="Kasage Homestay"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 h-full w-full object-cover"
            // Fallback if image not found
            onError={(e) => {e.currentTarget.src = "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&q=80&w=1000"}} 
            onClick={nextImage}
          />
        </AnimatePresence>

        {/* Top Overlay Buttons */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pt-6">
          <button 
            onClick={() => navigate('/')}
            className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/30 transition-colors">
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <Heart size={20} fill={isLiked ? "#ef4444" : "transparent"} className={isLiked ? "text-red-500" : "text-white"} />
            </button>
          </div>
        </div>

        {/* Image Dots Indicator */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 z-10">
          {IMAGES.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} 
            />
          ))}
        </div>
        
        {/* Shadow Gradient for readability */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* --- 2. MAIN CONTENT SHEET --- */}
      <div className="relative -mt-8 rounded-t-[2rem] bg-gray-50 px-6 pt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        
        {/* Title & Rating */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Kasage Homestay</h1>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin size={14} className="text-emerald-600" />
              <span>Sirsi, Karnataka</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-lg">
              <Star size={14} className="text-emerald-700 fill-emerald-700" />
              <span className="text-sm font-bold text-emerald-800">4.9</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">120 reviews</span>
          </div>
        </div>

        <div className="h-px w-full bg-gray-200 my-6" />

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">About the stay</h2>
          <p className={`text-gray-500 text-sm leading-relaxed ${isTextExpanded ? "" : "line-clamp-3"}`}>
            Nestled in the lush greenery of the Western Ghats, Kasage Homestay offers a serene escape from city life. 
            Enjoy authentic Malnad cuisine, wake up to the sound of birds, and visit the majestic Benne Hole Falls just 5km away. 
            Our heritage home blends traditional architecture with modern comforts for the perfect family getaway.
          </p>
          <button 
            onClick={() => setIsTextExpanded(!isTextExpanded)}
            className="text-emerald-600 text-sm font-semibold mt-1"
          >
            {isTextExpanded ? "Read Less" : "Read More"}
          </button>
        </div>

        {/* Amenities Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">What we offer</h2>
          <div className="grid grid-cols-4 gap-4">
            {AMENITIES.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-600">
                  <item.icon size={20} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location / Mini Map Preview */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Location</h2>
          <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center">
             {/* You can replace this with a static map image if you have one */}
             <div className="text-center">
                <MapPin className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-emerald-800 font-medium text-sm">5 km to Benne Hole Falls</p>
                <p className="text-emerald-600 text-xs">Tap to view on map</p>
             </div>
          </div>
        </div>
      </div>

      {/* --- 3. STICKY BOTTOM BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-8 flex items-center justify-between z-50">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Starting at</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{PRICE_PER_NIGHT}</span>
            <span className="text-sm text-gray-500">/ night</span>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Call Button */}
          <a 
            href={`tel:${PHONE_NUMBER}`}
            className="h-12 w-12 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Phone size={20} />
          </a>
          
          {/* WhatsApp Book Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBookNow}
            className="bg-emerald-600 text-white px-8 h-12 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            <MessageCircle size={18} />
            Book Now
          </motion.button>
        </div>
      </div>

    </div>
  );
}
