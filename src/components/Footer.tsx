import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { collections } from "@/data/products";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="border-b border-background/10">
        <div className="container-full py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <Link
                to="/"
                className="font-serif text-3xl md:text-4xl tracking-tight text-background"
              >
                ALIAA
              </Link>
              <p className="mt-3 text-sm text-background/50 leading-relaxed max-w-xs">
                Pure Plants, True Relief. Rituels naturels pour chaque femme.
              </p>
            </div>

            <div className="max-w-sm w-full">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-background/40 mb-3">
                Restez Connectée
              </p>
              <form className="flex gap-0">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 h-12 px-4 text-sm bg-background/5 border border-background/15 text-background placeholder:text-background/30 focus:outline-none focus:border-background/40 transition-colors"
                />
                <button
                  type="submit"
                  className="h-12 px-5 text-sm font-medium bg-background text-foreground hover:bg-background/90 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container-full py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">
              Collections
            </h4>
            <ul className="space-y-3">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link
                    to={`/products?collection=${collection.slug}`}
                    className="text-sm text-background/60 hover:text-background transition-colors duration-300"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">
              Explorer
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-background/60 hover:text-background transition-colors duration-300"
                >
                  Boutique
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-background/60 hover:text-background transition-colors duration-300"
                >
                  Notre Histoire
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-background/60 hover:text-background transition-colors duration-300"
                >
                  Panier
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-background/60 hover:text-background transition-colors duration-300">
                  Livraison & Retours
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-background/60 hover:text-background transition-colors duration-300">
                  Guide d'Utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-background/60 hover:text-background transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@aliaacare.com"
                  className="text-sm text-background/60 hover:text-background transition-colors duration-300"
                >
                  contact@aliaacare.com
                </a>
              </li>
              <li>
                <p className="text-sm text-background/40 leading-relaxed">
                  Lun–Ven, 9h–18h
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-full py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/30">
            © {new Date().getFullYear()} ALIAA Natural Care. Tous droits réservés.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-background/30 hover:text-background/60 transition-colors duration-300">
              Politique de Confidentialité
            </a>
            <a href="#" className="text-xs text-background/30 hover:text-background/60 transition-colors duration-300">
              CGV
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
