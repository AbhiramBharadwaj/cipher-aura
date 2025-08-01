import { Shield, Lock, Unlock, MessageSquare, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="glass-card border-navy-light">
        {/* Header */}
        <div className="p-4 border-b border-navy-light">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary security-pulse" />
            {!collapsed && <span className="text-xl font-bold neon-text">CipherAura</span>}
          </div>
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
                        : "hover:bg-navy-light text-foreground hover:text-primary"
                      } transition-all duration-200
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

        {/* Bottom Section */}
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

        {/* Sidebar Toggle */}
        <SidebarTrigger className="absolute -right-3 top-6 bg-card border border-navy-light hover:bg-navy-light" />
      </SidebarContent>
    </Sidebar>
  );
}