import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { useActivePromotions } from "@/hooks/usePromotions";
import { useClientProducts } from "@/hooks/useClientProducts";
import { FlashCountdown } from "./FlashCountdown";
import { Button } from "@/components/ui/button";

export const PromoBanner = () => {
  const { getProductOfDay, getFlashPromos } = useActivePromotions();
  const { products } = useClientProducts();

  const productOfDay = getProductOfDay();
  const flashPromos = getFlashPromos();

  // Show product of the day banner
  if (productOfDay && productOfDay.product_ids?.length > 0) {
    const product = products.find(p => p.id === productOfDay.product_ids[0]);
    if (product) {
      return (
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-primary-foreground"
        >
          <div className="container-full py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide">
                Produit du jour : {product.name} — <span className="underline">-{productOfDay.discount_percent}%</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FlashCountdown endsAt={productOfDay.ends_at} />
              <Button asChild size="sm" variant="secondary" className="rounded-none text-xs tracking-wider uppercase">
                <Link to={`/product/${product.slug}`}>Voir <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            </div>
          </div>
        </motion.section>
      );
    }
  }

  // Show first flash promo if no product of day
  if (flashPromos.length > 0) {
    const flash = flashPromos[0];
    return (
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-destructive text-destructive-foreground"
      >
        <div className="container-full py-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide">
              ⚡ {flash.name} — -{flash.discount_percent}%
            </span>
          </div>
          <FlashCountdown endsAt={flash.ends_at} />
        </div>
      </motion.section>
    );
  }

  return null;
};
