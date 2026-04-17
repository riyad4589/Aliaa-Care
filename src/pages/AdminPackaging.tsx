import { useState, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { usePackaging, useCreatePackaging, useUpdatePackaging, useDeletePackaging, useBulkDeletePackaging, Packaging } from "@/hooks/usePackaging";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Package, AlertTriangle, Loader2, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LOW_STOCK_THRESHOLD = 5;

const emptyForm = { name: "", description: "", image: "/placeholder.svg", cost_price: 0, stock: 0, active: true };

const AdminPackaging = () => {
  const { data: packaging = [], isLoading } = usePackaging();
  const createMut = useCreatePackaging();
  const updateMut = useUpdatePackaging();
  const deleteMut = useDeletePackaging();
  const bulkDeleteMut = useBulkDeletePackaging();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [packagingToDelete, setPackagingToDelete] = useState<string | null>(null);

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

  const handleDelete = async () => {
    try {
      if (isBulkDeleting) {
        await bulkDeleteMut.mutateAsync(selectedIds);
        toast({ title: `${selectedIds.length} emballages supprimés` });
        setSelectedIds([]);
        setIsBulkDeleting(false);
      } else if (packagingToDelete) {
        await deleteMut.mutateAsync(packagingToDelete);
        toast({ title: "Emballage supprimé" });
        setPackagingToDelete(null);
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === packaging.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(packaging.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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
            <Button onClick={openCreate} className="gap-2 rounded-none flex-1 sm:flex-initial">
              <Plus className="w-4 h-4" /> Ajouter
            </Button>
          </div>
        </div>

        {packaging.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectedIds.length === packaging.length}
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
              Tout sélectionner
            </label>
          </div>
        )}

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
          {packaging.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <Card key={p.id} className={`transition-colors ${!p.active ? "opacity-50" : ""} ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(p.id)}
                      className="mt-1"
                    />
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
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setPackagingToDelete(p.id)}>
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
          )})}
          {packaging.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucun emballage</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{editing ? "Modifier l'emballage" : "Nouvel emballage"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Text Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nom de l'emballage *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Boîte kraft luxe" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Détails sur les dimensions ou le matériau..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Coût (DH)</label>
                    <Input type="number" min={0} step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Stock actuel</label>
                    <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <span className="text-sm font-medium">Emballage disponible</span>
                </div>
              </div>

              {/* Right Column: Image Upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium mb-1.5 block">Image de l'emballage</label>
                <div className="p-6 border-2 border-dashed border-border rounded-xl bg-muted/10 flex flex-col items-center justify-center text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  
                  {form.image && form.image !== "/placeholder.svg" ? (
                    <div className="relative w-full aspect-square max-w-[200px] mb-4 group shadow-md rounded-lg overflow-hidden border border-border">
                      <img src={form.image} alt="Aperçu" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          Changer l'image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Package className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                  )}

                  <Button
                    type="button"
                    variant={form.image && form.image !== "/placeholder.svg" ? "ghost" : "outline"}
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Importation..." : form.image && form.image !== "/placeholder.svg" ? "Remplacer" : "Importer une image"}
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wider">Format: JPG, PNG, WEBP</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-border">
              <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} className="flex-1 rounded-none h-11" disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editing ? "Enregistrer les modifications" : "Créer l'emballage"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={!!packagingToDelete || isBulkDeleting} 
        onOpenChange={(open) => { if (!open) { setPackagingToDelete(null); setIsBulkDeleting(false); }}}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="font-serif text-xl">
              {isBulkDeleting ? `Supprimer ${selectedIds.length} emballages` : "Confirmer la suppression"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDeleting 
                ? `Êtes-vous sûr de vouloir supprimer ces ${selectedIds.length} emballages ?` 
                : "Êtes-vous sûr de vouloir supprimer cet emballage ?"
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

export default AdminPackaging;
