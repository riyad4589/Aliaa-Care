import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useOrders, useUpdateOrderStatus, useDeleteOrder, DbOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
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
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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

const statusConfig = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.")) {
      try {
        await deleteOrder.mutateAsync(id);
        toast({ title: "Commande supprimée" });
      } catch (err) {
        toast({ title: "Erreur", description: "Impossible de supprimer la commande", variant: "destructive" });
      }
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search)
  );

  const handleStatusChange = async (orderId: string, newStatus: DbOrder['status']) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
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
        </div>

        <div className="relative max-w-sm">
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

        {/* Desktop Table */}
        <div className="border border-border rounded-lg overflow-hidden hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
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
                return (
                  <tr key={order.id} className="border-t border-border hover:bg-muted/20 transition-colors">
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
                        className="text-destructive"
                        onClick={() => handleDelete(order.id)}
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
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} className="gap-2">
                      <Eye className="w-4 h-4" /> Détails
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(order.id)}>
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
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>Fermer</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
