import { motion } from "framer-motion";
import loan from "../../assets/loan.jpg";
import analysis from "../../assets/aboutAs.jpg"
import payment from "../../assets/payment.jpg"
import reminder from "../../assets/reminder.jpg"

const steps = [
  {
    title: "Add Customer & Loan",
    description:
      "Enter or dictate customer & loan details — AI records everything instantly.",
    image: loan,
  },
  {
    title: "AI Manages Payments",
    description:
      "Installments are tracked, balances updated, and overdue patterns detected.",
    image: payment,
  },
  {
    title: "Smart Reminders Sent",
    description:
      "Clients get automated reminders via WhatsApp, SMS, calls, and email.",
    image:reminder,
  },
  {
    title: "View Analytics & Insights",
    description:
      "Get real-time dashboards with trends, overdue stats, and predictions.",
    image: analysis,
  },
];

export default function Work() {
  return (
    <section id="howitworks" className="bg-gray-50 py-32">
      <div className="max-w-7xl mx-auto text-center px-6">
        <h2 className="text-3xl font-bold text-[#2563EB]">How It Works</h2>
        <p className="mt-2 text-lg text-gray-600">
          Get started in just 3 simple steps — powered by AI
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-lg rounded-2xl p-6 transition-all"
            >
              <img
                src={step.image}
                alt={step.title}
                className="h-28 mx-auto object-contain"
              />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
