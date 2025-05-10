import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { useLocation } from "wouter";

import Header from "./header";
import Accounts from "./accounts";
import Dashboard from "./dashboard";

export default function UserDashboard() {
  const { logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("scripts");

  // Handle logout
  useEffect(() => {
    if (logoutMutation.isSuccess) {
      navigate("/auth");
    }
  }, [logoutMutation.isSuccess, navigate]);

  // Show loading state during logout
  if (logoutMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-4xl flex rounded-lg shadow-lg overflow-hidden">
          <div className="w-full bg-white p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Logging out...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar
        activeItem={activeSection}
        onItemClick={setActiveSection}
        items={[
          { id: "dashboard", icon: "code", label: "Dashboard" },
          { id: "accounts", icon: "user-circle", label: "Trading Accounts" },
        ]}
        title="Pine-Bridge"
      />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeSection === "dashboard" && <Dashboard />}
          {activeSection === "accounts" && <Accounts />}
        </div>
      </main>
    </div>
  );
}
