import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { useClientProducts } from "@/hooks/useClientProducts";
import { useT } from "@/hooks/useT";
import typoImg from "@/assets/TYPO02 PNG.png";

export const Footer = () => {
  const { collections } = useClientProducts();
  const { t } = useT();

  return (
    <footer className="bg-[#365836] text-white overflow-hidden relative">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container-full pt-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 border-t border-white/5 pt-6">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <img src={typoImg} alt="ALIAA" className="h-20 md:h-28 w-auto brightness-0 invert" />
            </Link>
            <p className="text-[10px] text-white/40 leading-relaxed max-w-[200px] -mt-2 md:-mt-4 relative z-10">
              Pure Plants, True Relief. Rituels naturels pour chaque femme.
            </p>
          </div>

          <div className="col-span-1">
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-3">{t("common.collections")}</h4>
            <ul className="space-y-1.5">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link to={`/products?collection=${collection.slug}`} className="text-sm text-white/40 hover:text-white transition-colors duration-300 inline-block group">
                    {collection.name}
                    <span className="block h-px w-0 bg-white/40 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-3">{t("footer.explore")}</h4>
            <ul className="space-y-1.5">
              <li><Link to="/products" className="text-sm text-white/40 hover:text-white transition-colors duration-300 group inline-block">
                {t("common.shop")}
                <span className="block h-px w-0 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
              <li><Link to="/packs" className="text-sm text-white/40 hover:text-white transition-colors duration-300 group inline-block">
                {t("common.ourPacks")}
                <span className="block h-px w-0 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
              <li><Link to="/about" className="text-sm text-white/40 hover:text-white transition-colors duration-300 group inline-block">
                {t("common.ourStory")}
                <span className="block h-px w-0 bg-primary group-hover:w-full transition-all duration-300" />
              </Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-3">{t("footer.contact")}</h4>
            <div className="space-y-2">
              <a href="mailto:Aliaacare.ac@gmail.com" className="text-sm text-white/40 hover:text-white transition-colors block italic underline underline-offset-4 decoration-white/10 hover:decoration-white/40">
                Aliaacare.ac@gmail.com
              </a>
              <p className="text-xs text-white/30 leading-relaxed max-w-[200px]">
                {t("footer.schedule")}
              </p>
              <div className="flex gap-3 pt-2">
                <a href="https://www.instagram.com/aliaacare/" target="_blank" rel="noopener noreferrer" 
                   className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="https://www.tiktok.com/@aliaacare" target="_blank" rel="noopener noreferrer"
                   className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.64-.28 1.22.2 2.56 1.25 3.19.5.34 1.14.44 1.73.39.45-.03.9-.17 1.3-.4.74-.42 1.22-1.2 1.32-2.03.01-2.89 0-5.79.01-8.68z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] uppercase tracking-widest text-white/20">
            © {new Date().getFullYear()} ALIAA Natural Care. {t("common.allRightsReserved")}
          </p>
          <p className="text-[9px] uppercase tracking-widest text-white/20">
            Natural Beauty
          </p>
        </div>
      </div>
    </footer>
  );
};
