import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, DollarSign, BarChart3, Download, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminFinances = () => {
  const { data: orders = [], isLoading } = useOrders();
  const { data: products = [] } = useProducts();
  const { toast } = useToast();
  const [chartPeriod, setChartPeriod] = useState("30");

  const getRevenue = (period: "day" | "month" | "year") => {
    const now = new Date();
    const start = new Date();
    if (period === "day") start.setHours(0, 0, 0, 0);
    else if (period === "month") { start.setDate(1); start.setHours(0, 0, 0, 0); }
    else { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
    return orders.filter((o) => new Date(o.created_at) >= start && new Date(o.created_at) <= now).reduce((s, o) => s + o.total, 0);
  };

  const getRevenueByDay = (days: number) => {
    const result: { date: string; revenue: number; cost: number; profit: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const dayOrders = orders.filter((o) => o.created_at.startsWith(key));
      const revenue = dayOrders.reduce((s, o) => s + o.total, 0);
      const cost = dayOrders.reduce((s, o) => s + o.total_cost, 0);
      result.push({ date: key, revenue, cost, profit: revenue - cost });
    }
    return result;
  };

  const getMarginByProduct = () => {
    const map = new Map<string, { productName: string; revenue: number; cost: number }>();
    orders.forEach((o) =>
      o.items.forEach((item) => {
        const existing = map.get(item.product_name) || { productName: item.product_name, revenue: 0, cost: 0 };
        existing.revenue += item.unit_price * item.quantity;
        existing.cost += item.cost_price * item.quantity;
        map.set(item.product_name, existing);
      })
    );
    return Array.from(map.entries()).map(([_, data]) => ({
      ...data,
      margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0,
    }));
  };

  const dayRevenue = getRevenue("day");
  const monthRevenue = getRevenue("month");
  const yearRevenue = getRevenue("year");
  const chartData = getRevenueByDay(Number(chartPeriod));
  const margins = getMarginByProduct();

  const exportCSV = () => {
    const BOM = "\uFEFF";
    const separator = ";";
    const headers = ["Date", "Revenu (DH)", "Coût (DH)", "Profit (DH)", "Marge (%)"].join(separator);
    const rows = chartData.map((d) => {
      const margin = d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue * 100).toFixed(1) : "0.0";
      return [new Date(d.date).toLocaleDateString("fr-FR"), d.revenue.toLocaleString("fr-FR"), d.cost.toLocaleString("fr-FR"), d.profit.toLocaleString("fr-FR"), margin].join(separator);
    });
    const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
    const totalCost = chartData.reduce((s, d) => s + d.cost, 0);
    const totalProfit = chartData.reduce((s, d) => s + d.profit, 0);
    const totalMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1) : "0.0";
    const totalRow = ["TOTAL", totalRevenue.toLocaleString("fr-FR"), totalCost.toLocaleString("fr-FR"), totalProfit.toLocaleString("fr-FR"), totalMargin].join(separator);
    const content = BOM + [headers, ...rows, "", totalRow].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finances-aliaa-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exporté" });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ALIAA Natural Care", 14, 22);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Rapport Financier", 14, 30);
    doc.setFontSize(9);
    doc.text(`Généré le ${dateStr}`, 14, 36);
    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);
    doc.setTextColor(0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Résumé des Revenus", 14, 50);
    const summaryData = [
      ["Aujourd'hui", `${dayRevenue.toLocaleString("fr-FR")} DH`],
      ["Ce mois", `${monthRevenue.toLocaleString("fr-FR")} DH`],
      ["Cette année", `${yearRevenue.toLocaleString("fr-FR")} DH`],
      ["Commandes totales", `${orders.length}`],
    ];
    autoTable(doc, { startY: 54, head: [["Période", "Montant"]], body: summaryData, theme: "grid", headStyles: { fillColor: [74, 85, 67], fontSize: 10 }, styles: { fontSize: 10, cellPadding: 4 }, columnStyles: { 1: { halign: "right" } }, margin: { left: 14, right: 14 } });
    const tableEndY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Détail par jour (${chartPeriod} derniers jours)`, 14, tableEndY);
    const dayRows = chartData.filter((d) => d.revenue > 0 || d.cost > 0).map((d) => [new Date(d.date).toLocaleDateString("fr-FR"), `${d.revenue.toLocaleString("fr-FR")} DH`, `${d.cost.toLocaleString("fr-FR")} DH`, `${d.profit.toLocaleString("fr-FR")} DH`, d.revenue > 0 ? `${((d.profit / d.revenue) * 100).toFixed(1)}%` : "-"]);
    if (dayRows.length > 0) {
      autoTable(doc, { startY: tableEndY + 4, head: [["Date", "Revenu", "Coût", "Profit", "Marge"]], body: dayRows, theme: "striped", headStyles: { fillColor: [74, 85, 67], fontSize: 9 }, styles: { fontSize: 9, cellPadding: 3 }, columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } }, margin: { left: 14, right: 14 } });
    }
    const marginStartY = (doc as any).lastAutoTable.finalY + 12;
    if (marginStartY > 250) doc.addPage();
    const mY = marginStartY > 250 ? 20 : marginStartY;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Marges par Produit", 14, mY);
    if (margins.length > 0) {
      const marginRows = margins.map((m) => [m.productName, `${m.revenue.toLocaleString("fr-FR")} DH`, `${m.cost.toLocaleString("fr-FR")} DH`, `${(m.revenue - m.cost).toLocaleString("fr-FR")} DH`, `${m.margin.toFixed(1)}%`]);
      autoTable(doc, { startY: mY + 4, head: [["Produit", "Revenu", "Coût", "Profit", "Marge"]], body: marginRows, theme: "striped", headStyles: { fillColor: [74, 85, 67], fontSize: 9 }, styles: { fontSize: 9, cellPadding: 3 }, columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } }, margin: { left: 14, right: 14 } });
    }
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`ALIAA Natural Care - Confidentiel - Page ${i}/${pageCount}`, 14, 290);
    }
    doc.save(`rapport-aliaa-${now.toISOString().split("T")[0]}.pdf`);
    toast({ title: "Rapport PDF exporté" });
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
            <h1 className="font-serif text-xl sm:text-2xl text-foreground">Gestion Financière</h1>
            <p className="text-sm text-muted-foreground">{orders.length} commandes enregistrées</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 rounded-none flex-1 sm:flex-none">
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF} className="gap-2 rounded-none flex-1 sm:flex-none">
              <Download className="w-4 h-4" /> PDF
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
              {margins.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
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
