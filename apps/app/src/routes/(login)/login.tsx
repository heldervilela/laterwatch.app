import { isAuthenticated } from "@/services/api";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "./-ui/login-form";

export const Route = createFileRoute("/(login)/login")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: Login,
});

function Login() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm form="login" />
      </div>
    </div>
  );
}
