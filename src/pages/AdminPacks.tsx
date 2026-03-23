import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { usePacks, useAddPack, useUpdatePack, useDeletePack, useTogglePackActive, DbPack } from "@/hooks/usePacks";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, Loader2, Search, X } from "lucide-react";

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

  const filtered = packs.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleProduct = (pid: string) => {
    if (!editing) return;
    const ids = editing.product_ids.includes(pid)
      ? editing.product_ids.filter((id) => id !== pid)
      : [...editing.product_ids, pid];
    setEditing({ ...editing, product_ids: ids });
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
    return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl text-foreground">Gestion des Packs</h1>
            <p className="text-sm text-muted-foreground">{packs.length} packs</p>
          </div>
          <Button onClick={openNew} className="rounded-none gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Ajouter Pack
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un pack..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-9" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="border border-border rounded-lg overflow-hidden hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Pack</th>
                <th className="text-left p-3 font-medium">Produits</th>
                <th className="text-right p-3 font-medium">Prix</th>
                <th className="text-center p-3 font-medium">Actif</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20">
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
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { deletePack.mutateAsync(p.id); toast({ title: "Pack supprimé" }); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
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
                <div className="flex items-center gap-2">
                  <Switch checked={p.active} onCheckedChange={() => toggleActive.mutate({ id: p.id, active: !p.active })} />
                  <span className="text-xs text-muted-foreground">{p.active ? "Actif" : "Inactif"}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { deletePack.mutateAsync(p.id); toast({ title: "Pack supprimé" }); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing?.id ? "Modifier" : "Ajouter"} un Pack</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Prix du pack (DH) *</label>
                <Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Description courte</label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Description longue</label>
                <Textarea value={editing.long_description} onChange={(e) => setEditing({ ...editing, long_description: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Produits inclus *</label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3">
                  {products.filter(p => p.active).map((p) => (
                    <label key={p.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                      <Checkbox
                        checked={editing.product_ids.includes(p.id)}
                        onCheckedChange={() => toggleProduct(p.id)}
                      />
                      <img src={p.images[0] || "/placeholder.svg"} alt={p.name} className="w-8 h-8 rounded object-cover" />
                      <span className="flex-1">{p.name}</span>
                      <span className="text-muted-foreground">{p.price} DH</span>
                    </label>
                  ))}
                </div>
                {editing.product_ids.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Total produits séparés : {products.filter(p => editing.product_ids.includes(p.id)).reduce((s, p) => s + p.price, 0)} DH
                  </p>
                )}
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: !!v })} />
                  Vedette
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: !!v })} />
                  Actif
                </label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full rounded-none gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing.id ? "Mettre à jour" : "Créer le pack"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPacks;
