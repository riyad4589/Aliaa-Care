import { motion } from "framer-motion";
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
        >
          <img
            src={typoImg}
            alt="AliaaCare Logo"
            className="h-32 md:h-48 mx-auto object-contain drop-shadow-sm pointer-events-none"
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
    </div>
  );
};

export default Maintenance;
