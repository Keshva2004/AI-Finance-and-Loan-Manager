// src/components/Flash.jsx
import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export default function Flash({ message, severity = "info", open, setOpen }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setOpen(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [open, setOpen]);

  if (!message) return null;

  return (
    <Box sx={{ width: "50%", ml: "auto", position:"fixed" ,top:10 , right:5, zIndex:1000}}>
      <Collapse in={open}>
        <Alert
          severity={severity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
}
