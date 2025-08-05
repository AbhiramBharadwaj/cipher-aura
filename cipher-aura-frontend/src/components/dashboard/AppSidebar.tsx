import { Shield, Lock, Unlock, MessageSquare, Settings, LogOut, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { DashboardPage } from "./Dashboard";

interface AppSidebarProps {
  currentPage: DashboardPage;
  onPageChange: (page: DashboardPage) => void;
}

const navigationItems = [
  { id: "encrypt" as const, title: "Encrypt", icon: Lock },
  { id: "decrypt" as const, title: "Decrypt", icon: Unlock },
  { id: "messages" as const, title: "Messages", icon: MessageSquare },
  { id: "settings" as const, title: "Settings", icon: Settings },
];

export function AppSidebar({ currentPage, onPageChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} fixed z-50 h-full transition-all duration-300`}>
      <SidebarContent className="glass-card border-navy-light flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-navy-light flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            {!collapsed && <span className="text-xl font-bold neon-text">CipherAura</span>}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.id)}
                    className={`
                      ${currentPage === item.id
                        ? "bg-primary text-primary-foreground neon-glow"
                        : "hover:bg-navy-light text-foreground hover:text-primary"}
                      transition-all duration-200 flex items-center space-x-2
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span className="font-medium">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom */}
        <div className="mt-auto p-4 border-t border-navy-light">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="hover:bg-navy-light text-foreground hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
                {!collapsed && <span>Logout</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
