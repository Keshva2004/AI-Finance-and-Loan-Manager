import Navbar from "../Components/Navbar/Navbar";
import Features from "../Components/HeroSection/Features";
import Work from "../Components/HeroSection/Work";
import AboutUs from "../Components/HeroSection/AboutUs";
import Contact from "../Components/HeroSection/Contact";
import { Route, Routes, useNavigate } from "react-router-dom";
import Footer from "../Components/Navbar/Footer";
import LoginPage from "../Components/Navbar/LoginPage";
import Home from "../Components/HeroSection/home";
import { useEffect } from "react";

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/featues" element={<Features />} />
        <Route path="/work" element={<Work />} />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
