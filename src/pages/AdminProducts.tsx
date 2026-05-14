import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct, useBulkDeleteProducts, useToggleProductActive, uploadProductImage, DbProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, AlertTriangle, Package, Upload, X, Loader2, Search } from "lucide-react";

interface EditingProduct {
  id?: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  long_description: string;
  materials: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  long_description_ar: string;
  long_description_en: string;
  materials_ar: string;
  materials_en: string;
  weight?: number;
  stock: number;
  active: boolean;
  visible: boolean;
  featured: boolean;
  is_new: boolean;
  images: string[];
  category_ids: string[];
  flavors: string[];
  flavors_ar: string[];
  flavors_en: string[];
}

const emptyProduct: EditingProduct = {
  name: "", slug: "", price: 0, description: "", long_description: "",
  materials: "", name_ar: "", name_en: "", description_ar: "", description_en: "",
  long_description_ar: "", long_description_en: "", materials_ar: "", materials_en: "",
  weight: undefined, images: [], stock: 10, active: true, visible: true,
  featured: false, is_new: false, category_ids: [], flavors: [], flavors_ar: [], flavors_en: [],
};

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sync dialog state with URL
  const dialogOpen = searchParams.get("action") === "edit" || searchParams.get("action") === "new";

  useEffect(() => {
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    
    // Check for draft first
    const draftKey = `product_draft_${action}_${id || 'new'}`;
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft) {
      setEditingProduct(JSON.parse(savedDraft));
      return;
    }

    if (action === "new") {
      setEditingProduct({ ...emptyProduct });
    } else if (action === "edit" && id && products.length > 0) {
      const p = products.find(p => p.id === id);
      if (p) {
        setEditingProduct({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          description: p.description || "",
          long_description: p.long_description || "",
          materials: p.materials || "",
          name_ar: p.name_ar || "",
          name_en: p.name_en || "",
          description_ar: p.description_ar || "",
          description_en: p.description_en || "",
          long_description_ar: p.long_description_ar || "",
          long_description_en: p.long_description_en || "",
          materials_ar: p.materials_ar || "",
          materials_en: p.materials_en || "",
          weight: p.weight ?? undefined,
          stock: p.stock,
          active: p.active,
          visible: p.visible,
          featured: p.featured ?? false,
          is_new: p.is_new ?? false,
          images: p.images,
          category_ids: p.category_ids,
          flavors: p.flavors || [],
        });
      }
    } else if (!action) {
      setEditingProduct(null);
    }
  }, [searchParams, products]);

  // Save draft whenever editingProduct changes
  useEffect(() => {
    if (editingProduct && dialogOpen) {
      const action = searchParams.get("action");
      const id = searchParams.get("id");
      const draftKey = `product_draft_${action}_${id || 'new'}`;
      localStorage.setItem(draftKey, JSON.stringify(editingProduct));
    }
  }, [editingProduct, dialogOpen, searchParams]);

  const clearDraft = () => {
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    localStorage.removeItem(`product_draft_${action}_${id || 'new'}`);
  };

  const setDialogOpen = (open: boolean) => {
    if (!open) {
      clearDraft();
      setSearchParams({});
    }
  };
  const bulkDeleteProducts = useBulkDeleteProducts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

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
    
    // Clean up flavors array: trim and filter empty strings
    const cleanedFlavors = editingProduct.flavors.map(f => f.trim()).filter(Boolean);
    const cleanedFlavorsAr = editingProduct.flavors_ar.map(f => f.trim()).filter(Boolean);
    const cleanedFlavorsEn = editingProduct.flavors_en.map(f => f.trim()).filter(Boolean);

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
            name_ar: editingProduct.name_ar,
            name_en: editingProduct.name_en,
            description_ar: editingProduct.description_ar,
            description_en: editingProduct.description_en,
            long_description_ar: editingProduct.long_description_ar,
            long_description_en: editingProduct.long_description_en,
            materials_ar: editingProduct.materials_ar,
            materials_en: editingProduct.materials_en,
            weight: editingProduct.weight || null,
            stock: editingProduct.stock,
            active: editingProduct.active,
            visible: editingProduct.visible,
            featured: editingProduct.featured,
            is_new: editingProduct.is_new,
            flavors: cleanedFlavors,
            flavors_ar: cleanedFlavorsAr,
            flavors_en: cleanedFlavorsEn,
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
          name_ar: editingProduct.name_ar,
          name_en: editingProduct.name_en,
          description_ar: editingProduct.description_ar,
          description_en: editingProduct.description_en,
          long_description_ar: editingProduct.long_description_ar,
          long_description_en: editingProduct.long_description_en,
          materials_ar: editingProduct.materials_ar,
          materials_en: editingProduct.materials_en,
          weight: editingProduct.weight,
          stock: editingProduct.stock,
          active: editingProduct.active,
          visible: editingProduct.visible,
          featured: editingProduct.featured,
          is_new: editingProduct.is_new,
          flavors: cleanedFlavors,
          flavors_ar: cleanedFlavorsAr,
          flavors_en: cleanedFlavorsEn,
          images: editingProduct.images.length > 0 ? editingProduct.images : ["/placeholder.svg"],
          category_ids: editingProduct.category_ids,
        });
        toast({ title: "Produit ajouté" });
      }
      clearDraft();
      setDialogOpen(false);
      setEditingProduct(null);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => { setSearchParams({ action: "new" }); };
  const openEdit = (p: DbProduct) => {
    setSearchParams({ action: "edit", id: p.id });
  };

  const handleDelete = async () => {
    try {
      if (isBulkDeleting) {
        await bulkDeleteProducts.mutateAsync(selectedIds);
        toast({ title: `${selectedIds.length} produits supprimés` });
        setSelectedIds([]);
        setIsBulkDeleting(false);
      } else if (productToDelete) {
        await deleteProduct.mutateAsync(productToDelete);
        toast({ title: "Produit supprimé" });
        setProductToDelete(null);
      }
    } catch (err) {
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

  const handleToggleActive = (id: string, current: boolean) => {
    toggleActive.mutate({ id, active: !current });
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Gestion des Produits</h1>
            <p className="text-sm text-muted-foreground">{products.length} produits · {categories.length} catégories</p>
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
              <Plus className="w-4 h-4" /> Ajouter Produit
            </Button>
          </div>
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

        <div className="flex flex-col items-start gap-4 sm:pl-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop table */}
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
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="p-3 text-center">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.images[0] || "/placeholder.svg"} alt={p.name} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.stock === 0 ? (
                          <Badge variant="destructive" className="text-[10px] mt-0.5">Rupture de stock</Badge>
                        ) : p.stock < 5 && p.active && (
                          <Badge variant="outline" className="text-[10px] mt-0.5 text-amber-600 border-amber-200 bg-amber-50">Stock faible</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {productCats.map((c) => c?.name).join(", ")}
                    </td>
                    <td className="p-3 text-right">{p.price} DH</td>
                    <td className="p-3 text-right">
                      <span className={p.stock === 0 ? "text-destructive font-bold" : p.stock < 5 ? "text-amber-600 font-medium" : ""}>
                        {p.stock === 0 ? "Épuisé" : p.stock}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={p.active} onCheckedChange={() => handleToggleActive(p.id, p.active)} />
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setProductToDelete(p.id)}>
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
                      <span className={`text-xs ${p.stock === 0 ? "text-destructive font-bold" : p.stock < 5 ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                        Stock: {p.stock === 0 ? "Épuisé" : p.stock}
                      </span>
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
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setProductToDelete(p.id)}>
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
        <DialogContent 
          className="max-w-6xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{editingProduct?.id ? "Modifier" : "Ajouter"} un Produit</DialogTitle>
            <DialogDescription className="sr-only">Formulaire pour {editingProduct?.id ? "modifier" : "ajouter"} les détails du produit.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Nom du produit *</label>
                    <Input 
                      value={editingProduct.name} 
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                        setEditingProduct({ ...editingProduct, name, slug });
                      }} 
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Catégories *</label>
                    <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-md bg-muted/20">
                      {categories.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                          <Checkbox
                            checked={editingProduct.category_ids.includes(c.id)}
                            onCheckedChange={() => toggleCategory(c.id)}
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Prix (DH) *</label>
                      <Input 
                        type="number" 
                        step="any"
                        min="0"
                        placeholder="0"
                        value={editingProduct.price === 0 ? "" : editingProduct.price} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProduct({ ...editingProduct, price: val === "" ? 0 : Math.max(0, Number(val)) });
                        }}
                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Stock</label>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        value={editingProduct.stock === 0 ? "" : editingProduct.stock} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProduct({ ...editingProduct, stock: val === "" ? 0 : Math.max(0, Math.floor(Number(val))) });
                        }}
                        onKeyDown={(e) => ["e", "E", "+", "-", ".", ","].includes(e.key) && e.preventDefault()}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg border border-border">
                    <div className="md:col-span-3 mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ingrédients</label>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1 ml-1">Français</span>
                      <Input value={editingProduct.materials} onChange={(e) => setEditingProduct({ ...editingProduct, materials: e.target.value })} placeholder="Ex: Eau, Aloé..." />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1 ml-1">Arabe</span>
                      <Input value={editingProduct.materials_ar} onChange={(e) => setEditingProduct({ ...editingProduct, materials_ar: e.target.value })} placeholder="المكونات..." dir="rtl" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1 ml-1">Anglais</span>
                      <Input value={editingProduct.materials_en} onChange={(e) => setEditingProduct({ ...editingProduct, materials_en: e.target.value })} placeholder="Ingredients..." />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Poids (g)</label>
                    <Input type="number" value={editingProduct.weight || ""} onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value ? Number(e.target.value) : undefined })} placeholder="Ex: 120" />
                  </div>

                  <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
                    <div className="mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goûts / Variantes (séparés par des virgules)</label>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1 ml-1">Français</span>
                      <Input 
                        value={editingProduct.flavors.join(", ")} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const flavorsArray = val.split(",").map(s => s.trimStart());
                          setEditingProduct({ ...editingProduct, flavors: flavorsArray });
                        }} 
                        placeholder="Vanille, Chocolat..." 
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1 ml-1">Arabe</span>
                      <Input 
                        value={editingProduct.flavors_ar.join(", ")} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const flavorsArray = val.split(",").map(s => s.trimStart());
                          setEditingProduct({ ...editingProduct, flavors_ar: flavorsArray });
                        }} 
                        placeholder="الفانيليا، الشوكولاتة..." 
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1 ml-1">Anglais</span>
                      <Input 
                        value={editingProduct.flavors_en.join(", ")} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const flavorsArray = val.split(",").map(s => s.trimStart());
                          setEditingProduct({ ...editingProduct, flavors_en: flavorsArray });
                        }} 
                        placeholder="Vanilla, Chocolate..." 
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Laissez vide si le produit n'a pas de variantes. Utilisez des virgules pour séparer.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Images du produit</label>
                    <div className="p-4 border border-border border-dashed rounded-lg bg-muted/10">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {editingProduct.images.map((img, i) => (
                          <div key={i} className="relative w-20 h-20 rounded overflow-hidden border border-border shadow-sm group">
                            <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                      <Button type="button" variant="outline" className="w-full gap-2 border-dashed" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? "Chargement..." : "Ajouter des photos"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Description courte</label>
                    <Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={2} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Nom (Arabe)</label>
                      <Input dir="rtl" value={editingProduct.name_ar} onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Nom (Anglais)</label>
                      <Input value={editingProduct.name_en} onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Ingrédients (Arabe)</label>
                      <Input dir="rtl" value={editingProduct.materials_ar} onChange={(e) => setEditingProduct({ ...editingProduct, materials_ar: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Ingrédients (Anglais)</label>
                      <Input value={editingProduct.materials_en} onChange={(e) => setEditingProduct({ ...editingProduct, materials_en: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Description courte (Arabe)</label>
                      <Textarea dir="rtl" value={editingProduct.description_ar} onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })} rows={2} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Description courte (Anglais)</label>
                      <Textarea value={editingProduct.description_en} onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })} rows={2} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Description longue</label>
                    <Textarea value={editingProduct.long_description} onChange={(e) => setEditingProduct({ ...editingProduct, long_description: e.target.value })} rows={4} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Description longue (Arabe)</label>
                      <Textarea dir="rtl" value={editingProduct.long_description_ar} onChange={(e) => setEditingProduct({ ...editingProduct, long_description_ar: e.target.value })} rows={3} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Description longue (Anglais)</label>
                      <Textarea value={editingProduct.long_description_en} onChange={(e) => setEditingProduct({ ...editingProduct, long_description_en: e.target.value })} rows={3} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1 rounded-none" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} className="flex-1 rounded-none" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingProduct.id ? "Mettre à jour" : "Créer le produit"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={!!productToDelete || isBulkDeleting} 
        onOpenChange={(open) => { if (!open) { setProductToDelete(null); setIsBulkDeleting(false); }}}
      >
        <AlertDialogContent 
          className="rounded-2xl"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="font-serif text-xl">
              {isBulkDeleting ? `Supprimer ${selectedIds.length} produits` : "Confirmer la suppression"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDeleting 
                ? `Êtes-vous sûr de vouloir supprimer ces ${selectedIds.length} produits ?` 
                : "Êtes-vous sûr de vouloir supprimer ce produit ?"
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

export default AdminProducts;

