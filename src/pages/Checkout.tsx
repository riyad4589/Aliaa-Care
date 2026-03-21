import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAddOrder } from "@/hooks/useOrders";

const WHATSAPP_NUMBER = "212652535301";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getSubtotal, clearCart } = useCart();
  const addOrder = useAddOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: "", country: "Maroc", notes: "",
  });

  const subtotal = getSubtotal();
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-narrow py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-serif text-4xl mb-4">Aucun article</h1>
            <p className="text-muted-foreground mb-8">Votre panier est vide.</p>
            <Button asChild size="lg" className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase btn-premium">
              <Link to="/products">Commencer vos achats<ArrowRight className="ml-3 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildWhatsAppMessage = (orderNumber: string) => {
    let msg = `✅ *Nouvelle commande #${orderNumber}*\n\n`;
    msg += `👤 *Client :* ${formData.firstName} ${formData.lastName}\n`;
    msg += `📧 ${formData.email}\n`;
    if (formData.phone) msg += `📞 ${formData.phone}\n`;
    msg += `\n📍 *Adresse :*\n${formData.address}\n${formData.city}, ${formData.postalCode}\n${formData.country}\n`;
    msg += `\n🛒 *Articles :*\n`;
    items.forEach((item) => {
      msg += `• ${item.product.name} × ${item.quantity} — ${(item.product.price * item.quantity).toLocaleString()} DH\n`;
    });
    msg += `\n💰 Sous-total : ${subtotal.toLocaleString()} DH`;
    msg += `\n🚚 Livraison : ${shipping === 0 ? "Offerte" : `${shipping} DH`}`;
    msg += `\n*🧾 Total : ${total.toLocaleString()} DH*`;
    if (formData.notes) msg += `\n\n📝 Notes : ${formData.notes}`;
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const orderNumber = `CMD-${Date.now().toString(36).toUpperCase()}`;
      await addOrder.mutateAsync({
        order_number: orderNumber,
        total,
        total_cost: 0,
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: i.product.price,
          cost_price: 0,
        })),
      });

      const waMsg = encodeURIComponent(buildWhatsAppMessage(orderNumber));
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

      toast({ title: "Commande enregistrée !", description: "Vous allez être redirigé vers WhatsApp pour confirmer." });
      clearCart();
      window.open(waUrl, "_blank");
      navigate("/");
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la commande.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container-full py-6 border-b border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/cart" className="hover:text-foreground transition-colors">Votre Panier</Link>
          <span className="text-border">/</span>
          <span className="text-foreground">Commande</span>
        </div>
      </div>

      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container-full py-4">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-primary" />
            <p>
              <span className="font-medium">Paiement en ligne bientôt disponible.</span>{" "}
              <span className="text-muted-foreground">Soumettez votre commande et nous vous contacterons pour finaliser l'achat.</span>
            </p>
          </div>
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container-full">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-serif text-4xl md:text-5xl mb-12">
            Commande
          </motion.h1>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="font-serif text-xl mb-6">Informations de contact</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Prénom *</label>
                      <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="rounded-none h-12" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Nom *</label>
                      <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="rounded-none h-12" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Email *</label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="rounded-none h-12" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Téléphone</label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="rounded-none h-12" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-xl mb-6">Adresse de livraison</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Adresse *</label>
                      <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required className="rounded-none h-12" />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Ville *</label>
                        <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required className="rounded-none h-12" />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Code postal *</label>
                        <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className="rounded-none h-12" />
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Pays *</label>
                        <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required className="rounded-none h-12" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-xl mb-6">Notes</h2>
                  <Textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Demandes spéciales ou notes..." className="rounded-none min-h-[120px]" />
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-none py-6 text-sm tracking-[0.15em] uppercase btn-premium">
                  {isSubmitting ? "Envoi en cours..." : <>Envoyer la Commande<ArrowRight className="ml-3 w-4 h-4" /></>}
                </Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-5">
              <div className="bg-linen p-8 lg:sticky lg:top-28">
                <h2 className="font-serif text-2xl mb-6">Récapitulatif</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-16 h-20 bg-muted/30 overflow-hidden">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Qté : {item.quantity}</p>
                        <p className="text-sm mt-1">{(item.product.price * item.quantity).toLocaleString()} DH</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{subtotal.toLocaleString()} DH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{shipping === 0 ? "Offerte" : `${shipping} DH`}</span>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between font-serif text-xl">
                    <span>Total</span>
                    <span>{total.toLocaleString()} DH</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">Questions ?</p>
                  <p className="text-sm text-muted-foreground">Contactez-nous à <a href="mailto:contact@aliaacare.com" className="text-foreground underline">contact@aliaacare.com</a></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;