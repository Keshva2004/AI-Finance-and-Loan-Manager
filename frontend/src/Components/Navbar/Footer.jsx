import React from "react";
import { Typography, Link as MuiLink, Box, Container } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-10">
      <Container maxWidth="lg">
        <Box className="flex flex-wrap justify-between gap-8">
          {/* Left Section: Logo and About */}
          <Box className="flex-1 min-w-[250px]">
            <Typography
              variant="h5"
              component="h3"
              className="text-blue-700 font-semibold"
            >
              Finance + Manage
            </Typography>
            <Typography
              variant="body2"
              className="text-gray-600 mt-2 leading-relaxed"
            >
              The smartest AI-driven platform for seamless loan and finance
              management. Manage loans, customers, payments, and reminders
              effortlessly.
            </Typography>
          </Box>

          {/* Middle Section: Navigation Links */}
          <Box className="flex-1 min-w-[150px]">
            <Typography
              variant="subtitle1"
              className="text-blue-700 font-semibold mb-3"
            >
              Quick Links
            </Typography>
            <Box component="ul" className="list-none p-0 m-0 space-y-2">
              {[
                { label: "Home", href: "#home" },
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#howitworks" },
                { label: "About Us", href: "#aboutus" },
                { label: "Contact", href: "#contact" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <MuiLink
                    href={href}
                    underline="hover"
                    className="text-gray-800 text-sm block"
                  >
                    {label}
                  </MuiLink>
                </li>
              ))}
            </Box>
          </Box>

          {/* Right Section: Contact & Socials */}
          <Box className="flex-1 min-w-[200px]">
            <Typography
              variant="subtitle1"
              className="text-blue-700 font-semibold mb-3"
            >
              Contact Us
            </Typography>
            <Typography variant="body2" className="text-gray-700">
              Email:{" "}
              <MuiLink
                href="mailto:support@finance-manage.com"
                underline="hover"
                className="text-blue-700"
              >
                support@finance-manage.com
              </MuiLink>
            </Typography>
            <Typography variant="body2" className="text-gray-700 mb-4">
              Phone: +91 12345 67890
            </Typography>
            <Box className="flex w-30 justify-between  space-x-5 text-[#2563EB]  text-xl ">
              <MuiLink
                href="https://www.facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-800"
              >
                <FacebookIcon fontSize="inherit" />
              </MuiLink>
              <MuiLink
                href="https://www.twitter.com"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-800"
              >
                <TwitterIcon fontSize="inherit" />
              </MuiLink>
              <MuiLink
                href="https://www.linkedin.com"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-800"
              >
                <LinkedInIcon fontSize="inherit" />
              </MuiLink>
            </Box>
          </Box>
        </Box>

        {/* Copyright */}
        <Typography
          variant="caption"
          className="block text-center text-gray-500 mt-10"
        >
          © {new Date().getFullYear()} Finance Manage. All rights reserved.
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;
