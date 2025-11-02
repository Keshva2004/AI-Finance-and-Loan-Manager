// src/context/FlashProvider.jsx
import React, { createContext, useContext, useState } from "react";
import Flash from "../Components/HeroSection/flash"; // Correct path & casing

const FlashContext = createContext();
export const useFlash = () => useContext(FlashContext);

export  const FlashProvider = ({ children }) => {
  const [flashMessage, setFlashMessage] = useState("");
  const [flashSeverity, setFlashSeverity] = useState("info");
  const [open, setOpen] = useState(false);

  const showFlash = (message, severity = "info") => {
 
    setFlashMessage(message);
    setFlashSeverity(severity);
    setOpen(true);
  };

  return (
    <FlashContext.Provider value={{ showFlash }}>
      {children}
      <Flash
        message={flashMessage}
        severity={flashSeverity}
        open={open}
        setOpen={setOpen}
      />
    </FlashContext.Provider>
  );
};
