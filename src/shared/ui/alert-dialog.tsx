import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/cn"

// Componente de confirmación reutilizable basado en Dialog existente
const AlertDialog = Dialog

const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => <Button ref={ref} {...props} />)
AlertDialogTrigger.displayName = "AlertDialogTrigger"

// Wrapper del DialogContent sin el botón X (para que no se pueda cerrar fácilmente)
const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <DialogContent ref={ref} className={cn("sm:max-w-[425px]", className)} {...props}>
    {children}
  </DialogContent>
))
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = DialogHeader
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = DialogFooter
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = DialogTitle
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = DialogDescription
AlertDialogDescription.displayName = "AlertDialogDescription"

// Botón de acción (generalmente el peligroso)
const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <Button ref={ref} className={className} {...props} />
))
AlertDialogAction.displayName = "AlertDialogAction"

// Botón de cancelar
const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <Button ref={ref} variant="outline" className={className} {...props} />
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
