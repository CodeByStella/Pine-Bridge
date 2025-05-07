import React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Script, TradingAccount } from "@shared/schema";
import { DeleteItemType } from "@shared/types";
import { useToast } from "@/hooks/use-toast";

import AccountModal from "@/components/account-modal";
import ConfirmModal from "@/components/confirm-modal";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

const Accounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DeleteItemType | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const confirmDeleteAccount = (account: TradingAccount) => {
    setDeleteItem({
      type: "account",
      id: account._id,
      name: `${account.server} (${account.accountNumber})`,
    });
    setIsConfirmModalOpen(true);
  };

  const {
    data: accounts = [],
    isLoading: isLoadingAccounts,
    error: accountsError,
  } = useQuery<TradingAccount[]>({
    queryKey: ["/api/trading-accounts"],
    enabled: !!user,
  });

  const {
    data: scripts = [],
    isLoading: isLoadingScripts,
    error: scriptsError,
  } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
    enabled: !!user,
  });

  const getRunningScriptsForAccount = (accountId: string) => {
    return (
      scripts
        .filter(
          (script) =>
            script.status === "running" &&
            // This is a simplified approach - in a real app, you'd have a proper relation check
            Math.random() > 0.5 // Just for demo purposes
        )
        .map((script) => script.name)
        .join(", ") || "None"
    );
  };

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

  const handleDelete = () => {
    if (!deleteItem) return;

    if (deleteItem.type === "account") {
      deleteAccountMutation.mutate(Number(deleteItem.id));
    }
  };

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
    <>
      <section className="mb-10">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            My Trading Accounts
          </h3>
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
                    <th className="px-8 text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broker
                    </th>
                    <th className="px-8 text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Number
                    </th>
                    <th className="px-8 text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Running Scripts
                    </th>
                    <th className="px-8 text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoadingAccounts ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-8 py-4 text-center text-sm text-gray-500"
                      >
                        Loading accounts...
                      </td>
                    </tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-8 py-4 text-center text-sm text-gray-500"
                      >
                        No trading accounts found. Add an account to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    accounts.map((account) => (
                      <tr
                        key={account._id}
                        className={
                          account.status === "connected"
                            ? "account-row-connected"
                            : ""
                        }
                      >
                        <td className="px-8 py-4 text-center whitespace-nowrap text-sm font-medium text-gray-900">
                          {account.server}
                        </td>
                        <td className="px-8 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                          {account.accountNumber}
                        </td>
                        <td className="px-8 py-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-${account.status.toLowerCase()}`}
                          >
                            {account.status.charAt(0).toUpperCase() +
                              account.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                          {getRunningScriptsForAccount(account._id)}
                        </td>
                        <td className="px-8 py-4 text-center whitespace-nowrap text-sm text-gray-500">
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
    </>
  );
};

export default Accounts;
