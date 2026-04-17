import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { usePromoCodes, useAddPromoCode, useUpdatePromoCode, useDeletePromoCode, useBulkDeletePromoCodes, PromoCode } from "@/hooks/usePromoCodes";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { usePacks } from "@/hooks/usePacks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Copy, Shuffle, Tag, Calendar, Hash, Search, Pencil, AlertTriangle } from "lucide-react";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

interface EditingPromo {
  id?: string;
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
  const updatePromo = useUpdatePromoCode();
  const deletePromo = useDeletePromoCode();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditingPromo>(defaultPromo);
  const [search, setSearch] = useState("");
  const bulkDeletePromos = useBulkDeletePromoCodes();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<string | null>(null);

  const isEditMode = !!editing.id;

  const filtered = promoCodes.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = () => {
    setEditing(defaultPromo);
    setDialogOpen(true);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditing({
      id: promo.id,
      code: promo.code,
      discount_percent: promo.discount_percent,
      applies_to: promo.applies_to,
      product_ids: promo.product_ids || [],
      pack_ids: promo.pack_ids || [],
      max_uses: promo.max_uses,
      expires_at: promo.expires_at ? promo.expires_at.slice(0, 16) : "",
      active: promo.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing.code.trim()) {
      toast({ title: "Erreur", description: "Le code est requis", variant: "destructive" });
      return;
    }
    try {
      if (isEditMode) {
        await updatePromo.mutateAsync({
          id: editing.id!,
          code: editing.code.toUpperCase().trim(),
          discount_percent: editing.discount_percent,
          applies_to: editing.applies_to,
          product_ids: editing.product_ids,
          pack_ids: editing.pack_ids,
          max_uses: editing.max_uses,
          expires_at: editing.expires_at || null,
          active: editing.active,
        });
        toast({ title: "Code promo modifié" });
      } else {
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
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Erreur", description: "Code déjà existant ou erreur serveur", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      if (isBulkDeleting) {
        await bulkDeletePromos.mutateAsync(selectedIds);
        toast({ title: `${selectedIds.length} codes promos supprimés` });
        setSelectedIds([]);
        setIsBulkDeleting(false);
      } else if (promoToDelete) {
        await deletePromo.mutateAsync(promoToDelete);
        toast({ title: "Code promo supprimé" });
        setPromoToDelete(null);
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const isExpired = (p: PromoCode) => p.expires_at && new Date(p.expires_at) < new Date();
  const isMaxed = (p: PromoCode) => p.max_uses !== null && p.current_uses >= p.max_uses;

  const getStatusBadge = (p: PromoCode) => {
    if (!p.active) return <Badge variant="secondary">Inactif</Badge>;
    if (isExpired(p)) return <Badge variant="destructive">Expiré</Badge>;
    if (isMaxed(p)) return <Badge variant="destructive">Épuisé</Badge>;
    return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Actif</Badge>;
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

  const isSaving = addPromo.isPending || updatePromo.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="w-6 h-6" />Codes Promo</h1>
            <p className="text-sm text-muted-foreground">{promoCodes.length} code(s) promo</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => setIsBulkDeleting(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer ({selectedIds.length})
              </Button>
            )}
            <Button onClick={handleOpen} className="flex-1 md:flex-initial">
              <Plus className="w-4 h-4 mr-2" />Nouveau Code
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={filtered.length > 0 && selectedIds.length === filtered.length}
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
              Tout sélectionner
            </label>
          </div>
        </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Aucun code promo</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((promo) => {
              const isSelected = selectedIds.includes(promo.id);
              return (
                <div key={promo.id} className={`border rounded-lg p-5 bg-card flex flex-col md:flex-row md:items-center gap-4 transition-colors ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border'}`}>
                  <div className="shrink-0">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(promo.id)}
                    />
                  </div>
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
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(promo)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(promo.code); toast({ title: "Code copié" }); }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setPromoToDelete(promo.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{isEditMode ? "Modifier le Code Promo" : "Nouveau Code Promo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: General Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Code Promo *</label>
                  <div className="flex gap-2">
                    <Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                      placeholder="Ex: WELCOME20" className="font-mono tracking-wider h-11 text-lg" />
                    {!isEditMode && (
                      <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => setEditing({ ...editing, code: generateCode() })} title="Générer un code">
                        <Shuffle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Réduction (%)</label>
                    <Input type="number" min={1} max={100} value={editing.discount_percent}
                      onChange={(e) => setEditing({ ...editing, discount_percent: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Nombre max d'utilisations</label>
                    <Input type="number" min={1} value={editing.max_uses ?? ""} placeholder="Illimité"
                      onChange={(e) => setEditing({ ...editing, max_uses: e.target.value ? parseInt(e.target.value) : null })} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Date d'expiration</label>
                  <Input type="datetime-local" value={editing.expires_at} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Type d'application</label>
                  <Select value={editing.applies_to} onValueChange={(v) => setEditing({ ...editing, applies_to: v })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les produits & packs</SelectItem>
                      <SelectItem value="products">Produits spécifiques</SelectItem>
                      <SelectItem value="packs">Packs spécifiques</SelectItem>
                      <SelectItem value="custom">Produits & packs spécifiques</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                  <span className="text-sm font-medium">Activer ce code promo</span>
                </div>
              </div>

              {/* Right Column: Targets Selection */}
              <div className="space-y-4">
                {(editing.applies_to === "products" || editing.applies_to === "custom") && (
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Sélectionner les Produits</label>
                    <div className="border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-1 bg-muted/10">
                      {(products as DbProduct[]).map((p) => (
                        <label key={p.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-background p-1.5 rounded-md transition-colors">
                          <Checkbox checked={editing.product_ids.includes(p.id)} onCheckedChange={() => toggleProductId(p.id)} />
                          <span className="truncate">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {(editing.applies_to === "packs" || editing.applies_to === "custom") && (
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Sélectionner les Packs</label>
                    <div className="border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-1 bg-muted/10">
                      {packs.map((p) => (
                        <label key={p.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-background p-1.5 rounded-md transition-colors">
                          <Checkbox checked={editing.pack_ids.includes(p.id)} onCheckedChange={() => togglePackId(p.id)} />
                          <span className="truncate">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {editing.applies_to === "all" && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-lg border border-dashed border-border">
                    <Tag className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Ce code s'appliquera automatiquement à l'ensemble du catalogue.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-border">
              <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button className="flex-1 rounded-none h-11" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Enregistrement..." : isEditMode ? "Enregistrer les modifications" : "Créer le code promo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={!!promoToDelete || isBulkDeleting} 
        onOpenChange={(open) => { if (!open) { setPromoToDelete(null); setIsBulkDeleting(false); }}}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="font-serif text-xl">
              {isBulkDeleting ? `Supprimer ${selectedIds.length} codes promos` : "Confirmer la suppression"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDeleting 
                ? `Êtes-vous sûr de vouloir supprimer ces ${selectedIds.length} codes promos ?` 
                : "Êtes-vous sûr de vouloir supprimer ce code promo ?"
              } <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-none">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-none bg-destructive hover:bg-destructive/90">
              Supprimer {isBulkDeleting ? `(${selectedIds.length})` : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPromoCodes;
