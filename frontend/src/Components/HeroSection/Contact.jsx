import { useState } from "react";
import { Users, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // State for form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitMessage("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send POST request to backend API
      const response = await fetch("http://localhost:8080/api/send-email", {
        // Updated to match your server port
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" }); // Reset form
      } else {
        setSubmitMessage(
          result.error || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitMessage("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <p className="mt-3">keshva2004@gmail.com</p>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-12 max-w-xl mx-auto space-y-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <textarea
              rows="4"
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            ></textarea>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            {submitMessage && (
              <p
                className={`mt-4 ${submitMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}
              >
                {submitMessage}
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
