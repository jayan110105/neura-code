'use client'

import { useEffect, useState } from 'react'
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

export function PageContainer({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <SidebarInset>
      <div className={`sticky top-0 z-50 flex h-[55px] items-center px-6 md:px-4 bg-background transition-colors duration-200 ${
        isScrolled ? 'border-b border-border' : ''
      }`}>
        {(isMobile || !open) && <SidebarTrigger />}
      </div>
      <main className="flex-1 px-4 md:px-0">{children}</main>
    </SidebarInset>
  )
} 