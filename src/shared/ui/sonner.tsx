import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toaster]:!bg-red-100 group-[.toaster]:!text-red-950 group-[.toaster]:!border-red-300",
          success: "group-[.toaster]:!bg-emerald-100 group-[.toaster]:!text-emerald-950 group-[.toaster]:!border-emerald-300",
          warning: "group-[.toaster]:!bg-orange-100 group-[.toaster]:!text-orange-950 group-[.toaster]:!border-orange-300",
          info: "group-[.toaster]:!bg-blue-100 group-[.toaster]:!text-blue-950 group-[.toaster]:!border-blue-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
