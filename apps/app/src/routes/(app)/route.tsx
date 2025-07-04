import { authMiddleware } from "@/routes/-middleware/auth";
import { SidebarInset, SidebarProvider } from "@/ui/base/sidebar";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { api } from "../../services/api";
import { AppSidebar } from "./-ui/sidebar";

export const Route = createFileRoute("/(app)")({
  beforeLoad: async ({ location }) => {
    await authMiddleware(location);
  },
  component: AppLayout,
});

function AppLayout() {
  const { data: userResponse } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => api.users.me.query(),
    staleTime: 5 * 60 * 1000,
  });

  console.log("User data:", userResponse); // Para usar a variável

  // Função de logout disponível mas não utilizada ainda
  // const handleLogout = async () => {
  //   try {
  //     const refreshToken = tokenManager.getRefreshToken()
  //     if (refreshToken) {
  //       await api.auth.logout.mutate({ refreshToken })
  //     }
  //   } catch (error) {
  //     console.error('Erro ao fazer logout:', error)
  //   } finally {
  //     // Limpar tokens independentemente do resultado
  //     tokenManager.clearTokens()
  //     window.location.href = '/login'
  //   }
  // }

  // const user = userResponse?.user

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
