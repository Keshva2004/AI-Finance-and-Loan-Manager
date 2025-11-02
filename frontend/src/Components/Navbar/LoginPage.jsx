import { useState } from "react";
import SurferImage from "../../assets/login.jpg";
import ForgotPassword from "./ForgotPassword";
import { useFlash } from "../../Context/FlashProvider";
import { useNavigate } from "react-router-dom";

export default function StylishLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const { showFlash } = useFlash();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:8080/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    const data = await response.json();
    console.log(data);
    const { success, message, user } = data;
    console.log("success", success);
    console.log("user", user);
    showFlash(data.message, data.success ? "success" : "error");
    if (success) {
      navigate("/dashboard"); // Redirect to home or dashboard on successful login
    }

    setUsername("");
    setPassword("");
  };

  return (
    <>
      <div className="min-h-screen mt-10 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 py-1 px-2">
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl ">
          {/* Left Section (Image/Illustration) */}
          <div className="md:w-1/2 w-full flex items-center justify-end py-20">
            <img
              src={SurferImage}
              alt="Illustration"
              className=" md:max-w-sm "
            />
          </div>

          {/* Right Section */}
          <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
            {!forgotMode ? (
              <>
                <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center hover:underline underline-offset-8 decoration-blue-500">
                  Login
                  <span className="absolute left-0 -bottom-8 h-[4px] w-0 bg-[#2563EB] transition-all duration-300 group-hover:w-full"></span>
                </h2>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg 
                                 focus:border-blue-500 focus:ring-2 
                                 focus:ring-blue-500 focus:outline-none"
                      placeholder="username"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg 
                                 focus:border-blue-500 focus:ring-2 
                                 focus:ring-blue-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Options */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" /> Remember me
                    </label>
                    <p
                      onClick={() => setForgotMode(true)}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </p>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
                  >
                    Login
                  </button>
                </form>
              </>
            ) : (
              <ForgotPassword onBack={() => setForgotMode(false)} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
