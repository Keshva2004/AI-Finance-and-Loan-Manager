import Aboutus from "../../assets/analysis.jpg";
import { motion } from "framer-motion";
export default function AboutUs() {
  return (
    <section id="aboutus" className="bg-white pt-35">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6">
        <div>
          <h2 className="text-3xl font-bold text-[#2563EB]">About Us</h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            We are an AI-powered finance & loan management platform that helps
            businesses automate customer management, loan tracking, and payment
            reminders. Our mission is to reduce manual work for finance teams
            while improving accuracy, transparency, and client satisfaction.
          </p>
        </div>
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={Aboutus}
          alt="About Us"
          className="rounded-[10%] shadow-lg h-100 w-100"
        />
      </div>
    </section>
  );
}
