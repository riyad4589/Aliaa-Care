import { useState, useEffect } from "react";
import { useBanner, useUpdateBanner, BannerSettings } from "@/hooks/useBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Layout, Type, Palette, MoveHorizontal, AlertTriangle } from "lucide-react";

const AdminSettings = () => {
  const { data: banner, isLoading } = useBanner();
  const updateBanner = useUpdateBanner();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<Partial<BannerSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setSettings(banner);
    }
  }, [banner]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBanner.mutateAsync(settings);
      toast({ title: "Paramètres enregistrés", description: "La barre d'annonce a été mise à jour." });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les paramètres.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container-narrow py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Paramètres du site</h1>
        <p className="text-muted-foreground">Gérez l'apparence et les messages globaux de votre boutique.</p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            <CardTitle className="font-serif text-xl">Barre d'annonce</CardTitle>
          </div>
          <CardDescription>Configurez le message qui s'affiche tout en haut du site.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Activer la barre</label>
              <p className="text-xs text-muted-foreground">Afficher ou masquer la barre d'annonce pour les clients.</p>
            </div>
            <Switch 
              checked={settings.enabled} 
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })} 
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                Message de la barre
              </label>
              <Input 
                value={settings.message || ""} 
                onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                placeholder="Ex: Livraison gratuite partout au Maroc ! 🚚"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  Couleur du texte
                </label>
                <div className="flex gap-3">
                  <input 
                    type="color"
                    value={settings.text_color || "#FFFFFF"} 
                    onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                    className="w-10 h-10 rounded border border-border shadow-sm shrink-0 cursor-pointer p-0 bg-transparent" 
                  />
                  <Input 
                    value={settings.text_color || "#FFFFFF"} 
                    onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                    placeholder="#FFFFFF"
                    className="font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MoveHorizontal className="w-4 h-4 text-muted-foreground" />
                  Animation de défilement
                </label>
                <div className="flex items-center gap-3 h-10 px-3 bg-muted/20 rounded border border-border/50">
                  <Switch 
                    checked={settings.scrolling_enabled} 
                    onCheckedChange={(checked) => setSettings({ ...settings, scrolling_enabled: checked })} 
                  />
                  <span className="text-xs text-muted-foreground">
                    {settings.scrolling_enabled ? "Activée (Défilement horizontal)" : "Désactivée (Fixe)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2 px-8"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer les modifications
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden border-destructive/20">
        <CardHeader className="bg-destructive/5 border-b border-destructive/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <CardTitle className="font-serif text-xl text-destructive">Mode Maintenance</CardTitle>
          </div>
          <CardDescription>Activer le mode maintenance rendra le site inaccessible pour les clients.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Activer la maintenance</label>
              <p className="text-xs text-muted-foreground">Bloque l'accès au site client et affiche la page de maintenance.</p>
            </div>
            <Switch 
              checked={settings.maintenance_mode || false} 
              onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })} 
            />
          </div>

          <div className="pt-4 border-t border-border/50 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              variant="destructive"
              className="gap-2 px-8"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer l'état du site
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Aperçu en direct</h3>
        <div 
          className="py-2 overflow-hidden border border-primary/20 text-center rounded bg-primary"
          style={{ color: settings.text_color }}
        >
          {settings.scrolling_enabled ? (
            <div className="flex whitespace-nowrap animate-scroll">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] px-8">
                  {settings.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
              {settings.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
