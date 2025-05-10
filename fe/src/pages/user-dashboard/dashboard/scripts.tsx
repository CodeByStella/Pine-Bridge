import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DeleteItemType, ActionType } from "@shared/types";
import { formatDistanceToNow } from "date-fns";

import { Play, Pause, Square, Trash2, Upload } from "lucide-react";
import { Script } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ScriptModal from "@/components/script-modal";
import ConfirmModal from "@/components/confirm-modal";
import { useToast } from "@/hooks/use-toast";

const Scripts = () => {
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteItem, setDeleteItem] = useState<DeleteItemType | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const scriptActionMutation = useMutation({
    mutationFn: async ({
      scriptId,
      action,
    }: {
      scriptId: string;
      action: ActionType;
    }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/scripts/${scriptId}/${action}`,
        {},
      );
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });

      // Get updated status from the response
      const status = data.status;
      const actionMap: Record<string, string> = {
        running: "started",
        paused: "paused",
        stopped: "stopped",
      };

      toast({
        title: "Success",
        description: `Script ${actionMap[status] || status} successfully`,
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

  const handleScriptAction = (scriptId: string, action: ActionType) => {
    scriptActionMutation.mutate({ scriptId, action });
  };

  const deleteScriptMutation = useMutation({
    mutationFn: async (scriptId: string) => {
      await apiRequest("DELETE", `/api/scripts/${scriptId}`, {});
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

  const handleDelete = () => {
    if (!deleteItem) return;

    if (deleteItem.type === "script") {
      deleteScriptMutation.mutate(deleteItem.id);
    }
  };

  const formatLastRun = (lastRun: Date | null | undefined) => {
    if (!lastRun) return "Never";
    return formatDistanceToNow(new Date(lastRun), { addSuffix: true });
  };

  const confirmDeleteScript = (script: Script) => {
    setDeleteItem({
      type: "script",
      id: script._id,
      name: script.name,
    });
    setIsConfirmModalOpen(true);
  };

  const {
    data: scripts = [],
    isLoading: isLoadingScripts,
    error: scriptsError,
  } = useQuery<Script[]>({
    queryKey: ["/api/scripts"],
    enabled: !!user,
  });

  useEffect(() => {
    if (scriptsError) {
      toast({
        title: "Error loading scripts",
        description: (scriptsError as Error).message,
        variant: "destructive",
      });
    }
  }, [scriptsError, toast]);

  return (
    <>
      <section className="mb-10 w-full">
        <div className="mb-6 h-10 flex justify-between items-center">
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Script Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoadingScripts ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        Loading scripts...
                      </td>
                    </tr>
                  ) : scripts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No scripts found. Upload a script to get started.
                      </td>
                    </tr>
                  ) : (
                    scripts.map((script) => (
                      <tr key={script._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                          {script.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-${script.status.toLowerCase()}`}
                          >
                            {script.status.charAt(0).toUpperCase() +
                              script.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {formatLastRun(script.lastRun)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          <div className="flex space-x-2 justify-center">
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`text-yellow-500 hover:text-yellow-700 ${
                                script.status === "paused"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title="Pause"
                              disabled={
                                script.status === "paused" ||
                                script.status === "stopped"
                              }
                              onClick={() =>
                                handleScriptAction(script._id, "pause")
                              }
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-500 hover:text-green-700"
                              title="Start"
                              disabled={script.status === "running"}
                              onClick={() =>
                                handleScriptAction(script._id, "start")
                              }
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`text-red-500 hover:text-red-700 ${
                                script.status === "stopped"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title="Stop"
                              disabled={script.status === "stopped"}
                              onClick={() =>
                                handleScriptAction(script._id, "stop")
                              }
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
      <ScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
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

export default Scripts;
