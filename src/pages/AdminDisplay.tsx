import { AdminLayout } from "@/components/AdminLayout";
import { useAdminStore } from "@/hooks/useAdminStore";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Megaphone } from "lucide-react";
import { useState } from "react";

const AdminDisplay = () => {
  const { products, collections, toggleProductVisible, updateProduct, banner, updateBanner } = useAdminStore();
  const { toast } = useToast();
  const [bannerMessage, setBannerMessage] = useState(banner.message);

  const handleBannerSave = () => {
    updateBanner({ ...banner, message: bannerMessage });
    toast({ title: "Bannière mise à jour" });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Gestion de l'Affichage Client</h1>
          <p className="text-sm text-muted-foreground">Contrôlez ce que vos clients voient sur le site</p>
        </div>

        {/* Banner */}
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg">Bannière d'accueil</h2>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={banner.enabled} onCheckedChange={(checked) => updateBanner({ ...banner, enabled: checked })} />
            <span className="text-sm">{banner.enabled ? "Activée" : "Désactivée"}</span>
          </div>
          <Textarea
            value={bannerMessage}
            onChange={(e) => setBannerMessage(e.target.value)}
            placeholder="Message de la bannière..."
            rows={2}
          />
          <Button onClick={handleBannerSave} className="rounded-none" size="sm">Enregistrer</Button>
        </div>

        {/* Product visibility */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 p-4">
            <h2 className="font-serif text-lg">Visibilité des Produits</h2>
            <p className="text-xs text-muted-foreground mt-1">Activez/désactivez la visibilité de chaque produit côté client</p>
          </div>
          <div className="divide-y divide-border">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.price} € · Stock: {p.stock}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.visible ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Switch checked={p.visible} onCheckedChange={() => toggleProductVisible(p.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product display info editing */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 p-4">
            <h2 className="font-serif text-lg">Informations Affichées</h2>
            <p className="text-xs text-muted-foreground mt-1">Modifiez les informations visibles par les clients</p>
          </div>
          <div className="divide-y divide-border">
            {products.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <p className="font-medium text-sm">{p.name}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Nom affiché</label>
                    <Input
                      defaultValue={p.name}
                      onBlur={(e) => updateProduct(p.id, { name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Description courte</label>
                    <Input
                      defaultValue={p.description}
                      onBlur={(e) => updateProduct(p.id, { description: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDisplay;
