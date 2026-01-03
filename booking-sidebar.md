"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Booking, Client as BookingClient, Employee, Service, PaymentMethod } from "@/entities/booking";
import { ServiceForm, createService } from "@/features/dashboard/administration/services-management";
import { EmployeeForm, createEmployee } from "@/features/dashboard/administration/employees-management";
import { addServiceToBranch } from "@/features/dashboard/administration/branches-management/api/branches-actions";
import { CreateClientModal } from "@/features/dashboard/clients/create-client-modal";
import { getCustomers, createCustomer } from "@/features/dashboard/clients/api/clients-actions";
import type { CreateServiceData } from "@/entities/service";
import type { CreateEmployeeData } from "@/entities/employee";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { WORK_START_HOUR, WORK_END_HOUR, SLOT_INTERVAL } from "../model/use-agenda";
import {
  Banknote,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  QrCode,
} from "lucide-react";
import { useEmployeesByService } from "@/features/booking/model/use-booking-data";
import { ComboBoxClient } from "@/shared/ui/combo-box-client";
import { ComboBoxServices } from "@/shared/ui/combo-box-services";
import { ComboBoxEmployee } from "@/shared/ui/combo-box-employee";

interface BookingSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: BookingClient[]
  services: Service[]
  employees: Employee[]
  onSave: (booking: Partial<Booking>) => void
  onServiceCreated?: (service: Service) => void
  businessId: string
  locationId?: string
}

