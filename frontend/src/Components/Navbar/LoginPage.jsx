import { useState } from "react";
import SurferImage from "../../assets/login.jpg";
import ForgotPassword from "./ForgotPassword"; // ✅ import new component

export default function StylishLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@loan.com" && password === "123456") {
      alert("✅ Login successful!");
    } else {
      alert("❌ Invalid credentials");
    }
    setEmail("");
    setPassword("");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl ">
          {/* Left Section (Image/Illustration) */}
          <div className="md:w-1/2 w-full flex items-center justify-end py-25">
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
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border rounded-lg 
                                 focus:border-blue-500 focus:ring-2 
                                 focus:ring-blue-500 focus:outline-none"
                      placeholder="admin@loan.com"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
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
