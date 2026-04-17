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
              <li><Link to="/track-order" className="text-sm text-background/60 hover:text-background transition-colors duration-300">Suivre ma commande</Link></li>
              <li><Link to="/cart" className="text-sm text-background/60 hover:text-background transition-colors duration-300">{t("common.cart")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li><a href="mailto:contact@aliaacare.com" className="text-sm text-background/60 hover:text-background transition-colors duration-300">contact@aliaacare.com</a></li>
              <li><p className="text-sm text-background/40 leading-relaxed">{t("footer.schedule")}</p></li>
              <li className="pt-2">
                <div className="flex flex-col gap-3">
                  <a href="https://www.instagram.com/aliaacare/" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors duration-300 flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-primary" />
                    <span>Instagram</span>
                  </a>
                  <a href="https://www.tiktok.com/@aliaacare" target="_blank" rel="noopener noreferrer" className="text-sm text-background/60 hover:text-background transition-colors duration-300 flex items-center gap-2">
                    <svg className="w-4 h-4 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.64-.28 1.22.2 2.56 1.25 3.19.5.34 1.14.44 1.73.39.45-.03.9-.17 1.3-.4.74-.42 1.22-1.2 1.32-2.03.01-2.89 0-5.79.01-8.68z"/>
                    </svg>
                    <span>TikTok</span>
                  </a>
                </div>
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
