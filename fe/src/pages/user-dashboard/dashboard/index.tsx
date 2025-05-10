import React from "react";
import Scripts from "./scripts";
import Actions from "./actions";

const Dashboard = () => {
  return (
    <section className="flex justify-between gap-4">
      <div className="w-3/5">
        <Scripts />
      </div>
      <div className="w-2/5">
        <Actions />
      </div>
    </section>
  );
};

export default Dashboard;