export function BookingSidebar({
  open,
  onOpenChange,
  clients,
  services,
  employees,
  onSave,
  onServiceCreated,
  businessId,
  locationId,
}: BookingSidebarProps) {
  const [isInBranch, setIsInBranch] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [clientSearchOpen, setClientSearchOpen] = useState(false)
  const [serviceSearchOpen, setServiceSearchOpen] = useState(false)
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [clientResults, setClientResults] = useState<BookingClient[]>([])
  const [serviceResults, setServiceResults] = useState<Service[]>([])
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isUpdatingEmployeesForService, setIsUpdatingEmployeesForService] = useState(false)

  // Estados para modales de creación
  const [showClientModal, setShowClientModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [isCreatingService, setIsCreatingService] = useState(false)
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false)
  const [prefilledClientName, setPrefilledClientName] = useState("")
  const [prefilledServiceName, setPrefilledServiceName] = useState("")
  const [prefilledEmployeeName, setPrefilledEmployeeName] = useState("")
  const [createdClient, setCreatedClient] = useState<BookingClient | null>(null)

  // Funciones para cerrar todos los dropdowns excepto uno específico
  const closeAllDropdownsExcept = (keepOpen: 'client' | 'service' | 'employee' | 'none') => {
    if (keepOpen !== 'client') setClientSearchOpen(false)
    if (keepOpen !== 'service') setServiceSearchOpen(false)
    if (keepOpen !== 'employee') setEmployeeSearchOpen(false)
  }
  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    employeeId: "",
    time: "",
    status: "confirmed" as const,
    paymentMethod: "cash",
    paymentStatus: "pending",
    details: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  // Búsqueda de clientes desde Supabase
  useEffect(() => {
    const searchClients = async () => {
      if (!clientSearch.trim()) {
        setClientResults([])
        return
      }

      setIsLoadingClients(true)
      try {
        const result = await getCustomers(businessId)
        if (result.data) {
          // Filtrar clientes por nombre o teléfono
          const filteredClients = result.data
            .filter(client => 
              client.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
              client.phone.includes(clientSearch)
            )
            .map(client => ({
              id: client.id.toString(),
              name: client.fullName,
              phone: client.phone || '',
              email: client.email || '',
              avatar: '',
              totalVisits: client.servicesCount || 0,
              totalSpent: 0
            }))
          setClientResults(filteredClients)
        }
      } catch (error) {
        console.error("Error searching clients:", error)
        setClientResults([])
      } finally {
        setIsLoadingClients(false)
      }
    }

    const timeoutId = setTimeout(searchClients, 300)
    return () => clearTimeout(timeoutId)
  }, [clientSearch, businessId])

  // Búsqueda de servicios usando getServices consistente
  useEffect(() => {
    const searchServices = async () => {
      if (!serviceSearch.trim()) {
        setServiceResults([])
        return
      }

      setIsLoadingServices(true)
      try {
        // Importar dinámicamente la función getServices del booking
        const { getServices } = await import("@/features/booking/api/booking-actions")
        const services = await getServices({ 
          businessId, 
          locationId,
          search: serviceSearch 
        })
        
        if (services && services.length > 0) {
          // Convertir los servicios de booking al formato de UI
          const adaptedServices = services.map((service: any) => ({
            id: service.id,
            name: service.name,
            duration: service.duration,
            price: service.price,
            color: '#3B82F6', // Color por defecto azul
            category: service.category || undefined,
            description: service.description,
            isActive: service.enabled !== false
          }))
          setServiceResults(adaptedServices)
        } else {
          setServiceResults([])
        }
      } catch (error) {
        console.error("Error searching services:", error)
      } finally {
        setIsLoadingServices(false)
      }
    }

    const timeoutId = setTimeout(searchServices, 300)
    return () => clearTimeout(timeoutId)
  }, [serviceSearch, businessId])

  // Búsqueda de empleados usando getEmployees consistente
  useEffect(() => {
    const searchEmployees = async () => {
      if (!employeeSearch.trim()) {
        setEmployeeResults([])
        return
      }

      setIsLoadingEmployees(true)
      try {
        // Importar dinámicamente la función getEmployees del booking
        const { getEmployees } = await import("@/features/booking/api/booking-actions")
        const employees = await getEmployees({ 
          businessId, 
          locationId,
          search: employeeSearch 
        })
        
        if (employees && employees.length > 0) {
          // Convertir los empleados de booking al formato de UI
          const adaptedEmployees = employees.map((employee: any) => ({
            id: employee.id,
            name: employee.info?.nombre && employee.info?.apellido 
              ? `${employee.info.nombre} ${employee.info.apellido}`
              : employee.username || 'Sin nombre',
            role: employee.role || 'employee',
            avatar: employee.info?.foto || employee.avatar,
            isActive: employee.enabled !== false,
            email: employee.email || '',
            phone: employee.phone || '',
            specialties: employee.specialties || [],
          }))
          
          setEmployeeResults(adaptedEmployees)
        } else {
          setEmployeeResults([])
        }
      } catch (error) {
        console.error("Error searching employees:", error)
      } finally {
        setIsLoadingEmployees(false)
      }
    }

    const timeoutId = setTimeout(searchEmployees, 300)
    return () => clearTimeout(timeoutId)
  }, [employeeSearch, businessId, locationId])


  const displayedClients = clientSearch.trim() ? clientResults : clients
  const displayedServices = serviceSearch.trim() ? serviceResults : services
  // Esta línea se reemplaza por finalDisplayedEmployees más abajo

  // Buscar en todas las fuentes: cliente creado localmente, lista original y resultados de búsqueda
  const selectedClient = (createdClient && createdClient.id === formData.clientId) ? createdClient :
                         clients.find((c) => c.id === formData.clientId) || 
                         clientResults.find((c) => c.id === formData.clientId)
  const selectedService = services.find((s) => s.id === formData.serviceId) || 
                         serviceResults.find((s) => s.id === formData.serviceId)

  // Hook para cargar empleados filtrados por servicio
  const {
    employees: serviceEmployees,
    loading: loadingServiceEmployees,
    error: serviceEmployeesError,
  } = useEmployeesByService({
    serviceId: selectedService?.id || null,
    locationId,
    businessId,
    search: employeeSearch.trim() || undefined,
    date: selectedDate,
    time: formData.time || undefined,
  });

  // Limpiar empleado seleccionado cuando cambia el servicio
  useEffect(() => {
    if (selectedService && formData.employeeId) {
      setFormData(prev => ({ ...prev, employeeId: "" }))
    }
  }, [selectedService?.id])

  // Convertir empleados de servicio al formato de UI
  const adaptedServiceEmployees = useMemo(() => {
    return serviceEmployees.map((employee) => ({
      id: employee.id,
      name: employee.info?.nombre && employee.info?.apellido 
        ? `${employee.info.nombre} ${employee.info.apellido}`
        : employee.username || 'Sin nombre',
      role: 'employee',
      avatar: employee.info?.foto || '',
      isActive: true, // Los empleados de la query ya están filtrados por enabled = true
      email: employee.info?.email || '',
      phone: employee.info?.phone || '',
      specialties: [],
    }));
  }, [serviceEmployees]);

  // Usar empleados filtrados por servicio cuando hay servicio seleccionado
  const finalDisplayedEmployees = selectedService 
    ? adaptedServiceEmployees  // Siempre usar empleados del servicio cuando hay servicio seleccionado
    : (employeeSearch.trim() ? employeeResults : employees);

  // Combinar estados de loading
  const isLoadingAnyEmployees = isLoadingEmployees || loadingServiceEmployees;

  const selectedEmployee = employees.find((e) => e.id === formData.employeeId) || 
                          employeeResults.find((e) => e.id === formData.employeeId) ||
                          adaptedServiceEmployees.find((e) => e.id === formData.employeeId)

  const canSave = useMemo(() => {
    return !!(formData.clientId && formData.serviceId && formData.employeeId && selectedDate && formData.time)
  }, [formData, selectedDate])

  // Generar horas basándose en la configuración del calendario
  const times = useMemo(() => {
    const list: string[] = []
    
    
    for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
      list.push(`${String(h).padStart(2, "0")}:00`)
      
      // Agregar intervalos según SLOT_INTERVAL
      if (SLOT_INTERVAL <= 30) {
        list.push(`${String(h).padStart(2, "0")}:30`)
      }
      if (SLOT_INTERVAL <= 15) {
        list.push(`${String(h).padStart(2, "0")}:15`)
        // No agregar :45, solo :15 y :30, luego pasa a la siguiente hora
      }
    }
    
    // Agregar la última hora completa
    list.push(`${String(WORK_END_HOUR).padStart(2, "0")}:00`)
    
    return list
  }, [])

  // Función para calcular la siguiente hora disponible basada en la hora actual
  const getNextAvailableTime = useMemo(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    
    // Si estamos fuera del horario de trabajo, usar la primera hora disponible
    if (currentHour < WORK_START_HOUR) {
      return times[0] || `${String(WORK_START_HOUR).padStart(2, "0")}:00`
    }
    
    if (currentHour >= WORK_END_HOUR) {
      return times[0] || `${String(WORK_START_HOUR).padStart(2, "0")}:00`
    }
    
    // Calcular la siguiente hora basada en SLOT_INTERVAL
    let nextHour = currentHour
    let nextMinute = 0
    
    // if (SLOT_INTERVAL === 60) {
    //   // Intervalos de 1 hora: siguiente hora completa
    //   nextHour = currentHour + 1
    //   nextMinute = 0
    // } else 
      if (SLOT_INTERVAL === 30) {
      // Intervalos de 30 min: siguiente slot de 30 min
      if (currentMinute < 30) {
        nextMinute = 30
      } else {
        nextHour = currentHour + 1
        nextMinute = 0
      }
    } else if (SLOT_INTERVAL === 15) {
      // Intervalos de 15 min: 15, 30, luego siguiente hora
      if (currentMinute < 15) {
        nextMinute = 15
      } else if (currentMinute < 30) {
        nextMinute = 30
      } else {
        // Si es >= 30, ir a la siguiente hora
        nextHour = currentHour + 1
        nextMinute = 0
      }
    }
    
    // Formatear como string HH:MM
    const timeString = `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`
    
    
    // Verificar si la hora está dentro del rango de horarios disponibles
    if (times.includes(timeString)) {
      return timeString
    }
    
    // Si no está disponible, buscar la siguiente hora disponible en la lista
    const currentTimeInMinutes = nextHour * 60 + nextMinute
    
    for (const time of times) {
      const [hour, minute] = time.split(":").map(Number)
      const timeInMinutes = hour * 60 + minute
      
      if (timeInMinutes >= currentTimeInMinutes) {
        return time
      }
    }
    
    // Si no hay horas disponibles hoy, retornar la primera hora del día
    return times[0] || `${String(WORK_START_HOUR).padStart(2, "0")}:00`
  }, [times])

  // Auto-rellenar la siguiente hora disponible cuando cambia la fecha o se monta el componente
  useEffect(() => {
    
    // Solo auto-rellenar si no hay una hora seleccionada
    if (!formData.time) {
      const today = new Date()
      const isToday = selectedDate.toDateString() === today.toDateString()
      
      
      if (isToday) {
        // Para fecha de hoy, usar la siguiente hora disponible basada en la hora actual
        const nextTime = getNextAvailableTime
        setFormData(prev => ({ ...prev, time: nextTime }))
      } else {
        // Para fechas futuras, usar la primera hora disponible
        const firstTime = times[0] || `${String(WORK_START_HOUR).padStart(2, "0")}:00`
        setFormData(prev => ({ ...prev, time: firstTime }))
      }
    }
  }, [selectedDate, formData.time, getNextAvailableTime, times])

  // Cerrar dropdowns cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-autocomplete]')) {
        closeAllDropdownsExcept('none')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Funciones para crear servicio
  const handleCreateService = async (serviceData: CreateServiceData) => {
    if (!businessId) {
      toast.error("Error: No se pudo obtener el ID del negocio")
      return
    }

    setIsCreatingService(true)
    try {
      const result = await createService(serviceData, businessId)
      
      if (result.error) {
        toast.error(`Error al crear servicio: ${result.error}`)
        return
      }

      if (result.data) {
        // Convertir el servicio creado al formato esperado por booking
        const newService: Service = {
          id: result.data.id,
          name: result.data.name,
          duration: result.data.duration,
          price: typeof result.data.price === 'object' ? result.data.price.value : result.data.price,
          color: '#3B82F6',
          category: result.data.category || undefined,
          description: result.data.description,
          isActive: true
        }

        // Agregar a la lista de servicios y seleccionarlo
        setServiceResults(prev => [newService, ...prev])
        
        // Notificar al componente padre sobre el servicio creado
        if (onServiceCreated) {
          onServiceCreated(newService);
        }
        
        // Autoseleccionar el servicio recién creado
        setFormData(prev => ({ ...prev, serviceId: newService.id, employeeId: "" }))
        // Limpiar selección de empleado al seleccionar nuevo servicio
        setEmployeeSearch("")
        setEmployeeSearchOpen(false)
        // El servicio se selecciona automáticamente pero no se pone en el campo de búsqueda
        setShowServiceModal(false)
        
        // Si hay una sucursal seleccionada, agregar el servicio a esa sucursal
        if (locationId) {
          try {
            const branchResult = await addServiceToBranch(locationId, result.data.id)
            if (branchResult.error) {
              console.warn('Error al agregar servicio a la sucursal:', branchResult.error)
              // No mostramos error al usuario porque el servicio sí se creó
            }
          } catch (error) {
            console.warn('Error al agregar servicio a la sucursal:', error)
            // No mostramos error al usuario porque el servicio sí se creó
          }
        }
        
        toast.success("Servicio creado exitosamente")
      }
    } catch (error) {
      console.error('Error creating service:', error)
      toast.error("Error inesperado al crear el servicio")
    } finally {
      setIsCreatingService(false)
    }
  }

  // Funciones para crear empleado
  const handleCreateEmployee = async (employeeData: CreateEmployeeData) => {
    if (!businessId) {
      toast.error("Error: No se pudo obtener el ID del negocio")
      return
    }

    setIsCreatingEmployee(true)
    try {
      const result = await createEmployee(employeeData, businessId)
      
      if (result.error) {
        toast.error(`Error al crear empleado: ${result.error}`)
        return
      }

      if (result.data) {
        // Convertir el empleado creado al formato esperado por booking
        const newEmployee: Employee = {
          id: result.data.id,
          name: result.data.info?.nombre && result.data.info?.apellido
            ? `${result.data.info.nombre} ${result.data.info.apellido}`
            : result.data.username,
          role: 'employee',
          avatar: result.data.info?.foto,
          isActive: true,
          email: '',
          phone: '',
          specialties: [],
        }

        // Agregar a la lista de empleados y seleccionarlo
        setEmployeeResults(prev => [newEmployee, ...prev])
        setFormData(prev => ({ ...prev, employeeId: newEmployee.id }))
        // El empleado se selecciona automáticamente pero no se pone en el campo de búsqueda
        setShowEmployeeModal(false)
        
        toast.success("Colaborador creado exitosamente")
      }
    } catch (error) {
      console.error('Error creating employee:', error)
      toast.error("Error inesperado al crear el colaborador")
    } finally {
      setIsCreatingEmployee(false)
    }
  }

  // Función para crear cliente
  const handleCreateClient = async (clientData: { name: string; countryCode: string; phone: string }) => {
    if (!businessId) {
      toast.error("Error: No se pudo obtener el ID del negocio")
      return
    }

    setIsCreatingClient(true)
    try {
      const fullPhone = clientData.phone ? `${clientData.countryCode}-${clientData.phone}` : ''
      
      const result = await createCustomer({
        name: clientData.name,
        phone: fullPhone
      }, businessId)
      if (result.error) {
        toast.error(`Error al crear cliente: ${result.error}`)
        return
      }

      if (result.data) {
        // Usar el nombre que escribió el usuario para evitar problemas de sincronización
        const newClient: BookingClient = {
          id: result.data.id.toString(),
          name: clientData.name, // Usar el nombre del formulario, no el de la respuesta
          phone: result.data.phone || '',
          email: result.data.email || '',
          avatar: '',
          totalVisits: 0,
          totalSpent: 0
        }

        // Agregar a la lista de clientes de búsqueda y a la lista principal
        setClientResults(prev => [newClient, ...prev])
        
        // Guardar el cliente creado localmente para que selectedClient funcione correctamente
        setCreatedClient(newClient)
        
        // Autoseleccionar el cliente recién creado
        setFormData(prev => ({ ...prev, clientId: newClient.id }))
        
        // Limpiar búsqueda y cerrar modal
        setClientSearch("")
        setShowClientModal(false)
        setPrefilledClientName("")
        closeAllDropdownsExcept('none')
        
        toast.success("Cliente creado exitosamente")
      }
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error("Error inesperado al crear el cliente")
    } finally {
      setIsCreatingClient(false)
    }
  }

  const handleSaveClick = () => {
    if (!canSave || !selectedService || !selectedClient) return

    void handleConfirmSave()
  }

  const handleConfirmSave = async () => {
    if (!selectedService || !selectedClient) return

    // Determinar el estado basado en el precio dinámico del servicio
    const servicePrice = selectedService.price
    const isDynamicPrice = typeof servicePrice === 'object' && servicePrice.dynamic
    const bookingStatus = isDynamicPrice ? "pending" : "confirmed"
    const finalPrice = typeof servicePrice === 'object' ? servicePrice.value : servicePrice

    // Mapear método de pago a valores de PaymentMethod (no BD)
    const mapToPaymentMethod = (method: string): PaymentMethod => {
      const methodMap: { [key: string]: PaymentMethod } = {
        'cash': 'cash',
        'qr': 'transfer', // qr se mapea a transfer en PaymentMethod
        'card': 'card'
      }
      return methodMap[method] || 'cash'
    }

    const bookingPayload: Partial<Booking> = {
      clientId: formData.clientId,
      clientName: selectedClient.name,
      serviceId: formData.serviceId,
      serviceName: selectedService.name,
      serviceColor: selectedService.color,
      employeeId: formData.employeeId,
      date: selectedDate,
      startTime: formData.time,
      duration: selectedService.duration,
      status: bookingStatus,
      price: finalPrice,
      paymentMethod: mapToPaymentMethod(formData.paymentMethod),
      isInBranch,
    }
    try {
      setIsSaving(true)
      const res = onSave(bookingPayload) as unknown
      if (res && typeof (res as any).then === "function") {
        await (res as Promise<any>)
      }
      
      // Resetear todos los campos después de guardar exitosamente
      setFormData({
        clientId: "",
        serviceId: "",
        employeeId: "",
        time: "",
        status: "confirmed" as const,
        paymentMethod: "cash",
        paymentStatus: "pending",
        details: "",
      })
      
      // Resetear campos de búsqueda
      setClientSearch("")
      setServiceSearch("")
      setEmployeeSearch("")
      
      // Cerrar todos los dropdowns
      closeAllDropdownsExcept('none')
      
      // Limpiar cliente creado localmente
      setCreatedClient(null)
      
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <aside
      className={cn(
        "relative flex h-full flex-col transition-all duration-300 ease-in-out",
        open ? "w-[380px]" : "w-14",
      )}
    >
      <button
        aria-label={open ? "Ocultar sidebar" : "Mostrar sidebar"}
        onClick={() => onOpenChange(!open)}
        className={cn(
          "absolute top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background shadow-sm transition-all hover:bg-accent hover:text-accent-foreground",
          open ? "right-4" : "right-2",
        )}
      >
        {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <div
        className={cn(
          "flex h-full flex-col rounded-xl border bg-card shadow-sm transition-all duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="border-b px-6 py-3">
          <h2 className="text-xl font-semibold tracking-tight">Nueva Reserva</h2>
          <p className="text-sm text-muted-foreground mt-1">Completa los datos para agendar una cita</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3">
          <div className="space-y-4" aria-busy={isSaving}>
            <ComboBoxClient
              selectedClient={selectedClient}
              clientSearch={clientSearch}
              clientSearchOpen={clientSearchOpen}
              displayedClients={displayedClients}
              isLoadingClients={isLoadingClients}
              isSaving={isSaving}
              formData={formData}
              setClientSearch={setClientSearch}
              setClientSearchOpen={setClientSearchOpen}
              setFormData={setFormData}
              setCreatedClient={setCreatedClient}
              setPrefilledClientName={setPrefilledClientName}
              setShowClientModal={setShowClientModal}
              closeAllDropdownsExcept={closeAllDropdownsExcept}
            />

            <ComboBoxServices
              selectedService={selectedService}
              serviceSearch={serviceSearch}
              serviceSearchOpen={serviceSearchOpen}
              displayedServices={displayedServices}
              isLoadingServices={isLoadingServices}
              isSaving={isSaving}
              formData={formData}
              setServiceSearch={setServiceSearch}
              setServiceSearchOpen={setServiceSearchOpen}
              setFormData={setFormData}
              setEmployeeSearch={setEmployeeSearch}
              setEmployeeSearchOpen={setEmployeeSearchOpen}
              setPrefilledServiceName={setPrefilledServiceName}
              setShowServiceModal={setShowServiceModal}
              closeAllDropdownsExcept={closeAllDropdownsExcept}
            />

            <ComboBoxEmployee
              selectedEmployee={selectedEmployee}
              selectedService={selectedService}
              employeeSearch={employeeSearch}
              employeeSearchOpen={employeeSearchOpen}
              finalDisplayedEmployees={finalDisplayedEmployees}
              isLoadingAnyEmployees={isLoadingAnyEmployees}
              isUpdatingEmployeesForService={isUpdatingEmployeesForService}
              isSaving={isSaving}
              formData={formData}
              setEmployeeSearch={setEmployeeSearch}
              setEmployeeSearchOpen={setEmployeeSearchOpen}
              setFormData={setFormData}
              setPrefilledEmployeeName={setPrefilledEmployeeName}
              setShowEmployeeModal={setShowEmployeeModal}
              closeAllDropdownsExcept={closeAllDropdownsExcept}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 w-full justify-start text-left font-normal hover:bg-accent bg-transparent"
                      disabled={isSaving}
                    >
                      {selectedDate ? (
                        <span>{format(selectedDate, "P", { locale: es })}</span>
                      ) : (
                        <span className="text-muted-foreground">Elegir fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => d && setSelectedDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Hora <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.time}
                  onValueChange={(v) => setFormData({ ...formData, time: v, employeeId: "" })}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="08:00" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {times.map((t) => (
                      <SelectItem key={t} value={t}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {t}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Método de Pago
                </Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        <span>Efectivo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="qr">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        <span>QR</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Tarjeta</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Notas Adicionales
              </Label>
              <Input
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Agregar observaciones o comentarios..."
                disabled={isSaving}
                className="h-11"
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-3">
          <Button
            className="h-12 w-full text-base font-semibold shadow-sm bg-glow-purple text-glow-foreground hover:bg-glow/90 text-white"
            onClick={handleSaveClick}
            disabled={!canSave || isSaving}
            size="lg"
          >
            {isSaving ? (
              <>
                <svg
                  className="mr-2 h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Creando Reserva...
              </>
            ) : (
              <>
                <CalendarIcon className="mr-2 h-5 w-5" />
                Crear Reserva
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal para crear servicio */}
      <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Servicio</DialogTitle>
          </DialogHeader>
          <ServiceForm
            service={prefilledServiceName ? { name: prefilledServiceName } as any : undefined}
            onSave={handleCreateService}
            onClose={() => {
              setShowServiceModal(false)
              setPrefilledServiceName("")
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para crear empleado */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Colaborador</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={prefilledEmployeeName ? { 
              info: { nombre: prefilledEmployeeName },
              location_id: locationId || "" // Preseleccionar la sucursal actual
            } as any : locationId ? {
              location_id: locationId // Si no hay nombre pero sí locationId, solo pasar la sucursal
            } as any : undefined}
            onSave={handleCreateEmployee}
            onClose={() => {
              setShowEmployeeModal(false)
              setPrefilledEmployeeName("")
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para crear cliente */}
      <CreateClientModal
        open={showClientModal}
        onOpenChange={(open) => {
          setShowClientModal(open)
          if (!open) {
            setPrefilledClientName("")
          }
        }}
        onSave={handleCreateClient}
        isCreating={isCreatingClient}
        initialName={prefilledClientName}
      />
    </aside>
  )
}
