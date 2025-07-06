import { AppSidebar } from '@/components/app-sidebar'
import { PageContainer } from '@/components/page-container'
import { SidebarProvider } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'
import { getCachedSession } from '@/lib/session'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCachedSession()

  if (!session?.user) {
    return redirect('/sign-in')
  }

  return (
    <div className="min-h-screen">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <PageContainer>{children}</PageContainer>
      </SidebarProvider>
    </div>
  )
} 