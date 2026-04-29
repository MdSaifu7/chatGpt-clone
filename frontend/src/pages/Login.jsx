import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../actions/userActions";
import { useAuth } from "../context/AuthContext";
export default function App() {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ email, password });

    const { status } = await loginUser({ email, password });
    if (status) {
      await fetchUser(); // Refresh user info
      navigate("/");
    } else {
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition py-2 rounded-lg font-medium"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-400">
          Don’t have an account?{" "}
          <button
            className="text-green-400 cursor-pointer"
            onClick={() => {
              navigate("/register");
            }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
