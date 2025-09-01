import { useState } from "react";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (email) {
      alert(`🔑 Password reset link sent to ${email}`);
      onBack(); // go back to login after success
    } else {
      alert("❌ Please enter your registered email first.");
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md transition"
        >
          Send Reset Link
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
