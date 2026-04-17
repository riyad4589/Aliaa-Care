import { MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const phoneNumber = "212652535301"; // Remplacez par votre numéro réel

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href={`https://wa.me/${phoneNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-24 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors group"
          title="Contactez-nous sur WhatsApp"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-foreground text-xs font-medium px-3 py-2 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ltr:origin-right rtl:origin-left ltr:mr-4 rtl:ml-4">
            Besoin d'aide ? Contactez-nous !
            <div className="absolute top-1/2 -translate-y-1/2 ltr:left-full rtl:right-full border-8 border-transparent ltr:border-l-white rtl:border-r-white" />
          </div>
        </motion.a>
      )}
    </AnimatePresence>
  );
};
