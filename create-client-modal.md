"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { User, Phone, Globe } from "lucide-react";
import { toast } from "sonner";

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; countryCode: string; phone: string }) => Promise<void>;
  isCreating?: boolean;
  initialName?: string;
}

const COUNTRY_CODES = [
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+1", country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+34", country: "España", flag: "🇪🇸" },
];

export function CreateClientModal({ open, onOpenChange, onSave, isCreating = false, initialName = "" }: CreateClientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+591",
    phone: "",
  });

  // Pre-llenar el nombre cuando se abre el modal
  useEffect(() => {
    if (open && initialName) {
      setFormData(prev => ({ ...prev, name: initialName }));
    } else if (!open) {
      // Limpiar el formulario cuando se cierra el modal
      setFormData({
        name: "",
        countryCode: "+591",
        phone: "",
      });
    }
  }, [open, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      toast.error("El nombre completo es requerido");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("El teléfono es requerido");
      return;
    }

    // Validar que el teléfono solo contenga números
    if (!/^\d+$/.test(formData.phone)) {
      toast.error("El teléfono solo debe contener números");
      return;
    }

    try {
      await onSave(formData);
      // Limpiar el formulario después de guardar
      setFormData({
        name: "",
        countryCode: "+591",
        phone: "",
      });
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Solo permitir números
    const cleanedValue = value.replace(/\D/g, "");
    setFormData({ ...formData, phone: cleanedValue });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            Crear Nuevo Cliente
          </DialogTitle>
          <DialogDescription>
            Complete los datos del nuevo cliente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Nombre Completo */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              Nombre Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11"
              required
              maxLength={100}
              disabled={isCreating}
            />
          </div>

          {/* Código de País */}
          <div className="space-y-2">
            <Label htmlFor="countryCode" className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Código de País <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.countryCode}
              onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
              disabled={isCreating}
            >
              <SelectTrigger id="countryCode" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.country} ({country.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teléfono/Celular */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Teléfono/Celular <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="71890091"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-11"
              required
              maxLength={15}
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              Solo el número, sin código de país
            </p>
          </div>

          {/* Vista previa del teléfono completo */}
          {formData.phone && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">Se guardará como:</p>
              <p className="text-sm font-medium">
                {formData.countryCode} {formData.phone}
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating || !formData.name.trim() || !formData.phone.trim()}
            >
              {isCreating ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Creando...
                </>
              ) : (
                "Crear Cliente"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
