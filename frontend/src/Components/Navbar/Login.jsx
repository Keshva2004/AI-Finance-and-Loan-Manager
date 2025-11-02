import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="w-1/6  flex justify-end items-center ">
      <Link to="/login">
        <Button className="navButton" variant="contained">
          Login
        </Button>
      </Link>
    </div>
  );
}
