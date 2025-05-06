import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import { UserWithDetails, DeleteItemType } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import UserDetailsModal from "@/components/user-details-modal";
import ConfirmModal from "@/components/confirm-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, Search, UserX, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [deleteItem, setDeleteItem] = useState<DeleteItemType | null>(null);

  // Fetch all users
  const { 
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError 
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin"
  });

  // Fetch user details (with scripts and accounts)
  const { 
    data: userDetails,
    refetch: refetchUserDetails
  } = useQuery<UserWithDetails>({
    queryKey: ["/api/admin/users", selectedUser?._id],
    enabled: !!selectedUser && isUserDetailsModalOpen
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  
  // Filter users by search term
  const filteredUsers = searchTerm
    ? users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;
    
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle view user details
  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsModalOpen(true);
  };

  // If there are errors, show them
  useEffect(() => {
    if (usersError) {
      toast({
        title: "Error loading users",
        description: (usersError as Error).message,
        variant: "destructive",
      });
    }
  }, [usersError, toast]);

  // When user details modal is opened, fetch the user details
  useEffect(() => {
    if (isUserDetailsModalOpen && selectedUser) {
      refetchUserDetails();
    }
  }, [isUserDetailsModalOpen, selectedUser, refetchUserDetails]);

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setIsConfirmModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle user deletion confirmation
  const confirmDeleteUser = (user: User) => {
    setDeleteItem({
      type: "user",
      id: user._id,
      name: `${user.firstName} ${user.lastName} (${user.email})`
    });
    setIsConfirmModalOpen(true);
  };

  // Handle actual deletion
  const handleDelete = () => {
    if (!deleteItem) return;
    
    if (deleteItem.type === "user") {
      deleteUserMutation.mutate(Number(deleteItem.id));
    }
  };

  // Map role ID to readable name
  const getRoleName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        activeItem={activeSection} 
        onItemClick={setActiveSection}
        items={[
          { id: "users", icon: "users", label: "Users" },
          { id: "system", icon: "cogs", label: "System" }
        ]}
        title="Pine-Bridge Admin"
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Header */}
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Users Section */}
          {activeSection === "users" && (
            <section className="mb-10">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800">User Management</h3>
              </div>
              
              <Card>
                <CardContent className="p-4 border-b border-gray-200">
                  <form className="flex gap-4 flex-wrap items-center" onSubmit={(e) => e.preventDefault()}>
                    <div className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email"
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button type="submit">
                      Search
                    </Button>
                  </form>
                </CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                            Loading users...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                            {searchTerm ? "No users found matching your search." : "No users found."}
                          </td>
                        </tr>
                      ) : (
                        currentUsers.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.firstName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.country}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleName(user.role)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-blue-500 hover:text-blue-700"
                                  title="View User Details"
                                  onClick={() => handleViewUserDetails(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete User"
                                  onClick={() => confirmDeleteUser(user)}
                                  disabled={user.role === "admin"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{" "}
                    <span className="font-medium">{filteredUsers.length}</span> users
                  </div>
                  <div className="flex-1 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <div className="mx-2 flex items-center">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Button 
                          key={i} 
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          className="mx-1 w-8 h-8"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      )).slice(0, 5)}
                      {totalPages > 5 && <span className="mx-1">...</span>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          )}
          
          {/* System Section */}
          {activeSection === "system" && (
            <section className="mb-10">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800">System Status</h3>
                <p className="text-gray-600 mt-1">Overview of the Pine-Bridge platform status.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h4 className="font-medium text-lg mb-4">Server Status</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">API Server</span>
                        <span className="text-green-500 flex items-center">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span> Operational
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Database</span>
                        <span className="text-green-500 flex items-center">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span> Operational
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Trading Engine</span>
                        <span className="text-green-500 flex items-center">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span> Operational
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h4 className="font-medium text-lg mb-4">Usage Statistics</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Users</span>
                        <span className="text-gray-800 font-medium">{users.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Running Scripts</span>
                        <span className="text-gray-800 font-medium">--</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Connected Accounts</span>
                        <span className="text-gray-800 font-medium">--</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </div>
      </main>
      
      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        user={userDetails || selectedUser}
      />
      
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={deleteItem ? `Are you sure you want to delete ${deleteItem.name}?` : ""}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
