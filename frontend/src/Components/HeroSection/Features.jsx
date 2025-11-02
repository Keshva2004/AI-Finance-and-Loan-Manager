import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Collapse,
} from "@mui/material";
import {
  Lock,
  SmartToy,
  Payments,
  NotificationsActive,
} from "@mui/icons-material";

const features = [
  {
    id: "ai-customer-loan",
    title: "AI-Driven Customer & Loan Management",
    description:
      "Easily add, update, or modify customer & loan details using text or voice commands.",
    moreInfo: [
      "AI interprets instructions and updates database + Excel automatically",
      "Supports text and voice-based operations",
    ],
    icon: <SmartToy fontSize="large" className="text-purple-600" />,
  },
  {
    id: "secure-login",
    title: "Secure Login & Access Control",
    description:
      "Role-based access for Admins & Staff ensures only authorized users can manage financial data.",
    moreInfo: [
      "Admins: Full access to loans, customers, and reports",
      "Only authorized users can view/modify financial records",
    ],
    icon: <Lock fontSize="large" className="text-green-600" />,
  },
  {
    id: "payment-handling",
    title: "Automated Installment & Payment Handling",
    description:
      "Admins or finance agents can record payments using AI-powered voice commands.",
    moreInfo: [
      "Tracks payment status: Pending, Paid, Overdue",
      "AI detects late payment patterns and triggers reminders automatically",
    ],
    icon: <Payments fontSize="large" className="text-amber-500" />,
  },
  {
    id: "reminders-notifications",
    title: "AI-Powered Reminders & Notifications",
    description:
      "Never miss a deadline with smart reminders via calls, WhatsApp, SMS, and emails.",
    moreInfo: [
      "Automated Calling System → Calls clients after deadlines",
      "WhatsApp Chatbot → Sends overdue/payment reminders & responds to queries",
    ],
    icon: <NotificationsActive fontSize="large" className="text-orange-600" />,
  },
];

function FeatureCard({ feature, isOpen, onToggle }) {
  return (
    <Card
      className=" border-t-4 border-blue-600 p-2  rounded-3xl hover:scale-105 transition-transform duration-300"
      component="article"
      aria-expanded={isOpen}
      aria-controls={`${feature.id}-details`}
    >
      <CardContent className="flex flex-col items-center text-center space-y-4">
        {feature.icon}
        <Typography variant="h6" component="h3" className="font-semibold">
          {feature.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {feature.description}
        </Typography>

        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <ul
            id={`${feature.id}-details`}
            className="mt-2 text-sm text-gray-600 list-disc list-inside text-left"
          >
            {feature.moreInfo.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </Collapse>
      </CardContent>

      <CardActions className="justify-center pb-4">
        <Button
          variant="contained"
          size="small"
          className="bg-blue-600 hover:bg-blue-700 rounded-full  text-sm"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`${feature.id}-details`}
          aria-label={`${isOpen ? "Hide" : "Show"} details for ${
            feature.title
          }`}
        >
          {isOpen ? "Show Less" : "Know More"}
        </Button>
      </CardActions>
    </Card>
  );
}

export default function Features() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleMoreInfo = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      className="p-30 bg-white"
      id="features"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2
          id="features-heading"
          className="text-4xl font-bold text-blue-600 mb-2"
        >
          What We Provide
        </h2>
        <p className="text-gray-600 mb-10">
          The future of loan & finance management — simplified, automated, and
          powered by AI.
        </p>

        <div className="grid gap-8 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isOpen={openIndex === index}
              onToggle={() => toggleMoreInfo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
