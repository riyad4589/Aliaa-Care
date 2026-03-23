import { useState, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { usePackaging, useCreatePackaging, useUpdatePackaging, useDeletePackaging, Packaging } from "@/hooks/usePackaging";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, AlertTriangle, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LOW_STOCK_THRESHOLD = 5;

const emptyForm = { name: "", description: "", image: "/placeholder.svg", cost_price: 0, stock: 0, active: true };

const AdminPackaging = () => {
  const { data: packaging = [], isLoading } = usePackaging();
  const createMut = useCreatePackaging();
  const updateMut = useUpdatePackaging();
  const deleteMut = useDeletePackaging();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Packaging | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("packaging-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("packaging-images").getPublicUrl(path);
      setForm(f => ({ ...f, image: data.publicUrl }));
      toast({ title: "Image importée" });
    } catch {
      toast({ title: "Erreur d'upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const lowStock = packaging.filter((p) => p.active && p.stock < LOW_STOCK_THRESHOLD);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Packaging) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      image: p.image || "/placeholder.svg",
      cost_price: p.cost_price,
      stock: p.stock,
      active: p.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Le nom est requis", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...form });
        toast({ title: "Emballage modifié" });
      } else {
        await createMut.mutateAsync(form);
        toast({ title: "Emballage créé" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet emballage ?")) return;
    await deleteMut.mutateAsync(id);
    toast({ title: "Emballage supprimé" });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl text-foreground">Gestion des Emballages</h1>
            <p className="text-sm text-muted-foreground">{packaging.length} emballage(s)</p>
          </div>
          <Button onClick={openCreate} className="gap-2 rounded-none">
            <Plus className="w-4 h-4" /> Ajouter
          </Button>
        </div>

        {lowStock.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Stock faible : {lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packaging.map((p) => (
            <Card key={p.id} className={!p.active ? "opacity-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={p.image || "/placeholder.svg"}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{p.name}</h3>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{p.cost_price} DH</Badge>
                      <Badge
                        variant={p.stock < LOW_STOCK_THRESHOLD ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        Stock: {p.stock}
                      </Badge>
                      {!p.active && <Badge variant="outline" className="text-xs">Inactif</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {packaging.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucun emballage</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'emballage" : "Nouvel emballage"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Boîte kraft" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium">URL Image</label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Coût (DH)</label>
                <Input type="number" min={0} value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <span className="text-sm">Actif</span>
            </div>
            <Button onClick={handleSave} className="w-full rounded-none" disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Modifier" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPackaging;
