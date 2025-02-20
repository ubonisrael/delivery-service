import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";
import { SocketProvider } from "./context/socketContext";

export default function Layout() {
  return (
    <SidebarProvider>
      <SocketProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SocketProvider>
    </SidebarProvider>
  );
}
