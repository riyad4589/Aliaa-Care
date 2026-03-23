import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { useClientProducts } from "@/hooks/useClientProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { useActivePromotions } from "@/hooks/usePromotions";
import { useT } from "@/hooks/useT";
import { FlashCountdown } from "@/components/FlashCountdown";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "large";
}

export const ProductCard = ({ product, index = 0, variant = "default" }: ProductCardProps) => {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const { collections } = useClientProducts();
  const { getProductDiscount, getFlashPromos } = useActivePromotions();
  const { t } = useT();
  const inWishlist = isInWishlist(product.id);
  const collection = collections.find((c) => c.id === product.collection);
  const hasSecondImage = product.images.length > 1;

  const discount = getProductDiscount(product.id, product.collections || []);
  const originalPrice = (product as any).originalPrice;
  const hasOriginalPrice = originalPrice && originalPrice > product.price;
  const promoDiscount = discount > 0 ? discount : (hasOriginalPrice ? Math.round((1 - product.price / originalPrice) * 100) : 0);
  const flashPromo = getFlashPromos().find(fp =>
    fp.target_type === "all" ||
    (fp.target_type === "specific_products" && fp.product_ids?.includes(product.id))
  );

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) removeItem(product.id);
    else addItem(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className={cn("relative overflow-hidden bg-muted/50 mb-5 rounded-lg", variant === "large" ? "aspect-[3/4]" : "aspect-[4/5]")}>
          <img src={product.images[0]} alt={product.name}
            className={cn("w-full h-full object-cover transition-all duration-[1s] ease-out", hasSecondImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105")} />
          {hasSecondImage && (
            <img src={product.images[1]} alt={`${product.name}`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 transition-all duration-[1s] ease-out group-hover:opacity-100 group-hover:scale-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <button onClick={handleWishlistToggle}
            className={cn("absolute top-5 ltr:right-5 rtl:left-5 p-2.5 rounded-full transition-all duration-500",
              "bg-background/90 backdrop-blur-md hover:bg-background shadow-sm",
              "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
              inWishlist && "opacity-100 translate-y-0")}>
            <Heart className={cn("w-4 h-4 transition-all duration-300", inWishlist ? "fill-primary text-primary scale-110" : "text-foreground")} />
          </button>
          <div className="absolute top-5 ltr:left-5 rtl:right-5 flex flex-col gap-2">
            {product.new && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-foreground text-background rounded-sm">
                {t("common.new")}
              </motion.span>
            )}
            {product.featured && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-primary text-primary-foreground rounded-sm">
                {t("common.featured")}
              </motion.span>
            )}
            {promoDiscount > 0 && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-destructive text-destructive-foreground rounded-sm">
                -{promoDiscount}%
              </motion.span>
            )}
            {flashPromo && (
              <FlashCountdown endsAt={flashPromo.ends_at} />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
            <span className="px-6 py-2.5 text-xs font-medium tracking-[0.15em] uppercase bg-background/95 backdrop-blur-md text-foreground shadow-lg rounded-sm">
              {t("common.viewProduct")}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {collection && (
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary">{collection.name}</p>
          )}
          <h3 className="font-serif text-xl text-foreground transition-colors duration-300 group-hover:text-primary leading-snug">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-3 pt-1">
            {promoDiscount > 0 ? (
              <>
                <p className="text-base font-medium text-destructive tracking-wide">
                  {Math.round(product.price * (1 - promoDiscount / 100)).toLocaleString()} DH
                </p>
                <p className="text-sm text-muted-foreground line-through">{product.price.toLocaleString()} DH</p>
              </>
            ) : hasOriginalPrice ? (
              <>
                <p className="text-base font-medium text-foreground tracking-wide">{product.price.toLocaleString()} DH</p>
                <p className="text-sm text-muted-foreground line-through">{originalPrice.toLocaleString()} DH</p>
              </>
            ) : (
              <p className="text-base font-medium text-foreground tracking-wide">{product.price.toLocaleString()} DH</p>
            )}
            {product.weight && (
              <>
                <span className="w-px h-3 bg-border" />
                <p className="text-xs text-muted-foreground/60 tracking-wide">{t("common.netWeight")} : {product.weight} g</p>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
