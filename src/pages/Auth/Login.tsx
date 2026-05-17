import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import coffretImg from "@/assets/coffret-aliaa-phone.webp";
import { FloatingRandomMessage } from "@/pages/Maintenance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: error.message,
        });
      } else if (data.user) {
        // Fetch role to verify admin status
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || profile?.role !== "admin") {
          toast({
            variant: "destructive",
            title: "Accès refusé",
            description: "Ce compte n'a pas les droits d'administration.",
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans votre espace d'administration.",
        });
        
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:block relative">
        <img
          src={coffretImg}
          alt="ALIAA Natural Care"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl mb-6">ALIAA Natural Care</h1>
            <p className="text-lg text-white/80 max-w-md italic">
              "La nature au service de votre sérénité."
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-linen/30">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md bg-white p-8 md:p-12 shadow-xl border border-border/50"
        >
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-foreground mb-2">Connexion</h2>
            <p className="text-muted-foreground">Accédez à votre espace sécurisé</p>
          </div>

          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-600 text-sm flex flex-col gap-2">
            <span className="font-semibold flex items-center gap-2">
               <Lock className="w-4 h-4" /> 
               Maintenance en cours
            </span>
            <p>L'accès administrateur est temporairement suspendu pendant la mise à jour du système.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="opacity-50">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@aliaacare.com"
                  className="pl-10 cursor-not-allowed opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="opacity-50">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 opacity-50 cursor-not-allowed"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground/50 cursor-not-allowed"
                  disabled
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button
              type="button"
              className="w-full btn-premium py-6 uppercase tracking-widest text-xs h-auto opacity-50 cursor-not-allowed"
              disabled
            >
              <Lock className="mr-2 h-4 w-4" />
              Accès bloqué
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              disabled
              className="text-sm text-muted-foreground/50 underline decoration-dotted underline-offset-4 cursor-not-allowed"
            >
              Retour à la boutique
            </button>
          </div>
        </motion.div>
      </div>

      <FloatingRandomMessage highVisibility />
    </div>
  );
};

export default Login;
