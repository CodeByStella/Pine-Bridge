import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { User } from "@shared/schema";
import { useEffect, useState } from "react";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: User["role"][];
};

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !isRedirecting) {
      setIsRedirecting(true);
      navigate("/auth");
    }
  }, [user, isLoading, navigate, isRedirecting]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect will handle the redirect
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return <Route path={path} component={Component} />;
}
