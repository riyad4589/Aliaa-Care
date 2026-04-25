import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useT";
import coffretImg from "@/assets/coffret-aliaa.webp";
import guideImg from "@/assets/guide-utilisation.jpeg";
import chayNifasImg from "@/assets/chay-nifas.jpeg";

const About = () => {
  const { t } = useT();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <>
      <section ref={heroRef} className="relative h-[80vh] md:h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img src={coffretImg} alt="ALIAA Natural Care" className="w-full h-[120%] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/10 to-charcoal/50" />
        </motion.div>
        <div className="relative container-full h-full flex flex-col justify-end pb-20 md:pb-28">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/60 mb-5">{t("about.heroTag")}</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.9]">
              {t("about.heroTitle1")}<br /><span className="italic font-normal">{t("about.heroTitle2")}</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-lg leading-relaxed">{t("about.heroDesc")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-28 md:py-40">
        <div className="container-narrow">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
            <div className="divider-ornament mb-12">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary whitespace-nowrap">{t("about.philosophy")}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.25] tracking-tight">
              {t("about.philosophyText")} <span className="italic">{t("about.philosophyItalic")}</span> {t("about.philosophyText2")}
            </h2>
          </motion.div>
        </div>
      </section>

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
              transition={{ duration: 0.9, delay: 0.15 }} className="md:col-span-7 relative">
              <div className="aspect-[4/5] overflow-hidden group">
                <img src={chayNifasImg} alt="Chay Nifas" className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="mb-24 md:mb-36">
            <div className="relative h-[50vh] md:h-[70vh] overflow-hidden group">
              <img src={guideImg} alt="Guide ALIAA" className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-charcoal/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }} className="font-serif text-3xl md:text-5xl lg:text-6xl text-white text-center max-w-3xl px-6 leading-tight">
                  {t("about.quote")}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9 }} className="md:col-span-7 md:order-first">
              <div className="aspect-[4/5] overflow-hidden group">
                <img src={coffretImg} alt="Coffret ALIAA" className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
              </div>
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

      <section className="py-24 md:py-36 bg-linen">
        <div className="container-full">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="text-center mb-20">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">{t("about.whatGuidesUs")}</p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">{t("about.ourValues")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-16 md:gap-12 lg:gap-20">
            {[
              { title: t("about.purity"), number: "01", description: t("about.purityDesc") },
              { title: t("about.tradition"), number: "02", description: t("about.traditionDesc") },
              { title: t("about.kindness"), number: "03", description: t("about.kindnessDesc") },
            ].map((value, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }} className="text-center">
                <span className="text-[11px] font-semibold tracking-[0.3em] text-primary/50 mb-4 block">{value.number}</span>
                <h3 className="font-serif text-2xl text-foreground mb-5">{value.title}</h3>
                <div className="w-8 h-px bg-primary/30 mx-auto mb-5" />
                <p className="text-muted-foreground leading-[1.8]">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative container-narrow text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary-foreground/50 mb-5">{t("about.ctaTag")}</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 leading-tight">{t("about.ctaTitle")}</h2>
            <p className="text-primary-foreground/60 mb-10 max-w-md mx-auto leading-relaxed">{t("about.ctaDesc")}</p>
            <Button asChild size="lg" className="rounded-none px-12 py-6 text-sm tracking-[0.15em] uppercase bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <a href="mailto:contact@aliaacare.com">{t("about.writeUs")}<ArrowRight className="ltr:ml-3 rtl:mr-3 w-4 h-4" /></a>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;

