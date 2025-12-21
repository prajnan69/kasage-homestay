import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapPage from "./MapPage";
import BookingPage from "./BookingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
