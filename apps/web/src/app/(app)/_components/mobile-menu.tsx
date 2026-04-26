"use client"

import { Button } from "@solaros/ui/components/button"
import { Dialog, DialogContent } from "@solaros/ui/components/dialog"
import { Menu } from "lucide-react"
import * as React from "react"

export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="left-0 top-0 max-w-[280px] translate-x-0 translate-y-0 rounded-none border-r p-0 sm:max-w-[280px]">
          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}
