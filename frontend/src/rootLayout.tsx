import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/authContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
