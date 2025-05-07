import { useState } from "react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  id: string;
  icon: string;
  label: string;
};

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  items: SidebarItem[];
  title: string;
}

export function Sidebar({
  activeItem,
  onItemClick,
  items,
  title,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const getIconElement = (icon: string) => {
    switch (icon) {
      case "code":
        return <i className="fas fa-code mr-3"></i>;
      case "bolt":
        return <i className="fas fa-bolt mr-3"></i>;
      case "user-circle":
        return <i className="fas fa-user-circle mr-3"></i>;
      case "users":
        return <i className="fas fa-users mr-3"></i>;
      case "cogs":
        return <i className="fas fa-cogs mr-3"></i>;
      default:
        return <i className="fas fa-circle mr-3"></i>;
    }
  };

  return (
    <aside className="bg-[#1F2937] text-white w-full md:w-64 flex-shrink-0 md:h-screen">
      <div className="p-4 flex justify-between items-center md:justify-center border-b border-gray-700 md:border-b-0">
        <h1 className="text-xl font-bold text-[#10b981]">{title}</h1>
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleSidebar}
        >
          <i className={`fas fa-${isOpen ? "times" : "bars"}`}></i>
        </button>
      </div>

      <nav
        className={cn(
          "md:block p-4 overflow-y-auto",
          isOpen ? "block" : "hidden",
        )}
      >
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "flex items-center p-2 text-white rounded-md hover:bg-gray-700",
                  activeItem === item.id && "nav-link active",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  onItemClick(item.id);
                  setIsOpen(false); // Close sidebar after clicking on mobile
                }}
              >
                {getIconElement(item.icon)}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
