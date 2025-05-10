import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import Users from "./users";
import Header from "./header";
import System from "./system";
import Security from "./security";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("users");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar
        activeItem={activeSection}
        onItemClick={setActiveSection}
        items={[
          { id: "users", icon: "users", label: "Users" },
          { id: "system", icon: "cogs", label: "System" },
          { id: "security", icon: "lock", label: "Security" },
        ]}
        title="Pine-Bridge Admin"
      />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeSection === "users" && <Users />}
          {activeSection === "system" && <System />}
          {activeSection === "security" && <Security />}
        </div>
      </main>
    </div>
  );
}
