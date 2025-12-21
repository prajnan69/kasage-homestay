import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapPage from "./MapPage";
import BookingPage from "./BookingPage";
import TestMapPage from "./TestMapPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/test" element={<TestMapPage />} />
      </Routes>
    </BrowserRouter>
  );
}
