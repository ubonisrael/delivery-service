import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/authContext"
import { Form as RRForm } from "react-router-dom"

const loginSchema = z
  .object({
    email: z.string().email("This is not a valid email"),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .required();

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login } = useAuth();

  // async function onSubmit(values: z.infer<typeof loginSchema>) {

    // login(values.email, values.password)
    // const rawResponse = await fetch('http://localhost:3000/api/auth/login', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(values)
    // });
    // const content = await rawResponse.json();
    // const toastTitle = content.error ? "Error" : "Success";
    // const toastDesc = content.error ? content.error : content.message;
    // const toastLabel = content.error ? "Try again" : "Go to login page";
    // const toastAction = content.error ? () => {} : () => navigate("/");

    // toast(toastTitle, {
    //   description: toastDesc,
    //   action: {
    //     label: toastLabel,
    //     onClick: toastAction,
    //   },
    // });
  

  // }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <RRForm method="POST" action="" className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full cursor-pointer">
                Login
              </Button>
            </RRForm>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
