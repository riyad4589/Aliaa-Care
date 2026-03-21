import { useState, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminStore, AdminProduct } from "@/hooks/useAdminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertTriangle, Package, Upload, X } from "lucide-react";

const emptyProduct: Partial<AdminProduct> = {
  name: "", slug: "", collection: "", collections: [], price: 0, description: "", longDescription: "",
  materials: "", weight: undefined, images: [], stock: 10, active: true, visible: true,
};

const AdminProducts = () => {
  const { products, collections, addProduct, updateProduct, deleteProduct, toggleProductActive, getLowStockProducts } = useAdminStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null);
  const [search, setSearch] = useState("");
  const [filterCollection, setFilterCollection] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lowStock = getLowStockProducts();

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCol = filterCollection === "all" || p.collection === filterCollection || (p.collections && p.collections.includes(filterCollection));
    return matchSearch && matchCol;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProduct) return;
    const newImages = [...(editingProduct.images || [])];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newImages.push(url);
    });
    setEditingProduct({ ...editingProduct, images: newImages });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    if (!editingProduct) return;
    const newImages = [...(editingProduct.images || [])];
    newImages.splice(index, 1);
    setEditingProduct({ ...editingProduct, images: newImages });
  };

  const toggleCollection = (colId: string) => {
    if (!editingProduct) return;
    const current = editingProduct.collections || [];
    const updated = current.includes(colId)
      ? current.filter((c) => c !== colId)
      : [...current, colId];
    setEditingProduct({
      ...editingProduct,
      collections: updated,
      collection: updated[0] || "",
    });
  };

  const handleSave = () => {
    if (!editingProduct?.name || !(editingProduct.collections && editingProduct.collections.length > 0) || !editingProduct?.price) {
      toast({ title: "Erreur", description: "Remplissez les champs obligatoires (nom, catégorie, prix)", variant: "destructive" });
      return;
    }
    const slug = editingProduct.slug || editingProduct.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    if (editingProduct.id) {
      updateProduct(editingProduct.id, { ...editingProduct, slug, collection: editingProduct.collections[0] } as Partial<AdminProduct>);
      toast({ title: "Produit mis à jour" });
    } else {
      const newProduct: AdminProduct = {
        ...emptyProduct,
        ...editingProduct,
        id: `prod-${Date.now()}`,
        slug,
        collection: editingProduct.collections[0],
        images: editingProduct.images?.length ? editingProduct.images : ["/placeholder.svg"],
      } as AdminProduct;
      addProduct(newProduct);
      toast({ title: "Produit ajouté" });
    }
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const openNew = () => { setEditingProduct({ ...emptyProduct }); setDialogOpen(true); };
  const openEdit = (p: AdminProduct) => { setEditingProduct({ ...p, collections: p.collections || [p.collection] }); setDialogOpen(true); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-foreground">Gestion du Catalogue</h1>
            <p className="text-sm text-muted-foreground">{products.length} produits · {collections.length} catégories</p>
          </div>
          <Button onClick={openNew} className="rounded-none gap-2">
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

        <div className="flex gap-3">
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
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
                const productCols = (p.collections || [p.collection]).map(cId => collections.find(c => c.id === cId)).filter(Boolean);
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.stock < 5 && p.active && (
                          <Badge variant="destructive" className="text-[10px] mt-0.5">Stock faible</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {productCols.map(c => c?.name).join(", ")}
                    </td>
                    <td className="p-3 text-right">{p.price} DH</td>
                    <td className="p-3 text-right">
                      <span className={p.stock < 5 ? "text-destructive font-medium" : ""}>{p.stock}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={p.active} onCheckedChange={() => toggleProductActive(p.id)} />
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                        deleteProduct(p.id);
                        toast({ title: "Produit supprimé" });
                      }}><Trash2 className="w-4 h-4" /></Button>
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
                  {collections.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={(editingProduct.collections || []).includes(c.id)}
                        onCheckedChange={() => toggleCollection(c.id)}
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
                <Textarea value={editingProduct.longDescription} onChange={(e) => setEditingProduct({ ...editingProduct, longDescription: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Images</label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(editingProduct.images || []).map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded overflow-hidden border border-border group">
                        <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" /> Ajouter des images
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
              <Button onClick={handleSave} className="w-full rounded-none">
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