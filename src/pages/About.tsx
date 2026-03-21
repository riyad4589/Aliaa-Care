import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import coffretImg from "@/assets/coffret-aliaa.jpeg";
import guideImg from "@/assets/guide-utilisation.jpeg";
import chayNifasImg from "@/assets/chay-nifas.jpeg";

const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <Layout>
      {/* Hero */}
      <section ref={heroRef} className="relative h-[80vh] md:h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src={coffretImg}
            alt="ALIAA Natural Care"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/10 to-charcoal/50" />
        </motion.div>

        <div className="relative container-full h-full flex flex-col justify-end pb-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/60 mb-5">
              Notre Histoire
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.9]">
              Rituels Naturels
              <br />
              <span className="italic font-normal">pour Chaque Femme</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-lg leading-relaxed">
              Des plantes pures, préparées avec soin, pour un soulagement véritable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-28 md:py-40">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="divider-ornament mb-12">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary whitespace-nowrap">
                Notre Philosophie
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.25] tracking-tight">
              Nous croyons que la nature offre les meilleurs remèdes. 
              Nos mélanges sont préparés avec amour et{" "}
              <span className="italic">respect</span> des traditions ancestrales.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="pb-20 md:pb-32">
        <div className="container-full">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center mb-24 md:mb-36">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5"
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-5">
                Les Origines
              </p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-8 leading-tight">
                Un Savoir
                <br />
                <span className="italic">Transmis</span>
              </h3>
              <p className="text-muted-foreground leading-[1.8] mb-5">
                ALIAA Natural Care est née d'une passion pour les plantes médicinales 
                et les recettes traditionnelles transmises de mère en fille. 
                Chaque produit est le fruit d'un savoir ancestral, adapté aux besoins 
                des femmes d'aujourd'hui.
              </p>
              <p className="text-muted-foreground leading-[1.8]">
                Nos mélanges — Chay Nifas, Msakhen, Tashinas et Talbina — sont 
                préparés artisanalement, sans conservateurs, pour préserver toute 
                la puissance des plantes naturelles.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="md:col-span-7 relative"
            >
              <div className="aspect-[4/5] overflow-hidden group">
                <img
                  src={chayNifasImg}
                  alt="Chay Nifas - Mélange de plantes naturelles"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              </div>
            </motion.div>
          </div>

          {/* Quote banner */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-24 md:mb-36"
          >
            <div className="relative h-[50vh] md:h-[70vh] overflow-hidden group">
              <img
                src={guideImg}
                alt="Guide d'utilisation ALIAA"
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-charcoal/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="font-serif text-3xl md:text-5xl lg:text-6xl text-white text-center max-w-3xl px-6 leading-tight"
                >
                  "La nature guérit,
                  <br />
                  <span className="italic">nous préservons</span>
                  <br />
                  son savoir"
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Second story block */}
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="md:col-span-7 md:order-first"
            >
              <div className="aspect-[4/5] overflow-hidden group">
                <img
                  src={coffretImg}
                  alt="Coffret ALIAA Natural Care"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="md:col-span-5"
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-5">
                Notre Approche
              </p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-8 leading-tight">
                De la Plante
                <br />
                <span className="italic">à Votre Tasse</span>
              </h3>
              <p className="text-muted-foreground leading-[1.8] mb-5">
                Chaque ingrédient est sélectionné pour sa pureté et ses bienfaits. 
                Nous travaillons directement avec des producteurs locaux qui partagent 
                notre engagement pour la qualité et le respect de l'environnement.
              </p>
              <p className="text-muted-foreground leading-[1.8]">
                Nos préparations sont réalisées en petits lots pour garantir 
                fraîcheur et qualité optimales. Chaque pot est le reflet de notre 
                amour pour les plantes et notre dévouement au bien-être féminin.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-36 bg-linen">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
              Ce Qui Nous Guide
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">
              Nos Valeurs
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16 md:gap-12 lg:gap-20">
            {[
              {
                title: "Pureté",
                number: "01",
                description:
                  "100% naturel, sans conservateurs ni additifs. Chaque ingrédient est choisi pour sa qualité et ses propriétés bienfaisantes.",
              },
              {
                title: "Tradition",
                number: "02",
                description:
                  "Des recettes ancestrales transmises de génération en génération, adaptées aux besoins des femmes modernes.",
              },
              {
                title: "Bienveillance",
                number: "03",
                description:
                  "Chaque produit est préparé avec amour et intention, dans le respect de la femme et de la nature.",
              },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="text-center"
              >
                <span className="text-[11px] font-semibold tracking-[0.3em] text-primary/50 mb-4 block">
                  {value.number}
                </span>
                <h3 className="font-serif text-2xl text-foreground mb-5">
                  {value.title}
                </h3>
                <div className="w-8 h-px bg-primary/30 mx-auto mb-5" />
                <p className="text-muted-foreground leading-[1.8]">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary-foreground/50 mb-5">
              Contactez-Nous
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 leading-tight">
              Une Question ?
            </h2>
            <p className="text-primary-foreground/60 mb-10 max-w-md mx-auto leading-relaxed">
              Nous sommes toujours heureuses de vous conseiller sur nos produits 
              et de vous aider à trouver le rituel qui vous convient.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-none px-12 py-6 text-sm tracking-[0.15em] uppercase bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <a href="mailto:contact@aliaacare.com">
                Nous Écrire
                <ArrowRight className="ml-3 w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
