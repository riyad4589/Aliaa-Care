import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown, Instagram, Leaf, Heart, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { CollectionCard } from "@/components/CollectionCard";
import { useClientProducts } from "@/hooks/useClientProducts";
import { Button } from "@/components/ui/button";
import coffretImg from "@/assets/coffret-aliaa.jpeg";
import gommageCorpsImg from "@/assets/gommage-corps.jpeg";
import eauDeRoseImg from "@/assets/eau-de-rose.jpeg";
import infusionHerbaleImg from "@/assets/infusion-herbale.jpeg";
import selsDeBainImg from "@/assets/sels-de-bain.jpeg";
import laitCorporelImg from "@/assets/lait-corporel.jpeg";

const Index = () => {
  const { products, collections, getFeaturedProducts, banner } = useClientProducts();
  const featuredProducts = getFeaturedProducts();
  const latestProducts = products.slice(0, 4);
  const displayedCollections = collections.slice(0, 4);
  const featuredCollection = collections.find(c => c.id === "coffrets") || collections[0] || null;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <Layout>
      {/* Banner */}
      {banner.enabled && (
        <div className="bg-primary text-primary-foreground text-center py-2.5 text-sm tracking-wide">
          {banner.message}
        </div>
      )}
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[100svh] -mt-16 md:-mt-20 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src={coffretImg}
            alt="ALIAA Natural Care - Coffret de plantes naturelles"
            className="w-full h-[120%] object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/20 to-charcoal/60" />
        </motion.div>

        <motion.div
          className="relative container-full h-full flex flex-col justify-end pb-20 md:pb-28 pt-16 md:pt-20"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="max-w-3xl"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/70 mb-6"
            >
              Pure Plants, True Relief
            </motion.p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-white mb-8 leading-[0.9] tracking-tight">
              Rituels
              <br />
              <span className="italic font-normal">Naturels</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-10 leading-relaxed max-w-lg">
              Mélanges de plantes traditionnels, préparés avec soin pour le bien-être 
              de chaque femme. Sans conservateurs, 100% naturel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase btn-premium"
              >
                <Link to="/products">
                  Découvrir
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 text-white/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Collection */}
      {featuredCollection && (
      <section className="py-20 md:py-28">
        <div className="container-full">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="relative aspect-[4/5] overflow-hidden group"
            >
              <img
                src={featuredCollection.heroImage || featuredCollection.image}
                alt={featuredCollection.name}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="md:py-12"
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-4">
                Collection Vedette
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-[0.95]">
                {featuredCollection.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                {featuredCollection.description}. Offrez un moment de bien-être avec notre sélection 
                de produits naturels, présentés dans un élégant coffret.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase btn-premium"
              >
                <Link to={`/products?collection=${featuredCollection.slug}`}>
                  Découvrir les {featuredCollection.name}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* Latest Products */}
      <section className="py-20 md:py-28 bg-linen">
        <div className="container-full">
          <div className="flex items-end justify-between mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
                Nos Produits
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground">
                Derniers Arrivages
              </h2>
            </motion.div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-3 text-sm font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors group"
            >
              Tout Voir
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {latestProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="mt-14 text-center md:hidden">
            <Button
              asChild
              variant="outline"
              className="rounded-none px-8 py-5 text-sm tracking-[0.15em] uppercase"
            >
              <Link to="/products">Voir Tous les Produits</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-24 md:py-32">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
              Parcourir Par
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">
              Collections
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            <div className="md:col-span-7">
              <CollectionCard collection={displayedCollections[0]} index={0} variant="wide" />
            </div>
            <div className="md:col-span-5">
              <CollectionCard collection={displayedCollections[1]} index={1} />
            </div>
            <div className="md:col-span-6">
              <CollectionCard collection={displayedCollections[2]} index={2} />
            </div>
            <div className="md:col-span-6">
              <CollectionCard collection={displayedCollections[3]} index={3} />
            </div>
          </div>
        </div>
      </section>

      {/* Values / About Section */}
      <section className="py-24 md:py-32 bg-linen">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
              Nos Engagements
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.3] mb-8">
              Des plantes pures pour un soulagement{" "}
              <span className="italic">véritable</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-16 max-w-4xl mx-auto">
            {[
              { icon: Leaf, title: "100% Naturel", desc: "Plantes soigneusement sélectionnées, sans conservateurs ni additifs artificiels." },
              { icon: Heart, title: "Bien-être Féminin", desc: "Formules traditionnelles dédiées au soin et au confort de chaque femme." },
              { icon: Sparkles, title: "Savoir Ancestral", desc: "Recettes transmises de génération en génération, préparées avec amour." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase"
            >
              <Link to="/about">
                Notre Histoire
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Follow Us */}
      <section className="py-20 md:py-28">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
              Suivez-Nous
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              @aliaacare
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Rejoignez notre communauté et découvrez nos rituels naturels au quotidien.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            {[
              coffretImg,
              gommageCorpsImg,
              eauDeRoseImg,
              infusionHerbaleImg,
              selsDeBainImg,
              laitCorporelImg,
            ].map((image, index) => (
              <motion.a
                key={index}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative aspect-square overflow-hidden group cursor-pointer"
              >
                <img
                  src={image}
                  alt="Instagram"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
