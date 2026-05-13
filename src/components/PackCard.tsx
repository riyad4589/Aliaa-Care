import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Heart } from "lucide-react";
import { DbPack } from "@/hooks/usePacks";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/hooks/useWishlist";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";
interface PackCardProps {
  pack: DbPack;
  index?: number;
}

export const PackCard = ({ pack, index = 0 }: PackCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useT();
  const { getProductDiscount, getFlashPromos } = useActivePromotions();
  
  const inWishlist = isInWishlist(pack.id);
  const discount = getProductDiscount(pack.id, []);
  const discountedPrice = discount > 0 ? Math.round(pack.price * (1 - discount / 100)) : pack.price;

  const totalValue = pack.items.reduce((sum, item) => sum + (item.product_price || 0) * item.quantity, 0);
  const savings = totalValue - discountedPrice;
  const hasPackImage = pack.image && pack.image !== "/placeholder.svg";
  const firstProductImage = pack.items[0]?.product_image || "/placeholder.svg";

  const flashPromo = getFlashPromos().find(fp =>
    fp.target_type === "all" ||
    (fp.target_type === "specific_products" && fp.product_ids?.includes(pack.id))
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add the pack as a product-like item to cart
    addItem({
      id: pack.id,
      name: pack.name,
      slug: pack.slug,
      collection: "",
      price: discountedPrice,
      description: pack.description,
      longDescription: pack.long_description,
      materials: "",
      images: [hasPackImage ? pack.image : firstProductImage],
    });
    toast({ title: t("pack.addedToCart"), description: pack.name });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(pack.id);
      toast({ title: t("productDetail.removedFromFavorites"), description: pack.name });
    } else {
      addToWishlist({
        id: pack.id,
        name: pack.name,
        slug: pack.slug,
        collection: "",
        price: pack.price,
        description: pack.description,
        longDescription: pack.long_description,
        materials: "",
        images: [hasPackImage ? pack.image : firstProductImage],
      } as Product);
      toast({ title: t("productDetail.addedToFavorites"), description: pack.name });
    }
  };

  return (
    <Link to={`/pack/${pack.slug}`}>
    <div className="group border border-border rounded-lg overflow-hidden bg-background hover:shadow-lg transition-shadow duration-500 cursor-pointer">
      {/* Pack image */}
      <div className="relative aspect-video bg-muted/30 overflow-hidden">
        {hasPackImage ? (
          <img
            src={pack.image}
            alt={pack.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : pack.items.length >= 3 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
            {pack.items.slice(0, 4).map((item, i) => (
              <img
                key={item.id}
                src={item.product_image || "/placeholder.svg"}
                alt={item.product_name}
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        ) : (
          <img
            src={firstProductImage}
            alt={pack.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-primary text-primary-foreground rounded-sm flex items-center gap-1.5">
            <Package className="w-3 h-3" />
            Pack
          </span>
          {discount > 0 && (
            <span className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase bg-destructive text-destructive-foreground rounded-sm">
              -{discount}%
            </span>
          )}
          {savings > 0 && (
            <span className="px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase bg-foreground text-background rounded-sm">
              -{savings.toFixed(0)} DH
            </span>
          )}
        </div>

        <button 
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 p-2.5 bg-background/80 backdrop-blur-md rounded-full shadow-sm hover:bg-background transition-all duration-300 z-10 group/heart"
        >
          <Heart className={cn("w-4 h-4 transition-all duration-300", inWishlist ? "fill-primary text-primary scale-110" : "text-muted-foreground group-hover/heart:scale-110")} />
        </button>
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
          {pack.name}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">{pack.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {pack.items.map((item) => (
            <span key={item.id} className="text-[11px] px-2 py-1 bg-muted rounded-sm text-muted-foreground">
              {item.product_name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            {discount > 0 ? (
              <>
                <span className="text-[19px] font-sans font-bold text-destructive tracking-tight">
                  {discountedPrice.toLocaleString()}<span className="text-sm font-medium text-muted-foreground/70 ml-1">DH</span>
                </span>
                <span className="text-xs font-sans text-muted-foreground line-through opacity-70">
                  {pack.price.toLocaleString()}<span className="text-[10px] ml-0.5">DH</span>
                </span>
              </>
            ) : (
              <>
                <span className="text-[19px] font-sans font-bold text-foreground tracking-tight">
                  {pack.price.toLocaleString()}<span className="text-sm font-medium text-muted-foreground/70 ml-1">DH</span>
                </span>
                {savings > 0 && (
                  <span className="text-xs font-sans text-muted-foreground line-through opacity-70">
                    {totalValue.toLocaleString()}<span className="text-[10px] ml-0.5">DH</span>
                  </span>
                )}
              </>
            )}
          </div>
          <Button
            size="sm"
            className="rounded-none text-xs tracking-[0.1em] uppercase"
            onClick={handleAddToCart}
          >
            {t("common.add")}
          </Button>
        </div>
      </div>
    </div>
    </Link>
  );
};
