import { Link } from 'react-router'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ModeToggle } from '@/components/theme/ModeToggle'
import { SidebarNav } from './Sidebar'
import { useSidebarStore } from '@/stores/useSidebarStore'

export function Header() {
  const isOpen = useSidebarStore((state) => state.isOpen)
  const open = useSidebarStore((state) => state.open)
  const close = useSidebarStore((state) => state.close)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={open}
      >
        <Menu className="size-5" />
        <span className="sr-only">메뉴 열기</span>
      </Button>
      <Link to="/" className="font-semibold md:hidden">
        React Starter Kit
      </Link>
      <div className="ml-auto">
        <ModeToggle />
      </div>

      <Sheet open={isOpen} onOpenChange={(next) => (next ? open() : close())}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b">
            <SheetTitle>React Starter Kit</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={close} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
