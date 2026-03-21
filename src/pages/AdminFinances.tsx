import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminStore } from "@/hooks/useAdminStore";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, DollarSign, BarChart3, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const AdminFinances = () => {
  const { getRevenue, getRevenueByDay, getMarginByProduct, orders } = useAdminStore();
  const { toast } = useToast();
  const [chartPeriod, setChartPeriod] = useState("30");

  const dayRevenue = getRevenue("day");
  const monthRevenue = getRevenue("month");
  const yearRevenue = getRevenue("year");
  const chartData = getRevenueByDay(Number(chartPeriod));
  const margins = getMarginByProduct();

  const exportCSV = () => {
    const headers = "Date,Revenu,Coût,Profit\n";
    const rows = chartData.map((d) => `${d.date},${d.revenue},${d.cost},${d.profit}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finances-aliaa-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exporté" });
  };

  const exportPDF = () => {
    const content = `ALIAA Natural Care - Rapport Financier\n${"=".repeat(40)}\n\nDate: ${new Date().toLocaleDateString("fr-FR")}\n\nRevenus:\n- Aujourd'hui: ${dayRevenue} DH\n- Ce mois: ${monthRevenue} DH\n- Cette année: ${yearRevenue} DH\n\nMarges par produit:\n${margins.map((m) => `- ${m.productName}: ${m.revenue} DH revenu, ${m.margin.toFixed(1)}% marge`).join("\n")}\n\nNombre total de commandes: ${orders.length}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-aliaa-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Rapport exporté" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-foreground">Gestion Financière</h1>
            <p className="text-sm text-muted-foreground">{orders.length} commandes enregistrées</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 rounded-none">
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF} className="gap-2 rounded-none">
              <Download className="w-4 h-4" /> Rapport
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl text-foreground">{dayRevenue} DH</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Ce Mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl text-foreground">{monthRevenue} DH</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Cette Année
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl text-foreground">{yearRevenue} DH</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-lg">Revenus & Profits</CardTitle>
            <Select value={chartPeriod} onValueChange={setChartPeriod}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                    formatter={(value: number, name: string) => [`${value} DH`, name === "revenue" ? "Revenu" : name === "profit" ? "Profit" : "Coût"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="revenue" />
                  <Bar dataKey="profit" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} name="profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Marges par Produit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {margins.map((m) => (
                <div key={m.productId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{m.productName}</p>
                    <p className="text-xs text-muted-foreground">Revenu: {m.revenue} DH · Coût: {m.cost} DH</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg">{m.margin.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">marge</p>
                  </div>
                </div>
              ))}
              {margins.length === 0 && (
                <p className="text-center text-muted-foreground py-6">Aucune donnée de vente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFinances;