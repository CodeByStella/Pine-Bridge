import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Script, TradingAccount } from "@shared/schema";
import { DeleteItemType, ScriptWithStatus, ActionType } from "@shared/types";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";

import ScriptModal from "@/components/script-modal";
import AccountModal from "@/components/account-modal";
import ConfirmModal from "@/components/confirm-modal";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Square, Trash2, Upload, Plus } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function UserDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("scripts");
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DeleteItemType | null>(null);

  // Fetch user scripts
  const { 
    data: scripts = [],
    isLoading: isLoadingScripts,
    error: scriptsError 
  } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
    enabled: !!user
  });

  // Fetch user trading accounts
  const { 
    data: accounts = [],
    isLoading: isLoadingAccounts,
    error: accountsError 
  } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    enabled: !!user
  });

  // Script action mutation (start, pause, stop)
  const scriptActionMutation = useMutation({
    mutationFn: async ({ scriptId, action }: { scriptId: number; action: ActionType }) => {
      const res = await apiRequest("PATCH", `/api/scripts/${scriptId}/${action}`, null);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Success",
        description: "Script status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete script mutation
  const deleteScriptMutation = useMutation({
    mutationFn: async (scriptId: number) => {
      await apiRequest("DELETE", `/api/scripts/${scriptId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Success",
        description: "Script deleted successfully",
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

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      await apiRequest("DELETE", `/api/trading-accounts/${accountId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading-accounts"] });
      toast({
        title: "Success",
        description: "Trading account deleted successfully",
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

  // Handle script action (start, pause, stop)
  const handleScriptAction = (scriptId: number, action: ActionType) => {
    scriptActionMutation.mutate({ scriptId, action });
  };

  // Handle script deletion confirmation
  const confirmDeleteScript = (script: Script) => {
    setDeleteItem({
      type: "script",
      id: script.id,
      name: script.name
    });
    setIsConfirmModalOpen(true);
  };

  // Handle account deletion confirmation
  const confirmDeleteAccount = (account: TradingAccount) => {
    setDeleteItem({
      type: "account",
      id: account.id,
      name: `${account.server} (${account.accountNumber})`
    });
    setIsConfirmModalOpen(true);
  };

  // Handle actual deletion
  const handleDelete = () => {
    if (!deleteItem) return;
    
    if (deleteItem.type === "script") {
      deleteScriptMutation.mutate(deleteItem.id);
    } else if (deleteItem.type === "account") {
      deleteAccountMutation.mutate(deleteItem.id);
    }
  };

  // Get running scripts for an account
  const getRunningScriptsForAccount = (accountId: number) => {
    return scripts
      .filter(script => 
        script.status === "running" && 
        // This is a simplified approach - in a real app, you'd have a proper relation check
        Math.random() > 0.5 // Just for demo purposes
      )
      .map(script => script.name)
      .join(", ") || "None";
  };

  // Format the last run date
  const formatLastRun = (lastRun: Date | null | undefined) => {
    if (!lastRun) return "Never";
    return formatDistanceToNow(new Date(lastRun), { addSuffix: true });
  };

  // If there are errors, show them
  useEffect(() => {
    if (scriptsError) {
      toast({
        title: "Error loading scripts",
        description: (scriptsError as Error).message,
        variant: "destructive",
      });
    }

    if (accountsError) {
      toast({
        title: "Error loading accounts",
        description: (accountsError as Error).message,
        variant: "destructive",
      });
    }
  }, [scriptsError, accountsError, toast]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        activeItem={activeSection} 
        onItemClick={setActiveSection}
        items={[
          { id: "scripts", icon: "code", label: "My Scripts" },
          { id: "actions", icon: "bolt", label: "Actions" },
          { id: "accounts", icon: "user-circle", label: "My Trading Accounts" }
        ]}
        title="Pine-Bridge"
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-600">
                User: {user?.firstName} {user?.lastName}
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
          {/* Scripts Section */}
          {activeSection === "scripts" && (
            <section className="mb-10">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">My Scripts</h3>
                <Button onClick={() => setIsScriptModalOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Script
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Script Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoadingScripts ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              Loading scripts...
                            </td>
                          </tr>
                        ) : scripts.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              No scripts found. Upload a script to get started.
                            </td>
                          </tr>
                        ) : (
                          scripts.map((script) => (
                            <tr key={script.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {script.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-${script.status.toLowerCase()}`}>
                                  {script.status.charAt(0).toUpperCase() + script.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatLastRun(script.lastRun)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`text-yellow-500 hover:text-yellow-700 ${script.status === 'paused' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Pause"
                                    disabled={script.status === 'paused' || script.status === 'stopped'}
                                    onClick={() => handleScriptAction(script.id, 'pause')}
                                  >
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-green-500 hover:text-green-700"
                                    title="Start"
                                    disabled={script.status === 'running'}
                                    onClick={() => handleScriptAction(script.id, 'start')}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`text-red-500 hover:text-red-700 ${script.status === 'stopped' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Stop"
                                    disabled={script.status === 'stopped'}
                                    onClick={() => handleScriptAction(script.id, 'stop')}
                                  >
                                    <Square className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700"
                                    title="Delete"
                                    onClick={() => confirmDeleteScript(script)}
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
                </CardContent>
              </Card>
            </section>
          )}
          
          {/* Actions Section */}
          {activeSection === "actions" && (
            <section className="mb-10">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Actions</h3>
                <p className="text-gray-600 mt-1">This section is a placeholder for future functionality.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 border border-gray-200">
                  <div className="text-gray-600 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"></path>
                    </svg>
                    <h4 className="font-medium">Performance Analytics</h4>
                    <p className="text-sm mt-2">Coming Soon</p>
                  </div>
                </Card>
                <Card className="p-6 border border-gray-200">
                  <div className="text-gray-600 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
                    </svg>
                    <h4 className="font-medium">Alert Configuration</h4>
                    <p className="text-sm mt-2">Coming Soon</p>
                  </div>
                </Card>
                <Card className="p-6 border border-gray-200">
                  <div className="text-gray-600 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
                    </svg>
                    <h4 className="font-medium">Advanced Settings</h4>
                    <p className="text-sm mt-2">Coming Soon</p>
                  </div>
                </Card>
              </div>
            </section>
          )}
          
          {/* Trading Accounts Section */}
          {activeSection === "accounts" && (
            <section className="mb-10">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">My Trading Accounts</h3>
                <Button onClick={() => setIsAccountModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broker</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Running Scripts</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoadingAccounts ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              Loading accounts...
                            </td>
                          </tr>
                        ) : accounts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No trading accounts found. Add an account to get started.
                            </td>
                          </tr>
                        ) : (
                          accounts.map((account) => (
                            <tr 
                              key={account.id} 
                              className={account.status === 'connected' ? 'account-row-connected' : ''}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {account.server}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {account.accountNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-${account.status.toLowerCase()}`}>
                                  {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getRunningScriptsForAccount(account.id)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete Account"
                                  onClick={() => confirmDeleteAccount(account)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>
      
      {/* Modals */}
      <ScriptModal 
        isOpen={isScriptModalOpen} 
        onClose={() => setIsScriptModalOpen(false)} 
      />
      
      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
      />
      
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${deleteItem?.type}`}
        message={`Are you sure you want to delete ${deleteItem?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
