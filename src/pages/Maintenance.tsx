import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import typoImg from "@/assets/TYPO02 PNG.png";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="z-10 text-center space-y-10 max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <img
            src={typoImg}
            alt="AliaaCare Logo"
            className="h-24 md:h-32 mx-auto object-contain drop-shadow-sm pointer-events-none"
          />
        </motion.div>

        <div className="space-y-6">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 tracking-tight">
            Site en maintenance
          </h1>

          <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed">
            Nous mettons actuellement à jour notre boutique pour vous offrir une expérience encore plus exceptionnelle.
            <br className="hidden md:block" />Nous serons de retour très bientôt.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="pt-8"
        >
          <div className="w-16 h-1 bg-primary/20 mx-auto rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary w-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>

      <FloatingRandomMessage />
    </div>
  );
};

export const FloatingRandomMessage = ({ highVisibility = false }: { highVisibility?: boolean }) => {
  const [pos, setPos] = useState({ x: "50vw", y: "50vh" });

  useEffect(() => {
    const moveRandomly = () => {
      setPos({
        // 0 to 80vw/vh to prevent horizontal/vertical scrollbars or clipping
        x: `${Math.floor(Math.random() * 80)}vw`,
        y: `${Math.floor(Math.random() * 85)}vh`,
      });
    };

    moveRandomly();
    const interval = setInterval(moveRandomly, 3500); // Bouge toutes les 3.5 secondes
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 pointer-events-none"
      animate={{ x: pos.x, y: pos.y }}
      transition={{
        duration: 3.5,
        ease: "easeInOut",
      }}
    >
      <p className={`font-bold py-2 px-6 rounded-full shadow-lg backdrop-blur-sm animate-pulse whitespace-nowrap ${
        highVisibility 
          ? "bg-primary text-primary-foreground text-base md:text-lg shadow-2xl border-2 border-white/20" 
          : "text-sm md:text-base text-primary bg-primary/10 border border-primary/20"
      }`}>
        Veuillez contacter l'équipe dev pour toute assistance.
      </p>
    </motion.div>
  );
};

export default Maintenance;
