import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingBag, ArrowLeft, MessageSquare } from "lucide-react";
import { Layout } from "@/components/Layout";
import { usePacks } from "@/hooks/usePacks";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/QuantitySelector";
import { useT } from "@/hooks/useT";
import { useState } from "react";

const PackDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: packs, isLoading } = usePacks();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t } = useT();
  const [quantity, setQuantity] = useState(1);

  const pack = packs?.find((p) => p.slug === slug && p.active);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide py-28 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!pack) {
    return (
      <Layout>
        <div className="container-wide py-28 text-center">
          <h1 className="font-serif text-4xl mb-4">{t("pack.notFound")}</h1>
          <p className="text-muted-foreground mb-8">{t("pack.notFoundDesc")}</p>
          <Button asChild className="rounded-none px-8 text-sm tracking-[0.1em] uppercase">
            <Link to="/products">{t("index.viewAllProducts")}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const totalValue = pack.items.reduce((sum, item) => sum + (item.product_price || 0) * item.quantity, 0);
  const savings = totalValue - pack.price;
  const firstImage = pack.items[0]?.product_image || pack.image;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: pack.id,
        name: pack.name,
        slug: pack.slug,
        collection: "",
        price: pack.price,
        description: pack.description,
        longDescription: pack.long_description,
        materials: "",
        images: [firstImage],
      });
    }
    toast({ title: t("pack.addedToCart"), description: `${pack.name} x${quantity}` });
  };

  return (
    <Layout>
      <div className="container-wide pt-6 pb-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />{t("pack.backHome")}
        </Link>
      </div>

      <section className="container-wide pb-16 md:pb-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden border border-border">
              {pack.items.length >= 3 ? (
                <div className="grid grid-cols-2 grid-rows-2 h-full gap-1">
                  {pack.items.slice(0, 4).map((item) => (
                    <img key={item.id} src={item.product_image || "/placeholder.svg"} alt={item.product_name} className="w-full h-full object-cover" />
                  ))}
                </div>
              ) : (
                <img src={firstImage} alt={pack.name} className="w-full h-full object-cover" />
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-primary text-primary-foreground rounded-sm flex items-center gap-1.5">
                <Package className="w-3 h-3" />{t("common.pack")}
              </span>
              {savings > 0 && (
                <span className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase bg-foreground text-background rounded-sm">
                  {t("common.save")} {savings.toFixed(0)} DH
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{pack.name}</h1>
            <p className="text-muted-foreground leading-relaxed mb-6">{pack.long_description || pack.description}</p>
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-3xl font-medium text-foreground">{pack.price.toLocaleString()} DH</span>
              {savings > 0 && <span className="text-lg text-muted-foreground line-through">{totalValue.toLocaleString()} DH</span>}
            </div>
            <div className="mb-8">
              <h3 className="text-sm font-semibold tracking-[0.1em] uppercase text-foreground mb-4">
                {t("pack.contents")} ({pack.items.length} {t("pack.productsCount")})
              </h3>
              <div className="space-y-3">
                {pack.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                    <img src={item.product_image || "/placeholder.svg"} alt={item.product_name} className="w-14 h-14 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">{t("checkout.qty")}: {item.quantity}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{(item.product_price || 0).toLocaleString()} DH</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              <Button size="lg" className="flex-1 w-full rounded-none text-sm tracking-[0.15em] uppercase py-6" onClick={handleAddToCart}>
                <ShoppingBag className="w-4 h-4 ltr:mr-2 rtl:ml-2" />{t("common.addToCart")}
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className="mt-4 rounded-none w-full py-6 text-sm tracking-[0.1em] uppercase border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 transition-colors"
              onClick={() => {
                const phone = "212652535301";
                const url = window.location.href;
                const message = encodeURIComponent(`Bonjour Aliaa Care, j'aimerais avoir plus d'informations sur le pack : ${pack.name}\nPrix : ${pack.price} DH\nLien : ${url}`);
                window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
              }}
            >
              <MessageSquare className="w-4 h-4 ltr:mr-3 rtl:ml-3" />
              Question sur ce pack (WhatsApp)
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PackDetail;
