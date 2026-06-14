import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DbOrder } from "@/hooks/useOrders";
import logoImg from "@/assets/LOGOWEB.png";

const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DH";
};

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const generateInvoice = async (order: DbOrder) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const primaryColor = [74, 85, 67]; // Botanical Green
  
  // Helper to convert image to base64
  const getBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  try {
    // Header
    try {
      const logoBase64 = await getBase64Image(logoImg);
      doc.addImage(logoBase64, "JPEG", 20, 15, 25, 25);
    } catch (e) {
      console.error("Could not load logo", e);
      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("ALIAA CARE", 20, 30);
    }

    // Company Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURE", 140, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Aliaa Natural Care", 20, 45);
    doc.text("Casablanca, Maroc", 20, 50);
    doc.text("contact@aliaacare.ma", 20, 55);
    doc.text("www.aliaacare.ma", 20, 60);

    // Invoice Info Box
    const boxX = 135;
    const boxY = 40;
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text("N° DE FACTURE", boxX, boxY);
    
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`#${order.order_number}`, boxX, boxY + 7);
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text("DATE D'ÉMISSION", boxX, boxY + 16);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(format(new Date(order.created_at), "dd MMMM yyyy", { locale: fr }), boxX, boxY + 23);

    // Decorative line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(boxX, boxY - 5, boxX + 55, boxY - 5);

    // Client Info
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("DESTINATAIRE", 20, 75);
    
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, 77, 50, 77);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(order.customer_name, 20, 85);
    doc.setFont("helvetica", "normal");
    doc.text(order.customer_phone, 20, 91);
    doc.text(order.customer_address, 20, 97);
    doc.text(order.customer_city, 20, 103);

    // Table
    const tableData = order.items.map(item => {
      let name = item.product_name;
      if (item.selected_weight) {
        const weightStr = /^\d+(\.\d+)?$/.test(String(item.selected_weight).trim())
          ? `${item.selected_weight} g`
          : item.selected_weight;
        name += ` (${weightStr})`;
      }
      const description = item.selected_flavors && item.selected_flavors.length > 0
        ? `${name}\n(Goût(s): ${item.selected_flavors.join(", ")})`
        : name;
      return [
        description,
        formatCurrency(item.unit_price),
        item.quantity.toString(),
        formatCurrency(item.unit_price * item.quantity)
      ];
    });

    autoTable(doc, {
      startY: 115,
      head: [["Désignation", "Prix Unitaire", "Quantité", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { 
        fillColor: primaryColor as [number, number, number], 
        fontSize: 10, 
        cellPadding: 4,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'right', fontStyle: 'bold' }
      },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 20, right: 20 }
    });

    // Totals
    const subtotal = order.items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    const deliveryFee = order.total - subtotal;
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Sous-total:", 140, finalY);
    doc.text(formatCurrency(subtotal), 175, finalY, { align: "right" });
    
    doc.text("Livraison:", 140, finalY + 7);
    doc.text(formatCurrency(deliveryFee > 0 ? deliveryFee : 0), 175, finalY + 7, { align: "right" });
    
    doc.setDrawColor(200);
    doc.line(135, finalY + 10, 190, finalY + 10);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("TOTAL:", 140, finalY + 18);
    doc.text(formatCurrency(order.total), 175, finalY + 18, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    const footerText = "Merci pour votre confiance ! Pour toute question, contactez-nous au +212 600-000000";
    doc.text(footerText, 105, 280, { align: "center" });

    doc.save(`Facture_ALIAA_${order.order_number}.pdf`);
  } catch (error) {
    console.error("Error generating PDF", error);
    throw error;
  }
};
