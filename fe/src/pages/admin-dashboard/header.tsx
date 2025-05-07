import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-800">Admin Dashboard</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-600">
            Admin: {user?.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
