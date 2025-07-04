import { AppSidebar } from '@/components/app-sidebar'
import { PageContainer } from '@/components/page-container'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <PageContainer>{children}</PageContainer>
      </SidebarProvider>
    </div>
  )
} 