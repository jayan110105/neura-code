import { AppSidebar } from '@/components/app-sidebar'
import { PageContainer } from '@/components/page-container'
import { SidebarProvider } from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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