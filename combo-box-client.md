import React from "react";
import { User, X, Plus, Loader2 } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

interface ComboBoxClientProps {
  selectedClient: any;
  clientSearch: string;
  clientSearchOpen: boolean;
  displayedClients: any[];
  isLoadingClients: boolean;
  isSaving: boolean;
  formData: any;
  setClientSearch: (value: string) => void;
  setClientSearchOpen: (open: boolean) => void;
  setFormData: (data: any) => void;
  setCreatedClient: (client: any) => void;
  setPrefilledClientName: (name: string) => void;
  setShowClientModal: (show: boolean) => void;
  closeAllDropdownsExcept: (type: "client" | "service" | "employee" | "none") => void;
}

export function ComboBoxClient({
  selectedClient,
  clientSearch,
  clientSearchOpen,
  displayedClients,
  isLoadingClients,
  isSaving,
  formData,
  setClientSearch,
  setClientSearchOpen,
  setFormData,
  setCreatedClient,
  setPrefilledClientName,
  setShowClientModal,
  closeAllDropdownsExcept,
}: ComboBoxClientProps) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor="client" className="flex items-center gap-2 text-sm font-medium">
        <User className="h-4 w-4 text-muted-foreground" />
        Cliente <span className="text-destructive">*</span>
      </Label>
      <div className="relative" data-autocomplete>
        <div className="relative">
          <Input
            id="client"
            placeholder="Buscar cliente por nombre o teléfono..."
            value={selectedClient ? selectedClient.name : clientSearch}
            autoComplete="off"
            onChange={(e) => {
              if (!selectedClient) {
                setClientSearch(e.target.value)
                closeAllDropdownsExcept('client')
                setClientSearchOpen(true)
              }
            }}
            onFocus={() => {
              if (!selectedClient) {
                closeAllDropdownsExcept('client')
                setClientSearchOpen(true)
              }
            }}
            className="h-10 pr-16"
            disabled={isSaving}
          />
          {selectedClient ? (
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, clientId: "" })
                setClientSearch("")
                setClientSearchOpen(false)
                setCreatedClient(null) // Limpiar cliente creado localmente
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : isLoadingClients ? (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </div>
        
        {clientSearchOpen && !selectedClient && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Opción de crear nuevo cliente */}
            <div
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-accent focus:bg-accent transition-colors border-b"
              onClick={() => {
                setClientSearchOpen(false)
                setPrefilledClientName(clientSearch.trim())
                setShowClientModal(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2 text-primary" />
              <span className="text-primary font-medium">Crear nuevo cliente</span>
            </div>

            {isLoadingClients ? (
              <div className="py-8 text-center">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                  <span className="text-sm text-muted-foreground">Buscando cliente...</span>
                </div>
              </div>
            ) : (!isLoadingClients && displayedClients.length === 0 && clientSearch.trim()) ? (
              <div className="py-8 text-center">
                <User className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Cliente no encontrado</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Intenta con otro nombre o teléfono</p>
              </div>
            ) : displayedClients.length > 0 ? (
              displayedClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setFormData({ ...formData, clientId: client.id })
                    setClientSearchOpen(false)
                    setClientSearch("")
                  }}
                  className="flex items-center gap-3 cursor-pointer py-2 px-3 hover:bg-accent transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">{client.name}</span>
                    {client.phone && (
                      <span className="text-xs text-muted-foreground truncate">{client.phone}</span>
                    )}
                  </div>
                </div>
              ))
            ) : displayedClients.length === 0 && !clientSearch.trim() ? (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">Escribe para buscar clientes</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}