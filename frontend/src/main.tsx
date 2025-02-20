import { StrictMode, use } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import Dashboard from "@/app/dashboard/page";
import GeneralChat from "@/app/general-chat/page";
// import RootLayout from "./rootLayout";
import Layout from "@/layout";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/authContext";
import { Axios } from "@/lib/utils";
import { toast } from "sonner";
import ErrorPage from "./error";

function App() {
  const { user, setUser } = useAuth();
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route errorElement={<ErrorPage />}>
        <Route
          path="/"
          element={<Layout />}
          loader={async () => {
            if (!user) {
              return redirect("/login");
            }
            return { user, setUser };
          }}
        >
          <Route index element={<Dashboard />} />
          <Route
            path="chat/:chatName"
            element={<GeneralChat />}
            loader={async ({ params }) => {
              const { chatName } = params;
              const chat = user.chats.find(
                (chat) => chat.name.toLowerCase() === chatName?.toLowerCase()
              );

              const response = await Axios.get(`chat/${chat._id}/members`);
              return {
                chatName,
                chatId: chat._id,
                user,
                setUser,
                members: response.data.members,
                type: chat.type,
              };
            }}
          />
          <Route
            path="logout"
            action={async () => {
              await Axios.post("auth/logout");
              setUser(null);
              return redirect(`/login`);
            }}
          />
        </Route>
        <Route
          path="login"
          element={<LoginPage />}
          action={async ({ request }) => {
            const formData = await request.formData();
            const { email, password } = Object.fromEntries(formData);

            let toastTitle = "Error";
            let toastDesc = "An unexpected error occurred.";
            let res;
            try {
              res = await Axios.post("auth/login", { email, password });
              toastTitle = "Success";
              toastDesc = res.data.message;

              setUser(res.data.user);
            } catch (e) {
              res = e.response;
              toastDesc = res.data.error;
            }
            toast(toastTitle, {
              description: toastDesc,
            });
            return null;
          }}
        />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    )
  );
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster />
  </StrictMode>
);
