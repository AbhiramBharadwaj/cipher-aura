import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { EncryptPage } from "@/components/dashboard/EncryptPage";
import { DecryptPage } from "@/components/dashboard/DecryptPage";
import { MessagesPage } from "@/components/dashboard/MessagesPage";
import { SettingsPage } from "@/components/dashboard/SettingsPage";

export type DashboardPage = "encrypt" | "decrypt" | "messages" | "settings";

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState<DashboardPage>("encrypt");

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
            {renderPage()}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;