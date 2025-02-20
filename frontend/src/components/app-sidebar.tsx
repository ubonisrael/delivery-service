import { Home, MessageCircle, LogOut } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Form, Link, useLocation } from "react-router-dom";
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { useAuth } from "@/context/authContext";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Chat",
    url: "chat",
    icon: MessageCircle,
  },
  {
    title: "Logout",
    url: "logout",
    icon: LogOut,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth()
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Delivery Fee Service</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => {
                if (item.url === "chat")
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={index === 1}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={location.pathname === item.url}
                          >
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {user.chats.map(
                              (chat, i) => (
                                <SidebarMenuSubItem key={i+chat.name}>
                                  <SidebarMenuSubButton asChild isActive>
                                    <Link to={`chat/${chat.name.toLowerCase()}`}>
                                      <item.icon />
                                      <span>{chat.name}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      {item.url === "logout" ? (
                        <Form method="POST" action="/logout" className="mt-4">
                          <Button type="submit" className="w-full cursor-pointer">
                            <item.icon />
                            <span>{item.title}</span>
                          </Button>
                        </Form>
                      ) : (
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
