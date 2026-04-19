
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  Clock
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const confirmedOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = confirmedOrders.reduce((acc, o) => acc + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  


  // Top products (most sold in confirmed orders)
  const productSales: Record<string, number> = {};
  confirmedOrders.forEach(o => {
    o.items.forEach(item => {
      if (item.product_name) {
        productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity;
      }
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const lowStockProducts = products.filter(p => p.stock < 5 && p.active);

  const stats = [
    { 
      title: "Chiffre d'Affaires", 
      value: `${totalRevenue.toLocaleString()} DH`, 
      icon: TrendingUp, 
      trend: "+12.5%", 
      trendUp: true,
      description: "Revenus totaux confirmés"
    },
    { 
      title: "Commandes", 
      value: orders.length, 
      icon: ShoppingCart, 
      trend: "+5.2%", 
      trendUp: true,
      description: "Total des commandes passées"
    },
    { 
      title: "Panier Moyen", 
      value: `${Math.round(avgOrderValue)} DH`, 
      icon: Users, 
      trend: "-2.1%", 
      trendUp: false,
      description: "Valeur moyenne par commande"
    },
    { 
      title: "Produits Actifs", 
      value: products.filter(p => p.active).length, 
      icon: Package, 
      trend: "+3", 
      trendUp: true,
      description: "Catalogue en ligne"
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-600 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground">Bienvenue dans votre espace d'administration Aliaa-Care.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold">{stat.value}</h2>
                  <span className={`flex items-center text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">


          {/* Top Products */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Produits les plus vendus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topProducts.length > 0 ? topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000" 
                            style={{ width: `${(product.sales / (topProducts[0]?.sales || 1)) * 100}%` }} 
                          />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{product.sales} ventes</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">Pas encore de données de vente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Dernières Commandes</CardTitle>
              <Badge variant="outline" className="font-normal">{orders.slice(0, 5).length} récentes</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-mono text-xs font-bold text-primary">
                        #{order.order_number.slice(-3)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{order.customer_name}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{order.total} DH</p>
                      <Badge variant="outline" className={`text-[10px] h-5 px-1.5 mt-1 border-none ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Alertes Stock
              </CardTitle>
              {lowStockProducts.length > 0 && (
                <Badge variant="destructive" className="font-normal">{lowStockProducts.length} alertes</Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-orange-500/20 bg-orange-500/5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg border border-border overflow-hidden bg-background">
                        <img src={p.images[0] || "/placeholder.svg"} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-orange-600 font-medium">Stock critique: {p.stock}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-200">
                      Rupture proche
                    </Badge>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm">Tous les stocks sont à jour</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default AdminDashboard;

