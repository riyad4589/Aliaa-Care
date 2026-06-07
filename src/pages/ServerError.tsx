import { motion } from "framer-motion";
import { Leaf, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServerError = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-linen text-zinc-850 font-sans px-4 select-none">
      
      {/* Central Card Container */}
      <div className="w-full max-w-lg text-center relative z-10">
        
        {/* Soft, warm-glowing backdrop behind the text */}
        <div className="absolute inset-0 bg-[#f4f6f0]/60 blur-3xl -z-10 rounded-full scale-110" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Elegant Botanical Icon */}
          <motion.div 
            initial={{ rotate: -15, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-8 shadow-sm"
          >
            <Leaf className="w-7 h-7 text-emerald-800 animate-pulse" style={{ animationDuration: '3s' }} />
          </motion.div>

          {/* Large elegant serif 404 */}
          <h1 className="font-serif text-8xl md:text-9xl text-emerald-850/20 font-light tracking-wide mb-2">
            404
          </h1>

          {/* Error Message */}
          <h2 className="font-serif text-2xl md:text-3xl text-emerald-900 font-medium tracking-tight mb-4">
            Serveur Inaccessible
          </h2>

          <p className="text-zinc-600 max-w-sm mx-auto text-sm md:text-base leading-relaxed mb-8 font-light">
          </p>

          {/* Luxury styled button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleRetry}
              className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-none px-8 py-3 h-12 transition-all duration-300 font-serif tracking-wider text-sm flex items-center gap-2.5 shadow-sm active:bg-emerald-950"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              RÉESSAYER LA CONNEXION
            </Button>
          </motion.div>

        </motion.div>
      </div>

      {/* Footer / Copyright */}
      <footer className="absolute bottom-8 left-0 right-0 text-center text-[10px] text-emerald-900/40 uppercase tracking-widest font-mono">
        Aliaa Natural Care
      </footer>

    </div>
  );
};

export default ServerError;
