import { useState } from "react";
import { useFlash } from "../../Context/FlashProvider"; // Assuming this is your flash context

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showFlash } = useFlash();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !newPassword || !confirmPassword) {
      showFlash("Please fill in all fields", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showFlash("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      // Optional: Add password strength check
      showFlash("Password must be at least 6 characters", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/admin/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newPassword }),
          credentials: "include", // If needed for sessions
        }
      );
      const data = await response.json();
      showFlash(data.message, data.success ? "success" : "error");
      if (data.success) {
        onBack(); // Go back to login on success
      }
    } catch (error) {
      console.error("Error:", error);
      showFlash("An error occurred. Please try again.", "error");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Reset Password
      </h2>

      <form onSubmit={handleForgotPassword} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Enter your registered email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg 
                       focus:border-blue-500 focus:ring-2 
                       focus:ring-blue-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg 
                       focus:border-blue-500 focus:ring-2 
                       focus:ring-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg 
                       focus:border-blue-500 focus:ring-2 
                       focus:ring-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
        >
          Update Password
        </button>

        <p
          onClick={onBack}
          className="text-sm text-gray-600 text-center cursor-pointer hover:underline"
        >
          ← Back to Login
        </p>
      </form>
    </div>
  );
}
