import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Leaf, Heart, Sparkles, Shield, Star, Droplets } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useT";
import coffretImg from "@/assets/coffret-aliaa.webp";
import guideImg from "@/assets/guide-utilisation.jpeg";
import chayNifasImg from "@/assets/chay-nifas.jpeg";
import coffretArganImg from "@/assets/coffret-argan.jpeg";
import selsBainImg from "@/assets/sels-de-bain.jpeg";

const About = () => {
  const { t } = useT();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const stats = [
    { value: "100%", label: t("index.natural") || "100% Naturel" },
    { value: "0", label: t("about.purity") || "Conservateurs" },
    { value: "4+", label: t("about.tradition") || "Recettes" },
  ];

  return (
    <>
      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative h-[85vh] md:h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img src={coffretImg} alt="ALIAA Natural Care" className="w-full h-[130%] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal/70" />
        </motion.div>
        <motion.div style={{ opacity: heroOpacity }} className="relative container-full h-full flex flex-col justify-end pb-16 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/60 mb-5">{t("about.heroTag")}</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.9]">
              {t("about.heroTitle1")}<br /><span className="italic font-normal">{t("about.heroTitle2")}</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-lg leading-relaxed">{t("about.heroDesc")}</p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-8 md:gap-16 mt-12 pt-8 border-t border-white/20"
          >
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="font-serif text-3xl md:text-4xl text-white">{stat.value}</p>
                <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── PHILOSOPHY ─── */}
      <section className="py-24 md:py-36">
        <div className="container-narrow">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
            <div className="divider-ornament mb-12">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary whitespace-nowrap">{t("about.philosophy")}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.25] tracking-tight">
              {t("about.philosophyText")} <span className="italic text-primary">{t("about.philosophyItalic")}</span> {t("about.philosophyText2")}
            </h2>
          </motion.div>
        </div>
      </section>

      {/* ─── ORIGINS ─── */}
      <section className="pb-20 md:pb-32">
        <div className="container-full">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center mb-24 md:mb-36">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8 }} className="md:col-span-5">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-5">{t("about.origins")}</p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-8 leading-tight">
                {t("about.originsTitle1")}<br /><span className="italic">{t("about.originsTitle2")}</span>
              </h3>
              <p className="text-muted-foreground leading-[1.8] mb-5">{t("about.originsText1")}</p>
              <p className="text-muted-foreground leading-[1.8]">{t("about.originsText2")}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }} className="md:col-span-7 relative flex justify-center">
              <div className="aspect-square w-full max-w-md overflow-hidden group rounded-lg shadow-2xl">
                <img src={chayNifasImg} alt="Chay Nifas" className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
              </div>
              {/* Floating accent card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-8 -left-6 md:-left-12 bg-primary text-primary-foreground p-6 md:p-8 rounded-lg shadow-xl max-w-[220px]"
              >
                <Leaf className="w-6 h-6 mb-3 opacity-70" />
                <p className="font-serif text-lg leading-snug">100% naturel, sans conservateurs</p>
              </motion.div>
            </motion.div>
          </div>

          {/* ─── QUOTE BANNER ─── */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="mb-24 md:mb-36">
            <div className="relative h-[40vh] md:h-[55vh] overflow-hidden rounded-xl group">
              <img src={guideImg} alt="Guide ALIAA" className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/40 to-charcoal/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }} className="text-center px-6">
                  <Sparkles className="w-8 h-8 text-white/50 mx-auto mb-6" />
                  <p className="font-serif text-3xl md:text-5xl lg:text-6xl text-white max-w-3xl leading-tight">
                    {t("about.quote")}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ─── APPROACH ─── */}
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9 }} className="md:col-span-7 md:order-first relative flex justify-center">
              <div className="aspect-square w-full max-w-md overflow-hidden group rounded-lg shadow-2xl">
                <img src={coffretArganImg} alt="Coffret ALIAA" className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
              </div>
              {/* Floating accent card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-8 -right-6 md:-right-12 bg-background border border-border p-6 md:p-8 rounded-lg shadow-xl max-w-[220px]"
              >
                <Heart className="w-6 h-6 mb-3 text-primary" />
                <p className="font-serif text-lg leading-snug text-foreground">Préparé avec amour & intention</p>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }} className="md:col-span-5">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-5">{t("about.approach")}</p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-8 leading-tight">
                {t("about.approachTitle1")}<br /><span className="italic">{t("about.approachTitle2")}</span>
              </h3>
              <p className="text-muted-foreground leading-[1.8] mb-5">{t("about.approachText1")}</p>
              <p className="text-muted-foreground leading-[1.8]">{t("about.approachText2")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PROCESS STEPS ─── */}
      <section className="py-20 md:py-32 bg-muted/30 border-y border-border">
        <div className="container-full">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="text-center mb-16 md:mb-20">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">Notre Processus</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">Du Champ à Votre Tasse</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8 md:gap-6 lg:gap-10">
            {[
              { icon: Leaf, step: "01", title: "Sélection", desc: "Plantes soigneusement choisies auprès de producteurs locaux de confiance." },
              { icon: Droplets, step: "02", title: "Préparation", desc: "Mélanges artisanaux en petits lots pour une qualité optimale." },
              { icon: Shield, step: "03", title: "Contrôle", desc: "Chaque lot est vérifié pour garantir pureté et fraîcheur." },
              { icon: Star, step: "04", title: "Livraison", desc: "Emballé avec soin et livré partout au Maroc." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="relative text-center group"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.3em] text-primary/40 mb-2 block">{item.step}</span>
                <h3 className="font-serif text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px] mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-24 md:py-36 bg-linen">
        <div className="container-full">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="text-center mb-20">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">{t("about.whatGuidesUs")}</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">{t("about.ourValues")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-8 lg:gap-16">
            {[
              { title: t("about.purity"), number: "01", description: t("about.purityDesc"), icon: Leaf },
              { title: t("about.tradition"), number: "02", description: t("about.traditionDesc"), icon: Star },
              { title: t("about.kindness"), number: "03", description: t("about.kindnessDesc"), icon: Heart },
            ].map((value, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="text-center p-8 md:p-10 rounded-xl bg-background border border-border hover:shadow-lg transition-shadow duration-500 group"
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[11px] font-semibold tracking-[0.3em] text-primary/40 mb-3 block">{value.number}</span>
                <h3 className="font-serif text-2xl text-foreground mb-4">{value.title}</h3>
                <div className="w-8 h-px bg-primary/30 mx-auto mb-5" />
                <p className="text-muted-foreground leading-[1.8] text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMAGE STRIP ─── */}
      <section className="py-0">
        <div className="grid grid-cols-3 h-[20vh] md:h-[30vh]">
          {[coffretImg, selsBainImg, chayNifasImg].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="overflow-hidden group"
            >
              <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 md:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative container-narrow text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Sparkles className="w-8 h-8 text-primary-foreground/40 mx-auto mb-6" />
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary-foreground/50 mb-5">{t("about.ctaTag")}</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 leading-tight">{t("about.ctaTitle")}</h2>
            <p className="text-primary-foreground/60 mb-10 max-w-md mx-auto leading-relaxed">{t("about.ctaDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-none px-12 py-6 text-sm tracking-[0.15em] uppercase bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <a href="mailto:contact@aliaacare.com">{t("about.writeUs")}<ArrowRight className="ltr:ml-3 rtl:mr-3 w-4 h-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-none px-12 py-6 text-sm tracking-[0.15em] uppercase border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/products">{t("common.shop")}<ArrowRight className="ltr:ml-3 rtl:mr-3 w-4 h-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;
