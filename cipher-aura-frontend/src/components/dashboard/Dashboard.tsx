import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { EncryptPage } from "@/components/dashboard/EncryptPage";
import { DecryptPage } from "@/components/dashboard/DecryptPage";
import { MessagesPage } from "@/components/dashboard/MessagesPage";
import { SettingsPage } from "@/components/dashboard/SettingsPage";


import { Button } from "@/components/ui/button";
import { useAuth, getDisplayName } from "@/hooks/useAuth";

export type DashboardPage = "encrypt" | "decrypt" | "messages" | "settings";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthed, logout } = useAuth();

  const [currentPage, setCurrentPage] = useState<DashboardPage>("encrypt");

  // Guard: if not logged in, go to /login
  useEffect(() => {
    if (!isAuthed) navigate("/login");
  }, [isAuthed, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "encrypt":
        return <EncryptPage />;
      case "decrypt":
        return <DecryptPage />;
      case "messages":
        return <MessagesPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <EncryptPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-navy-medium">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar currentPage={currentPage} onPageChange={setCurrentPage} />

          <main className="flex-1 p-6">
            {/* Top bar: user name + logout */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Welcome{getDisplayName(user) ? "," : ""} {getDisplayName(user)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  You’re securely signed in.
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            {renderPage()}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
