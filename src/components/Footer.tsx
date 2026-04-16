import { Link } from "react-router-dom";
import { ArrowRight, Instagram } from "lucide-react";
import { useClientProducts } from "@/hooks/useClientProducts";
import { useT } from "@/hooks/useT";

export const Footer = () => {
  const { collections } = useClientProducts();
  const { t } = useT();

  return (
    <footer className="bg-foreground text-background">
      <div className="border-b border-background/10">
        <div className="container-full py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <Link to="/" className="font-serif text-3xl md:text-4xl tracking-tight text-background">ALIAA</Link>
              <p className="mt-3 text-sm text-background/50 leading-relaxed max-w-xs">{t("footer.tagline")}</p>
            </div>
            <div className="max-w-sm w-full">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-background/40 mb-3">{t("common.stayConnected")}</p>
              <form className="flex gap-0">
                <input type="email" placeholder={t("common.yourEmail")}
                  className="flex-1 h-12 px-4 text-sm bg-background/5 border border-background/15 text-background placeholder:text-background/30 focus:outline-none focus:border-background/40 transition-colors" />
                <button type="submit" className="h-12 px-5 text-sm font-medium bg-background text-foreground hover:bg-background/90 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container-full py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">{t("common.collections")}</h4>
            <ul className="space-y-3">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link to={`/products?collection=${collection.slug}`} className="text-sm text-background/60 hover:text-background transition-colors duration-300">{collection.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">{t("footer.explore")}</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm text-background/60 hover:text-background transition-colors duration-300">{t("common.shop")}</Link></li>
              <li><Link to="/packs" className="text-sm text-background/60 hover:text-background transition-colors duration-300">{t("common.ourPacks")}</Link></li>
              <li><Link to="/about" className="text-sm text-background/60 hover:text-background transition-colors duration-300">{t("common.ourStory")}</Link></li>
              <li><Link to="/cart" className="text-sm text-background/60 hover:text-background transition-colors duration-300">{t("common.cart")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li><a href="mailto:contact@aliaacare.com" className="text-sm text-background/60 hover:text-background transition-colors duration-300">contact@aliaacare.com</a></li>
              <li><p className="text-sm text-background/40 leading-relaxed">{t("footer.schedule")}</p></li>
              <li className="pt-2">
                <a href="https://www.instagram.com/aliaacare/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors duration-300 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-primary" />
                  <span>@aliaacare</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-full py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/30">© {new Date().getFullYear()} ALIAA Natural Care. {t("common.allRightsReserved")}</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-background/30 hover:text-background/60 transition-colors duration-300">{t("common.privacyPolicy")}</a>
            <a href="#" className="text-xs text-background/30 hover:text-background/60 transition-colors duration-300">{t("common.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
