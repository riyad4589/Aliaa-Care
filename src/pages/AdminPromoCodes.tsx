import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { usePromoCodes, useAddPromoCode, useDeletePromoCode, PromoCode } from "@/hooks/usePromoCodes";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { usePacks } from "@/hooks/usePacks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Copy, Shuffle, Tag, Calendar, Hash, Search } from "lucide-react";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

interface EditingPromo {
  code: string;
  discount_percent: number;
  applies_to: string;
  product_ids: string[];
  pack_ids: string[];
  max_uses: number | null;
  expires_at: string;
  active: boolean;
}

const defaultPromo: EditingPromo = {
  code: "",
  discount_percent: 10,
  applies_to: "all",
  product_ids: [],
  pack_ids: [],
  max_uses: null,
  expires_at: "",
  active: true,
};

const AdminPromoCodes = () => {
  const { data: promoCodes = [], isLoading } = usePromoCodes();
  const { data: products = [] } = useProducts();
  const { data: packs = [] } = usePacks();
  const addPromo = useAddPromoCode();
  const deletePromo = useDeletePromoCode();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditingPromo>(defaultPromo);
  const [search, setSearch] = useState("");

  const filtered = promoCodes.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = () => {
    setEditing(defaultPromo);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing.code.trim()) {
      toast({ title: "Erreur", description: "Le code est requis", variant: "destructive" });
      return;
    }
    try {
      await addPromo.mutateAsync({
        code: editing.code.toUpperCase().trim(),
        discount_percent: editing.discount_percent,
        applies_to: editing.applies_to,
        product_ids: editing.product_ids,
        pack_ids: editing.pack_ids,
        max_uses: editing.max_uses,
        expires_at: editing.expires_at || null,
        active: editing.active,
      });
      toast({ title: "Code promo créé" });
      setDialogOpen(false);
    } catch {
      toast({ title: "Erreur", description: "Code déjà existant ou erreur serveur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deletePromo.mutateAsync(id);
    toast({ title: "Code promo supprimé" });
  };

  const isExpired = (p: PromoCode) => p.expires_at && new Date(p.expires_at) < new Date();
  const isMaxed = (p: PromoCode) => p.max_uses !== null && p.current_uses >= p.max_uses;

  const getStatusBadge = (p: PromoCode) => {
    if (!p.active) return <Badge variant="secondary">Inactif</Badge>;
    if (isExpired(p)) return <Badge variant="destructive">Expiré</Badge>;
    if (isMaxed(p)) return <Badge variant="destructive">Épuisé</Badge>;
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>;
  };

  const toggleProductId = (id: string) => {
    setEditing((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(id)
        ? prev.product_ids.filter((x) => x !== id)
        : [...prev.product_ids, id],
    }));
  };

  const togglePackId = (id: string) => {
    setEditing((prev) => ({
      ...prev,
      pack_ids: prev.pack_ids.includes(id)
        ? prev.pack_ids.filter((x) => x !== id)
        : [...prev.pack_ids, id],
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="w-6 h-6" />Codes Promo</h1>
            <p className="text-sm text-muted-foreground">{promoCodes.length} code(s) promo</p>
          </div>
          <Button onClick={handleOpen}><Plus className="w-4 h-4 mr-2" />Nouveau Code</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Aucun code promo</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((promo) => (
              <div key={promo.id} className="border border-border rounded-lg p-5 bg-card flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="text-lg font-mono font-bold tracking-wider bg-muted px-3 py-1 rounded">{promo.code}</code>
                    {getStatusBadge(promo)}
                    <Badge variant="outline">-{promo.discount_percent}%</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {promo.current_uses}{promo.max_uses !== null ? `/${promo.max_uses}` : "/∞"} utilisations
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString("fr") : "Sans expiration"}
                    </span>
                    <span>
                      {promo.applies_to === "all" ? "Tous les produits & packs" :
                       promo.applies_to === "products" ? `${promo.product_ids.length} produit(s)` :
                       promo.applies_to === "packs" ? `${promo.pack_ids.length} pack(s)` :
                       `${promo.product_ids.length} produit(s) + ${promo.pack_ids.length} pack(s)`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(promo.code); toast({ title: "Code copié" }); }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(promo.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau Code Promo</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div>
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Code</label>
              <div className="flex gap-2">
                <Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: WELCOME20" className="font-mono tracking-wider" />
                <Button variant="outline" size="icon" onClick={() => setEditing({ ...editing, code: generateCode() })} title="Générer un code">
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Réduction (%)</label>
              <Input type="number" min={1} max={100} value={editing.discount_percent}
                onChange={(e) => setEditing({ ...editing, discount_percent: parseInt(e.target.value) || 0 })} />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">S'applique à</label>
              <Select value={editing.applies_to} onValueChange={(v) => setEditing({ ...editing, applies_to: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits & packs</SelectItem>
                  <SelectItem value="products">Produits spécifiques</SelectItem>
                  <SelectItem value="packs">Packs spécifiques</SelectItem>
                  <SelectItem value="custom">Produits & packs spécifiques</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(editing.applies_to === "products" || editing.applies_to === "custom") && (
              <div>
                <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Produits</label>
                <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {(products as DbProduct[]).map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={editing.product_ids.includes(p.id)} onCheckedChange={() => toggleProductId(p.id)} />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {(editing.applies_to === "packs" || editing.applies_to === "custom") && (
              <div>
                <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Packs</label>
                <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {packs.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={editing.pack_ids.includes(p.id)} onCheckedChange={() => togglePackId(p.id)} />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Date d'expiration (optionnel)</label>
              <Input type="datetime-local" value={editing.expires_at} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Nombre max d'utilisations (vide = illimité)</label>
              <Input type="number" min={1} value={editing.max_uses ?? ""} placeholder="Illimité"
                onChange={(e) => setEditing({ ...editing, max_uses: e.target.value ? parseInt(e.target.value) : null })} />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
              <span className="text-sm">Actif</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button className="flex-1" onClick={handleSave} disabled={addPromo.isPending}>
                {addPromo.isPending ? "Création..." : "Créer le code"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPromoCodes;
