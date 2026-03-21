import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminStore, AdminCollection } from "@/hooks/useAdminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";

const AdminCategories = () => {
  const { collections, products, addCollection, updateCollection, deleteCollection } = useAdminStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminCollection> | null>(null);

  const openNew = () => {
    setEditing({ name: "", description: "", slug: "", active: true, image: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: AdminCollection) => {
    setEditing({ ...c });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing?.name?.trim()) {
      toast({ title: "Erreur", description: "Le nom est obligatoire", variant: "destructive" });
      return;
    }
    const slug = editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (editing.id) {
      updateCollection(editing.id, { ...editing, slug } as Partial<AdminCollection>);
      toast({ title: "Catégorie mise à jour" });
    } else {
      addCollection({
        id: slug,
        name: editing.name,
        slug,
        description: editing.description || "",
        image: "/placeholder.svg",
        active: true,
      });
      toast({ title: "Catégorie ajoutée" });
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const productCount = (colId: string) => products.filter((p) => p.collection === colId || (p.collections && p.collections.includes(colId))).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl text-foreground">Gestion des Catégories</h1>
            <p className="text-sm text-muted-foreground">{collections.length} catégories</p>
          </div>
          <Button onClick={openNew} className="rounded-none gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Ajouter Catégorie
          </Button>
        </div>

        {/* Desktop table */}
        <div className="border border-border rounded-lg overflow-hidden hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nom</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-right p-3 font-medium">Produits</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground max-w-xs truncate">{c.description}</td>
                  <td className="p-3 text-right">{productCount(c.id)}</td>
                  <td className="p-3 text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { deleteCollection(c.id); toast({ title: "Catégorie supprimée" }); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {collections.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune catégorie</p>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {collections.map((c) => (
            <div key={c.id} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{productCount(c.id)} produits</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { deleteCollection(c.id); toast({ title: "Catégorie supprimée" }); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {collections.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune catégorie</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing?.id ? "Modifier" : "Ajouter"} une Catégorie</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: Huiles essentielles" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
              </div>
              <Button onClick={handleSave} className="w-full rounded-none">
                {editing.id ? "Enregistrer" : "Ajouter"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;