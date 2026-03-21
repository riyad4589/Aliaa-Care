import { useState, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct, useToggleProductActive, uploadProductImage, DbProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertTriangle, Package, Upload, X, Loader2, Search } from "lucide-react";

interface EditingProduct {
  id?: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  long_description: string;
  materials: string;
  weight?: number;
  stock: number;
  active: boolean;
  visible: boolean;
  featured: boolean;
  is_new: boolean;
  images: string[];
  category_ids: string[];
}

const emptyProduct: EditingProduct = {
  name: "", slug: "", price: 0, description: "", long_description: "",
  materials: "", weight: undefined, images: [], stock: 10, active: true, visible: true,
  featured: false, is_new: false, category_ids: [],
};

const AdminProducts = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lowStock = products.filter((p) => p.stock < 5 && p.active);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProduct) return;
    setUploading(true);
    try {
      const newImages = [...editingProduct.images];
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file);
        newImages.push(url);
      }
      setEditingProduct({ ...editingProduct, images: newImages });
    } catch (err) {
      toast({ title: "Erreur upload", description: "Impossible d'uploader l'image", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    if (!editingProduct) return;
    const newImages = [...editingProduct.images];
    newImages.splice(index, 1);
    setEditingProduct({ ...editingProduct, images: newImages });
  };

  const toggleCategory = (catId: string) => {
    if (!editingProduct) return;
    const current = editingProduct.category_ids;
    const updated = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId];
    setEditingProduct({ ...editingProduct, category_ids: updated });
  };

  const handleSave = async () => {
    if (!editingProduct?.name || editingProduct.category_ids.length === 0 || !editingProduct.price) {
      toast({ title: "Erreur", description: "Remplissez les champs obligatoires (nom, catégorie, prix)", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = editingProduct.slug || editingProduct.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    try {
      if (editingProduct.id) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          updates: {
            name: editingProduct.name,
            slug,
            price: editingProduct.price,
            description: editingProduct.description,
            long_description: editingProduct.long_description,
            materials: editingProduct.materials,
            weight: editingProduct.weight || null,
            stock: editingProduct.stock,
            active: editingProduct.active,
            visible: editingProduct.visible,
            featured: editingProduct.featured,
            is_new: editingProduct.is_new,
          },
          images: editingProduct.images,
          category_ids: editingProduct.category_ids,
        });
        toast({ title: "Produit mis à jour" });
      } else {
        await addProduct.mutateAsync({
          name: editingProduct.name,
          slug,
          price: editingProduct.price,
          description: editingProduct.description,
          long_description: editingProduct.long_description,
          materials: editingProduct.materials,
          weight: editingProduct.weight,
          stock: editingProduct.stock,
          active: editingProduct.active,
          visible: editingProduct.visible,
          featured: editingProduct.featured,
          is_new: editingProduct.is_new,
          images: editingProduct.images.length > 0 ? editingProduct.images : ["/placeholder.svg"],
          category_ids: editingProduct.category_ids,
        });
        toast({ title: "Produit ajouté" });
      }
      setDialogOpen(false);
      setEditingProduct(null);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => { setEditingProduct({ ...emptyProduct }); setDialogOpen(true); };
  const openEdit = (p: DbProduct) => {
    setEditingProduct({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      description: p.description || "",
      long_description: p.long_description || "",
      materials: p.materials || "",
      weight: p.weight ?? undefined,
      stock: p.stock,
      active: p.active,
      visible: p.visible,
      featured: p.featured ?? false,
      is_new: p.is_new ?? false,
      images: p.images,
      category_ids: p.category_ids,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct.mutateAsync(id);
    toast({ title: "Produit supprimé" });
  };

  const handleToggleActive = (id: string, current: boolean) => {
    toggleActive.mutate({ id, active: !current });
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
            <h1 className="font-serif text-xl sm:text-2xl text-foreground">Gestion du Catalogue</h1>
            <p className="text-sm text-muted-foreground">{products.length} produits · {categories.length} catégories</p>
          </div>
          <Button onClick={openNew} className="rounded-none gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Ajouter Produit
          </Button>
        </div>

        {lowStock.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive text-sm">Stock faible !</p>
              <p className="text-xs text-muted-foreground mt-1">
                {lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
              </p>
            </div>
          </div>
        )}

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Desktop table */}
        <div className="border border-border rounded-lg overflow-hidden hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Produit</th>
                <th className="text-left p-3 font-medium">Catégories</th>
                <th className="text-right p-3 font-medium">Prix</th>
                <th className="text-right p-3 font-medium">Stock</th>
                <th className="text-center p-3 font-medium">Actif</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const productCats = p.category_ids.map((cid) => categories.find((c) => c.id === cid)).filter(Boolean);
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.images[0] || "/placeholder.svg"} alt={p.name} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.stock < 5 && p.active && (
                          <Badge variant="destructive" className="text-[10px] mt-0.5">Stock faible</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {productCats.map((c) => c?.name).join(", ")}
                    </td>
                    <td className="p-3 text-right">{p.price} DH</td>
                    <td className="p-3 text-right">
                      <span className={p.stock < 5 ? "text-destructive font-medium" : ""}>{p.stock}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={p.active} onCheckedChange={() => handleToggleActive(p.id, p.active)} />
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun produit trouvé</p>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((p) => {
            const productCats = p.category_ids.map((cid) => categories.find((c) => c.id === cid)).filter(Boolean);
            return (
              <div key={p.id} className="border border-border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={p.images[0] || "/placeholder.svg"} alt={p.name} className="w-14 h-14 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{productCats.map((c) => c?.name).join(", ")}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-medium">{p.price} DH</span>
                      <span className={`text-xs ${p.stock < 5 ? "text-destructive font-medium" : "text-muted-foreground"}`}>Stock: {p.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={p.active} onCheckedChange={() => handleToggleActive(p.id, p.active)} />
                    <span className="text-xs text-muted-foreground">{p.active ? "Actif" : "Inactif"}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editingProduct?.id ? "Modifier" : "Ajouter"} un Produit</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Catégories *</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={editingProduct.category_ids.includes(c.id)}
                        onCheckedChange={() => toggleCategory(c.id)}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Prix (DH) *</label>
                <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Description courte</label>
                <Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Description longue</label>
                <Textarea value={editingProduct.long_description} onChange={(e) => setEditingProduct({ ...editingProduct, long_description: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Images</label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {editingProduct.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded overflow-hidden border border-border group">
                        <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Upload en cours..." : "Ajouter des images"}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Ingrédients</label>
                <Input value={editingProduct.materials} onChange={(e) => setEditingProduct({ ...editingProduct, materials: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Poids (g)</label>
                <Input type="number" value={editingProduct.weight || ""} onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value ? Number(e.target.value) : undefined })} placeholder="Ex: 120" />
              </div>
              <Button onClick={handleSave} className="w-full rounded-none" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingProduct.id ? "Enregistrer" : "Ajouter"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
