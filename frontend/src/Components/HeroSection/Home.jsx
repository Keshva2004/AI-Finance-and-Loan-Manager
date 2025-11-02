import Image from "../../assets/main.jpg";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import Features from "./Features";
import Work from "./Work";
import AboutUs from "./AboutUs";
import Contact from "./Contact";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="bg-white" id="home">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-30 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="first-line:text-[#2563EB] text-4xl font-sans md:text-5xl font-semibold text-gray-900 leading-tight">
              Namaste, India! <br />
              Meet Your <br /> AI Loan & Finance Manager 🇮🇳
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              The smartest and most trusted platform for finance agents to
              manage <strong>loans, customers, payment reminders</strong> — all
              powered by AI.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex items-center space-x-4">
              <Link to="/login">
                <Button className="navButton !mr-4" variant="contained">
                  Get Early Access →
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side: Image with Motion */}
          <motion.div
            animate={{ y: [0, -15, 0] }} // Moves up and down
            transition={{
              duration: 3, // 3 seconds per loop
              repeat: Infinity, // Infinite loop
              ease: "easeInOut",
            }}
          >
            <img src={Image} alt="Hero" className="rounded-xl" />
          </motion.div>
        </div>
      </section>
      <Features />
      <Work />
      <AboutUs />
      <Contact />
    </>
  );
}
