import { useState } from "react";

import { usePacks, useAddPack, useUpdatePack, useDeletePack, useBulkDeletePacks, useTogglePackActive, DbPack } from "@/hooks/usePacks";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Package, Loader2, Search, X, AlertTriangle } from "lucide-react";

interface EditingPack {
  id?: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  price: number;
  image: string;
  active: boolean;
  featured: boolean;
  product_ids: string[];
}

const emptyPack: EditingPack = {
  name: "", slug: "", description: "", long_description: "",
  price: 0, image: "/placeholder.svg", active: true, featured: false, product_ids: [],
};

const AdminPacks = () => {
  const { data: packs = [], isLoading } = usePacks();
  const { data: products = [] } = useProducts();
  const addPack = useAddPack();
  const updatePack = useUpdatePack();
  const deletePack = useDeletePack();
  const toggleActive = useTogglePackActive();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditingPack | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const bulkDeletePacks = useBulkDeletePacks();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [packToDelete, setPackToDelete] = useState<string | null>(null);

  const filtered = packs.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleProduct = (pid: string) => {
    if (!editing) return;
    const ids = editing.product_ids.includes(pid)
      ? editing.product_ids.filter((id) => id !== pid)
      : [...editing.product_ids, pid];
    setEditing({ ...editing, product_ids: ids });
  };

  const handleDelete = async () => {
    try {
      if (isBulkDeleting) {
        await bulkDeletePacks.mutateAsync(selectedIds);
        toast({ title: `${selectedIds.length} packs supprimés` });
        setSelectedIds([]);
        setIsBulkDeleting(false);
      } else if (packToDelete) {
        await deletePack.mutateAsync(packToDelete);
        toast({ title: "Pack supprimé" });
        setPackToDelete(null);
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

  const handleSave = async () => {
    if (!editing?.name || !editing.price || editing.product_ids.length === 0) {
      toast({ title: "Erreur", description: "Remplissez nom, prix et sélectionnez des produits", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    try {
      if (editing.id) {
        await updatePack.mutateAsync({
          id: editing.id,
          updates: { name: editing.name, slug, description: editing.description, long_description: editing.long_description, price: editing.price, image: editing.image, active: editing.active, featured: editing.featured },
          product_ids: editing.product_ids,
        });
        toast({ title: "Pack mis à jour" });
      } else {
        await addPack.mutateAsync({
          name: editing.name, slug, description: editing.description, long_description: editing.long_description,
          price: editing.price, image: editing.image, active: editing.active, featured: editing.featured,
          product_ids: editing.product_ids,
        });
        toast({ title: "Pack ajouté" });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => { setEditing({ ...emptyPack }); setDialogOpen(true); };
  const openEdit = (p: DbPack) => {
    setEditing({
      id: p.id, name: p.name, slug: p.slug, description: p.description,
      long_description: p.long_description, price: p.price, image: p.image,
      active: p.active, featured: p.featured,
      product_ids: p.items.map((i) => i.product_id),
    });
    setDialogOpen(true);
  };

  if (isLoading) {
    return <><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div></>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Gestion des Packs</h1>
            <p className="text-sm text-muted-foreground">{packs.length} packs</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsBulkDeleting(true)}
                className="rounded-none gap-2"
              >
                <Trash2 className="w-4 h-4" /> Supprimer ({selectedIds.length})
              </Button>
            )}
            <Button onClick={openNew} className="rounded-none gap-2 flex-1 sm:flex-initial">
              <Plus className="w-4 h-4" /> Ajouter Pack
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 sm:pl-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un pack..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-9" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left p-3 font-medium">Pack</th>
                <th className="text-left p-3 font-medium">Produits</th>
                <th className="text-right p-3 font-medium">Prix</th>
                <th className="text-center p-3 font-medium">Actif</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="p-3 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.items.length} produits</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {p.items.map((i) => i.product_name).join(", ")}
                    </td>
                    <td className="p-3 text-right font-medium">{p.price} DH</td>
                    <td className="p-3 text-center">
                      <Switch checked={p.active} onCheckedChange={() => toggleActive.mutate({ id: p.id, active: !p.active })} />
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setPackToDelete(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun pack trouvé</p>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="border border-border rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.items.length} produits · {p.price} DH</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.includes(p.id)}
                    onCheckedChange={() => toggleSelect(p.id)}
                  />
                  <div className="flex items-center gap-2">
                    <Switch checked={p.active} onCheckedChange={() => toggleActive.mutate({ id: p.id, active: !p.active })} />
                    <span className="text-xs text-muted-foreground">{p.active ? "Actif" : "Inactif"}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setPackToDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{editing?.id ? "Modifier" : "Ajouter"} un Pack</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Nom du pack *</label>
                    <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: Pack Rituel Matinal" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Prix du pack (DH) *</label>
                    <Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Description courte</label>
                    <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Description longue</label>
                    <Textarea value={editing.long_description} onChange={(e) => setEditing({ ...editing, long_description: e.target.value })} rows={4} />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Image du pack (URL)</label>
                    <Input 
                      value={editing.image} 
                      onChange={(e) => setEditing({ ...editing, image: e.target.value })} 
                      placeholder="https://exemple.com/image.jpg" 
                    />
                    {editing.image && editing.image !== "/placeholder.svg" && (
                      <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden border border-border bg-muted/10">
                        <img 
                          src={editing.image} 
                          alt="Aperçu" 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 p-3 bg-muted/30 rounded-lg border border-border">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: !!v })} />
                      Mettre en vedette
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: !!v })} />
                      Pack actif
                    </label>
                  </div>
                </div>

                {/* Right Column: Products Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Produits inclus dans le pack *</label>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      {editing.product_ids.length} sélectionné(s)
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto border border-border rounded-lg p-3 bg-muted/10">
                    {products.filter(p => p.active).map((p) => (
                      <label key={p.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-background p-2 rounded-md transition-colors border border-transparent hover:border-border">
                        <Checkbox
                          checked={editing.product_ids.includes(p.id)}
                          onCheckedChange={() => toggleProduct(p.id)}
                        />
                        <div className="relative w-10 h-10 rounded overflow-hidden border border-border shrink-0">
                          <img src={p.images[0] || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.price} DH</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {editing.product_ids.length > 0 && (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Valeur totale des produits :</span>
                        <span className="font-bold line-through text-muted-foreground/70">
                          {products.filter(p => editing.product_ids.includes(p.id)).reduce((s, p) => s + p.price, 0)} DH
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="font-medium text-primary">Économie réalisée :</span>
                        <span className="font-bold text-primary">
                          {products.filter(p => editing.product_ids.includes(p.id)).reduce((s, p) => s + p.price, 0) - editing.price} DH
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-border">
                <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 rounded-none gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing.id ? "Mettre à jour le pack" : "Créer le pack"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!packToDelete || isBulkDeleting}
        onOpenChange={(open) => { if (!open) { setPackToDelete(null); setIsBulkDeleting(false); } }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="font-serif text-xl">
              {isBulkDeleting ? `Supprimer ${selectedIds.length} packs` : "Confirmer la suppression"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDeleting
                ? `Êtes-vous sûr de vouloir supprimer ces ${selectedIds.length} packs ?`
                : "Êtes-vous sûr de vouloir supprimer ce pack ?"
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
    </>
  );
};

export default AdminPacks;

