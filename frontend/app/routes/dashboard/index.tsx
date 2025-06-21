import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome back! Here's your overview.</p>
      {/* Replace below with actual dashboard content */}
      <div className="rounded-md border p-4">Your content goes here.</div>
    </div>
  );
};

export default Dashboard;
