import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl flex rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Pine-Bridge</h1>
            <p className="mt-2 text-gray-600">
              {isLogin ? "Trading Automation Platform" : "Create Your Account"}
            </p>
            <div className="text-left">
              {isLogin ? (
                <LoginForm onToggleForm={toggleForm} />
              ) : (
                <RegisterForm onToggleForm={toggleForm} />
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Hero */}
        <div className="md:block md:w-1/2 bg-primary p-12 text-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">
            Pine-Bridge Trading Platform
          </h2>
          <p className="mb-6">
            Automate your trading strategies with our powerful script management
            system. Connect to multiple trading accounts and manage all your
            trading activities in one place.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Upload and manage trading scripts
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Control script execution (start, pause, stop)
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Connect to multiple trading accounts
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Secure and reliable trading automation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
