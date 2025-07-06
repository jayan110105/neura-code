'use client'

import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

export function PageContainer({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar()

  return (
    <SidebarInset>
      <div className="flex h-[55px] items-center px-4">
        {(isMobile || !open) && <SidebarTrigger />}
      </div>
      <main className="flex-1">{children}</main>
    </SidebarInset>
  )
} 