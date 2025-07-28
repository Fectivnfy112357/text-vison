import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import Generate from "@/pages/Generate";
import History from "@/pages/History";
import Templates from "@/pages/Templates";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/history" element={<History />} />
          <Route path="/templates" element={<Templates />} />
        </Routes>
        <Footer />
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}
