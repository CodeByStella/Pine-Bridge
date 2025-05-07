import { Card, CardContent } from "@/components/ui/card";

const System = () => {
  return (
    <section className="mb-10">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">System Status</h3>
        <p className="text-gray-600 mt-1">
          Overview of the Pine-Bridge platform status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h4 className="font-medium text-lg mb-4">Server Status</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Server</span>
                <span className="text-green-500 flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>{" "}
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database</span>
                <span className="text-green-500 flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>{" "}
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trading Engine</span>
                <span className="text-green-500 flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>{" "}
                  Operational
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
                <span className="text-gray-800 font-medium">--</span>
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
  );
};

export default System;
