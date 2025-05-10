import { Card, CardContent } from "@/components/ui/card";
import React from "react";

const Actions = () => {
  return (
    <section className="mb-10 w-full">
      <div className="mb-6 h-10 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Actions</h3>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td
                    colSpan={1}
                    className="px-6 py-4 text-center text-sm"
                  >
                    1
                  </td>
                  <td
                    colSpan={1}
                    className="px-6 py-4 text-center text-sm"
                  >
                    Run
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={1}
                    className="px-6 py-4 text-center text-sm"
                  >
                    2
                  </td>
                  <td
                    colSpan={1}
                    className="px-6 py-4 text-center text-sm"
                  >
                    Pause
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={1}
                    className="px-6 py-4 text-center text-sm"
                  >
                    3
                  </td>
                  <td
                    colSpan={1}
                    className="px-6 py-4 text-center text-sm"
                  >
                    Stop
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Actions;
