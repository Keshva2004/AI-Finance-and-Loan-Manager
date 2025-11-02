import { Users, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <>
      {/* ✅ Contact Section */}
      <section id="contact" className="bg-white py-35">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-[#2563EB]">Contact Us</h2>
          <p className="mt-2 text-lg text-gray-600">
            Have questions? Get in touch with us anytime.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700">
            <div className="flex flex-col items-center">
              <MapPin className="text-blue-600" size={36} />
              <p className="mt-3">Ahmedabad, India</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="text-green-600" size={36} />
              <p className="mt-3">+91 98765 43210</p>
            </div>
            <div className="flex flex-col items-center">
              <Mail className="text-red-600" size={36} />
              <p className="mt-3">support@loanai.com</p>
            </div>
          </div>

          {/* Contact Form */}
          <form className="mt-12 max-w-xl mx-auto space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <textarea
              rows="4"
              placeholder="Your Message"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
