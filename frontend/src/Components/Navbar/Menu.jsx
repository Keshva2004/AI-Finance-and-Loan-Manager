import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import InfoIcon from "@mui/icons-material/Info";
import ContactsIcon from "@mui/icons-material/Contacts";
import { Link } from "react-router-dom";

export default function Menu() {
  const menus = [
    { path: "/", name: "Home" },
    { path: "/featues", name: "Features" },
    { path: "/work", name: "How it works" },
    { path: "/aboutUs", name: "About Us" },
    { path: "/contact", name: "Contact" },
  ];
  const icons = [
    <HomeIcon key="home" color="primary" />,
    <InsertChartIcon key="features" color="primary" />,
    <WorkspacePremiumIcon key="how" color="primary" />,
    <InfoIcon key="about" color="primary" />,
    <ContactsIcon key="contact" color="primary" />,
  ];
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden lg:flex w-1/2 justify-around font-sans text-[19px] font-medium items-center">
        {menus.map((menu) => (
          <Link to={menu.path} key={menu.name}>
            <h2 key={menu.name} className="relative cursor-pointer group">
              {menu.name}
              <span className="absolute left-0 -bottom-8 h-[4px] w-0 bg-[#2563EB] transition-all duration-300 group-hover:w-full"></span>
            </h2>
          </Link>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden text-black focus:outline-none ml-auto cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <CloseIcon style={{ fontSize: 35 }} />
        ) : (
          <MenuOpenIcon style={{ fontSize: 40 }} />
        )}
      </button>

      {/* Slide Down Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 bg-white shadow-md absolute top-full left-0 w-full ${
          open ? "min-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col p-6 space-y-6 text-lg font-medium">
          {menus.map((menu, idx) => (
            <Link to={menu.path} key={menu.name}>
              <div
                key={idx}
                className="flex justify-between relative cursor-pointer group hover:ring-2 ring-[#2563EB]/50 shadow-sm shadow-[#2563EB]/20 rounded p-6"
                onClick={() => setOpen(false)}
              >
                <div>
                  <h2
                    key={menu.name}
                    // close dropdown on click
                  >
                    <span className="mr-3">{icons[idx]}</span> {menu.name}{" "}
                  </h2>
                </div>
                <div key={idx}>
                  <ArrowForwardIosIcon />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
