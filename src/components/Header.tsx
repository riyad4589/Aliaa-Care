import { Heart, Menu, X, Settings, Globe, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/hooks/useWishlist";
import { CartIcon } from "@/components/CartIcon";
import { useClientProducts } from "@/hooks/useClientProducts";
import { useT } from "@/hooks/useT";
import { useLanguage, Language } from "@/hooks/useLanguage";
import logoImg from "@/assets/LOGOWEB.png";
import typoImg from "@/assets/TYPO02 PNG.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const langOptions: { code: Language; label: string; flag: string }[] = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ar", label: "AR", flag: "🇲🇦" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items } = useWishlist();
  const { collections } = useClientProducts();
  const { t } = useT();
  const { language, setLanguage } = useLanguage();
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      )}
    >
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 overflow-hidden whitespace-nowrap border-b border-primary/20 text-center">
        <div className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
          {t("header.deliveryMaroc") || "Livraison partout au Maroc"}
        </div>
      </div>

      <nav className="container-full">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300">
            {/* <img src={logoImg} alt="ALIAA Natural Care" className="h-10 md:h-12 w-auto" /> */}
            <img src={typoImg} alt="ALIAA CARE" className="h-12 md:h-40 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground">
                    {t("common.collections")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {collections.map((collection) => (
                        <li key={collection.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/products?collection=${collection.slug}`}
                              className={cn(
                                "block select-none space-y-1 rounded-sm p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">{collection.name}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{collection.description}</p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link to="/products" className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline">
              {t("common.shop")}
            </Link>

            <Link to="/packs" className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline">
              {t("common.ourPacks")}
            </Link>

            <Link to="/about" className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline">
              {t("common.ourStory")}
            </Link>

            <Link to="/track-order" className="text-xs font-medium tracking-[0.15em] uppercase text-primary hover:text-primary/80 transition-colors duration-300 flex items-center gap-1.5 border border-primary/20 px-3 py-1.5 rounded-full bg-primary/5">
              {t("common.trackOrder")}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 hover:bg-accent transition-colors duration-300 group flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">{language}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {langOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.code}
                    onClick={() => setLanguage(opt.code)}
                    className={cn("flex items-center gap-2", language === opt.code && "bg-accent")}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/wishlist" className="relative p-2 hover:bg-accent transition-colors duration-300 group">
                  <Heart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <AnimatePresence>
                    {items.length > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                        {items.length > 9 ? "9+" : items.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                {items.length === 0 ? (
                  <p className="text-sm">{t("header.wishlistEmpty")}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{items.length} {t("header.savedItems")}</p>
                    <div className="space-y-1">
                      {items.slice(0, 3).map((item) => (
                        <p key={item.id} className="text-xs text-muted-foreground truncate">{item.name}</p>
                      ))}
                      {items.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{items.length - 3} {t("header.more")}</p>
                      )}
                    </div>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>

            <CartIcon />

            <CartIcon />

            <button className="md:hidden p-2 hover:bg-accent transition-colors duration-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }} className="md:hidden border-t border-border overflow-hidden">
              <div className="py-8 space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-muted-foreground/50 px-2 mb-3">{t("common.collections")}</p>
                  {collections.map((collection, i) => (
                    <motion.div key={collection.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/products?collection=${collection.slug}`} className="block px-2 py-2.5 text-sm hover:bg-accent transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                        {collection.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="pt-6 border-t border-border space-y-1">
                  {[
                    { to: "/products", label: t("common.shop") },
                    { to: "/packs", label: t("common.ourPacks") },
                    { to: "/track-order", label: t("common.trackOrder") },
                    { to: "/about", label: t("common.ourStory") },
                    { to: "/cart", label: t("common.cart") },
                  ].map((link, i) => (
                    <motion.div key={link.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                      <Link to={link.to} className="block px-2 py-2.5 text-sm font-medium hover:bg-accent transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};
