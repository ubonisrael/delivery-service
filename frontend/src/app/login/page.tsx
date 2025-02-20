import { LoginForm } from "@/components/login-form"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/authContext";
import { useEffect } from "react";

export default function Page() {
  const { user} = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user])
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
