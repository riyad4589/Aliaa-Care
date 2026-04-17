import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useOrders, useUpdateOrderStatus, useDeleteOrder, useBulkDeleteOrders, useUpdateOrderDetails, DbOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  X, 
  Loader2, 
  ShoppingBag, 
  Eye, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  Trash2,
  AlertTriangle,
  Pencil,
  Plus,
  Minus,
  FileText,
  History,
  Circle,
  MessageSquare
} from "lucide-react";
import { generateInvoice } from "@/utils/invoiceGenerator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const statusConfig = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const bulkDeleteOrders = useBulkDeleteOrders();
  const updateOrderDetails = useUpdateOrderDetails();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<DbOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      if (isBulkDeleting) {
        await bulkDeleteOrders.mutateAsync(selectedOrderIds);
        toast({ title: `${selectedOrderIds.length} commandes supprimées` });
        setSelectedOrderIds([]);
        setIsBulkDeleting(false);
      } else if (orderToDelete) {
        await deleteOrder.mutateAsync(orderToDelete);
        toast({ title: "Commande supprimée" });
        setOrderToDelete(null);
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const total = editingOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      await updateOrderDetails.mutateAsync({
        id: editingOrder.id,
        updates: {
          customer_name: editingOrder.customer_name,
          customer_phone: editingOrder.customer_phone,
          customer_address: editingOrder.customer_address,
          customer_city: editingOrder.customer_city,
          notes: editingOrder.notes,
          total,
          status: editingOrder.status,
        },
        items: editingOrder.items,
      });
      toast({ title: "Commande mise à jour" });
      setEditingOrder(null);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la commande", variant: "destructive" });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openWhatsApp = (order: DbOrder) => {
    // Basic phone cleaning: remove non-digits, and handle Moroccan format
    let phone = order.customer_phone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "212" + phone.substring(1);
    } else if (!phone.startsWith("212") && phone.length === 9) {
      phone = "212" + phone;
    }
    
    const message = encodeURIComponent(`Bonjour ${order.customer_name}, c'est Aliaa Care concernant votre commande #${order.order_number}. `);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleStatusChange = async (orderId: string, newStatus: DbOrder['status']) => {
    const order = orders.find(o => o.id === orderId);
    try {
      await updateStatus.mutateAsync({ 
        id: orderId, 
        status: newStatus,
        currentHistory: order?.status_history || []
      });
      toast({ title: "Statut mis à jour", description: `La commande est maintenant ${statusConfig[newStatus].label.toLowerCase()}.` });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl text-foreground">Gestion des Commandes</h1>
            <p className="text-sm text-muted-foreground">{orders.length} commandes au total</p>
          </div>
          {selectedOrderIds.length > 0 && (
            <Button 
              variant="destructive" 
              className="gap-2 animate-in fade-in slide-in-from-right-2"
              onClick={() => setIsBulkDeleting(true)}
            >
              <Trash2 className="w-4 h-4" />
              Supprimer ({selectedOrderIds.length})
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:justify-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par N°, nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Table */}
        <div className="border border-border rounded-lg overflow-hidden hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 w-10">
                  <Checkbox 
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium">N° Commande</th>
                <th className="text-left p-4 font-medium">Client</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-right p-4 font-medium">Total</th>
                <th className="text-center p-4 font-medium">Statut</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const currentStatus = (order.status && statusConfig[order.status]) ? order.status : 'pending';
                const statusInfo = statusConfig[currentStatus];
                const StatusIcon = statusInfo.icon;
                const isSelected = selectedOrderIds.includes(order.id);
                return (
                  <tr key={order.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="p-4">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="p-4 font-mono font-medium text-primary">#{order.order_number}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{order.customer_name}</span>
                        <span className="text-xs text-muted-foreground">{order.customer_phone}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(order.created_at), "dd MMM yyyy", { locale: fr })}
                    </td>
                    <td className="p-4 text-right font-medium">{order.total.toLocaleString()} DH</td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color} transition-opacity hover:opacity-80`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusInfo.label}
                              <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-40">
                            {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => (
                              <DropdownMenuItem 
                                key={status}
                                onClick={() => handleStatusChange(order.id, status)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {status === currentStatus && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                {statusConfig[status].label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setSelectedOrder(order)}
                        title="Détails de la commande"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setEditingOrder(order)}
                        title="Modifier la commande"
                      >
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => openWhatsApp(order)}
                        title="Contacter sur WhatsApp"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-primary"
                        onClick={() => generateInvoice(order)}
                        title="Générer facture PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => setOrderToDelete(order.id)}
                        title="Supprimer la commande"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune commande trouvée</p>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredOrders.map((order) => {
            const currentStatus = (order.status && statusConfig[order.status]) ? order.status : 'pending';
            const statusInfo = statusConfig[currentStatus];
            const StatusIcon = statusInfo.icon;
            return (
              <div key={order.id} className="border border-border rounded-lg p-4 space-y-4 bg-card">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-mono font-medium text-primary text-sm">#{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => handleStatusChange(order.id, status)}
                          className="cursor-pointer"
                        >
                          {statusConfig[status].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-foreground">{order.customer_name}</span>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Phone className="w-3 h-3" />
                    {order.customer_phone}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-serif text-lg">{order.total.toLocaleString()} DH</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingOrder(order)} className="gap-2">
                      <Pencil className="w-4 h-4" /> Modifier
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} className="gap-2">
                      <Eye className="w-4 h-4" /> Détails
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openWhatsApp(order)} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      <WhatsAppIcon className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => generateInvoice(order)} className="text-primary">
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setOrderToDelete(order.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Détails de la Commande</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-8 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">#{selectedOrder.order_number}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      Passée le {format(new Date(selectedOrder.created_at), "PPP à HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                    statusConfig[selectedOrder.status && statusConfig[selectedOrder.status] ? selectedOrder.status : 'pending'].color
                  }`}>
                    {(() => {
                      const currentStatus = (selectedOrder.status && statusConfig[selectedOrder.status]) ? selectedOrder.status : 'pending';
                      const Icon = statusConfig[currentStatus].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                    {statusConfig[selectedOrder.status && statusConfig[selectedOrder.status] ? selectedOrder.status : 'pending'].label}
                  </div>
                </div>

                <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Informations Client</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="text-xs font-bold">{selectedOrder.customer_name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-sm">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground pl-1">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedOrder.customer_phone}
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground pl-1">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{selectedOrder.customer_address}, {selectedOrder.customer_city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Articles de la commande</p>
                <div className="border border-border rounded-lg divide-y divide-border">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center bg-card/50">
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x {item.unit_price} DH
                        </p>
                      </div>
                      <span className="font-medium text-sm">{(item.quantity * item.unit_price).toLocaleString()} DH</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suivi de la commande</p>
                </div>
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                  {/* Initial creation step */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary border-4 border-background" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Commande Reçue</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(selectedOrder.created_at), "PPP à HH:mm", { locale: fr })}
                      </span>
                    </div>
                  </div>

                  {/* History steps */}
                  {selectedOrder.status_history?.map((step, idx) => (
                    <div key={idx} className="relative animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary border-4 border-background" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{step.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(step.date), "PPP à HH:mm", { locale: fr })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* If no history yet and status is not pending, show current status as last step */}
                  {(!selectedOrder.status_history || selectedOrder.status_history.length === 0) && selectedOrder.status !== 'pending' && (
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary border-4 border-background" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{statusConfig[selectedOrder.status].label}</span>
                        <span className="text-xs text-muted-foreground">Statut actuel</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes de la commande</p>
                  <div className="bg-primary/5 p-4 rounded-lg text-sm italic text-foreground/80 border-l-2 border-primary">
                    "{selectedOrder.notes}"
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total de la commande</p>
                  <p className="text-3xl font-serif text-primary">{selectedOrder.total.toLocaleString()} DH</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50" onClick={() => openWhatsApp(selectedOrder)}>
                    <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => generateInvoice(selectedOrder)}>
                    <FileText className="w-4 h-4" /> Facture PDF
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>Fermer</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Modifier la Commande</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <form onSubmit={handleUpdateOrder} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du client</Label>
                  <Input 
                    value={editingOrder.customer_name} 
                    onChange={(e) => setEditingOrder({...editingOrder, customer_name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input 
                    value={editingOrder.customer_phone} 
                    onChange={(e) => setEditingOrder({...editingOrder, customer_phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input 
                    value={editingOrder.customer_city} 
                    onChange={(e) => setEditingOrder({...editingOrder, customer_city: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select 
                    value={editingOrder.status} 
                    onValueChange={(val: DbOrder['status']) => setEditingOrder({...editingOrder, status: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse complète</Label>
                <Textarea 
                  value={editingOrder.customer_address} 
                  onChange={(e) => setEditingOrder({...editingOrder, customer_address: e.target.value})} 
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Articles</p>
                <div className="space-y-3">
                  {editingOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 border border-border rounded-lg bg-muted/20">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">{item.unit_price} DH / unité</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8"
                          onClick={() => {
                            const newItems = [...editingOrder.items];
                            if (newItems[idx].quantity > 1) {
                              newItems[idx].quantity -= 1;
                              setEditingOrder({...editingOrder, items: newItems});
                            }
                          }}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8"
                          onClick={() => {
                            const newItems = [...editingOrder.items];
                            newItems[idx].quantity += 1;
                            setEditingOrder({...editingOrder, items: newItems});
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="w-20 text-right font-medium text-sm">
                        {item.quantity * item.unit_price} DH
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Interne)</Label>
                <Textarea 
                  value={editingOrder.notes || ""} 
                  onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})} 
                  placeholder="Notes sur la livraison, préférences client..."
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm">
                  <span className="text-muted-foreground">Total recalculé : </span>
                  <span className="font-bold text-lg text-primary">
                    {editingOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toLocaleString()} DH
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setEditingOrder(null)}>Annuler</Button>
                  <Button type="submit" className="px-8 bg-primary">Enregistrer les modifications</Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog 
        open={!!orderToDelete || isBulkDeleting} 
        onOpenChange={(open) => {
          if (!open) {
            setOrderToDelete(null);
            setIsBulkDeleting(false);
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl border-destructive/20">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="font-serif text-xl">
              {isBulkDeleting ? `Supprimer ${selectedOrderIds.length} commandes` : "Confirmer la suppression"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {isBulkDeleting 
                ? `Êtes-vous sûr de vouloir supprimer ces ${selectedOrderIds.length} commandes ?`
                : "Êtes-vous vraiment sûr de vouloir supprimer cette commande ?"
              } <br />
              <span className="font-semibold text-destructive mt-2 inline-block">Attention : Cette action est irréversible et supprimera toutes les données associées.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-none border-border hover:bg-muted">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-none bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8"
            >
              Supprimer {isBulkDeleting ? `(${selectedOrderIds.length})` : "définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminOrders;
