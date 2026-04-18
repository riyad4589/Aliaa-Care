import { useState } from "react";

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
    const now = new Date();
    
    // Header Section
    const reportTitle = "ALIAA NATURAL CARE - RAPPORT FINANCIER";
    const generatedDate = `Généré le: ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR")}`;
    const periodStr = `Période: ${chartPeriod} derniers jours`;
    
    // Summary Metrics
    const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
    const totalCost = chartData.reduce((s, d) => s + d.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const totalOrders = orders.length;
    const totalMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1) : "0.0";

    const summaryHeaders = ["MÉTRIQUES GLOBALES", "VALEUR"].join(separator);
    const summaryRows = [
      ["Revenu Total", `${totalRevenue.toFixed(2).replace(".", ",")} DH`],
      ["Coût Total", `${totalCost.toFixed(2).replace(".", ",")} DH`],
      ["Profit Total", `${totalProfit.toFixed(2).replace(".", ",")} DH`],
      ["Marge Moyenne", `${totalMargin.replace(".", ",")}%`],
      ["Total Commandes", totalOrders]
    ].map(row => row.join(separator));

    // Daily Details
    const detailsHeaderTitle = "DÉTAILS QUOTIDIENS";
    const detailsHeaders = ["Date", "Commandes", "Revenu (DH)", "Coût (DH)", "Profit (DH)", "Marge (%)"].join(separator);
    
    const dayRows = chartData.filter(d => d.revenue > 0 || d.cost > 0).map((d) => {
      const dayOrdersCount = orders.filter(o => o.created_at.startsWith(d.date)).length;
      const margin = d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue * 100).toFixed(1) : "0.0";
      return [
        new Date(d.date).toLocaleDateString("fr-FR"), 
        dayOrdersCount,
        d.revenue.toFixed(2).replace(".", ","), 
        d.cost.toFixed(2).replace(".", ","), 
        d.profit.toFixed(2).replace(".", ","), 
        margin.replace(".", ",")
      ].join(separator);
    });

    const content = BOM + [
      reportTitle,
      generatedDate,
      periodStr,
      "",
      summaryHeaders,
      ...summaryRows,
      "",
      detailsHeaderTitle,
      detailsHeaders,
      ...dayRows
    ].join("\n");

    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-aliaa-${now.toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV stylisé exporté" });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const primaryColor = [74, 85, 67]; // Botanical Green
    const accentColor = [120, 135, 110]; // Lighter Green
    
    // Header background with full width
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 50, "F");
    
    // Logo text replacement or title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("ALIAA NATURAL CARE", 20, 25);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Performance & Bien-être . Rapport Financier", 20, 35);
    
    // Date & Period Info
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    doc.setFontSize(9);
    doc.text(`Généré le ${dateStr}`, 150, 35);
    doc.text(`Analyse sur ${chartPeriod} jours`, 150, 42);
    
    doc.setTextColor(0, 0, 0);
    
    // 1. Executive Summary
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("1. Résumé Exécutif", 20, 65);
    
    const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
    const totalCost = chartData.reduce((s, d) => s + d.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const globalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : "0";
    
    autoTable(doc, {
      startY: 70,
      head: [["MÉTRIQUES CLÉS", "RÉSULTATS"]],
      body: [
        ["Revenu Total Brut", `${totalRevenue.toLocaleString("fr-FR")} DH`],
        ["Coût des Ventes", `${totalCost.toLocaleString("fr-FR")} DH`],
        ["Bénéfice Net (Profit)", `${totalProfit.toLocaleString("fr-FR")} DH`],
        ["Marge Bénéficiaire", `${globalMargin}%`],
        ["Volume de Commandes", orders.length.toString()]
      ],
      theme: "striped",
      headStyles: { fillColor: primaryColor, fontSize: 11, cellPadding: 6 },
      styles: { fontSize: 11, cellPadding: 6, font: "helvetica" },
      columnStyles: { 1: { halign: "right", fontStyle: "bold", textColor: primaryColor } },
      margin: { left: 20, right: 20 }
    });
    
    // 2. Daily Analysis
    const table2Y = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("2. Analyse Quotidienne", 20, table2Y);
    
    const dayRows = chartData
      .filter((d) => d.revenue > 0 || d.cost > 0)
      .map((d) => [
        new Date(d.date).toLocaleDateString("fr-FR"), 
        `${d.revenue.toLocaleString("fr-FR")} DH`, 
        `${d.cost.toLocaleString("fr-FR")} DH`, 
        `${d.profit.toLocaleString("fr-FR")} DH`, 
        d.revenue > 0 ? `${((d.profit / d.revenue) * 100).toFixed(1)}%` : "-"
      ]);
      
    autoTable(doc, {
      startY: table2Y + 8,
      head: [["Date", "Revenu", "Coût", "Profit", "Marge"]],
      body: dayRows,
      theme: "grid",
      headStyles: { fillColor: primaryColor, fontSize: 10, cellPadding: 5 },
      styles: { fontSize: 10, cellPadding: 4, font: "helvetica" },
      columnStyles: { 
        1: { halign: "right" }, 
        2: { halign: "right" }, 
        3: { halign: "right" }, 
        4: { halign: "right", fontStyle: "bold" } 
      },
      margin: { left: 20, right: 20 }
    });
    
    // 3. Performance by Product
    let mY = (doc as any).lastAutoTable.finalY + 20;
    if (mY > 230) { doc.addPage(); mY = 30; }
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("3. Performance par Produit", 20, mY);
    
    const marginRows = margins
      .sort((a, b) => b.revenue - a.revenue)
      .map((m) => [
        m.productName, 
        `${m.revenue.toLocaleString("fr-FR")} DH`, 
        `${m.cost.toLocaleString("fr-FR")} DH`, 
        `${(m.revenue - m.cost).toLocaleString("fr-FR")} DH`, 
        `${m.margin.toFixed(1)}%`
      ]);
      
    autoTable(doc, {
      startY: mY + 8,
      head: [["Désignation Produit", "Revenu", "Coût", "Profit", "Marge"]],
      body: marginRows,
      theme: "striped",
      headStyles: { fillColor: accentColor, fontSize: 10, cellPadding: 5 },
      styles: { fontSize: 10, cellPadding: 4, font: "helvetica" },
      columnStyles: { 
        1: { halign: "right" }, 
        2: { halign: "right" }, 
        3: { halign: "right" }, 
        4: { halign: "right", fontStyle: "bold" } 
      },
      margin: { left: 20, right: 20 }
    });
    
    // Footer with pagination
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`ALIAA Natural Care . Rapport Confidentiel . Page ${i}/${pageCount}`, 20, 285);
      doc.text("Contact: contact@aliaacare.ma . www.aliaacare.ma", 125, 285);
      
      // Bottom line
      doc.setDrawColor(230);
      doc.line(20, 280, 190, 280);
    }
    
    doc.save(`Rapport_Financier_ALIAA_${now.toISOString().split("T")[0]}.pdf`);
    toast({ title: "Rapport PDF amélioré exporté" });
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Gestion Financière</h1>
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
    </>
  );
};

export default AdminFinances;

