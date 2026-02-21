import { useState } from "react";
import { Tag, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useCreateBrand } from "@/entities/product/api";
import { toast } from "sonner";

interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
}

export function CreateBrandModal({ isOpen, onClose, storeId }: CreateBrandModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createBrand = useCreateBrand();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre de la marca es requerido";
    }

    if (formData.name.length > 100) {
      newErrors.name = "El nombre no puede exceder 100 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createBrand.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        storeId
      });
      
      setFormData({ name: "", description: "" });
      setErrors({});
      toast.success("Marca creada correctamente");
      onClose();
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error("Error al crear la marca");
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <DialogTitle>Crear Nueva Marca</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand Name */}
          <div>
            <Label htmlFor="brand-name">
              Nombre de la Marca <span className="text-red-500">*</span>
            </Label>
            <Input
              id="brand-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
              placeholder="Ej: Nike, Apple, Samsung..."
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="brand-description">Descripción (Opcional)</Label>
            <textarea
              id="brand-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Describe la marca..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createBrand.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createBrand.isPending ? "Guardando..." : "Crear Marca"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
