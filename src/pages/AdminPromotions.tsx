import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion, Promotion, TierRule } from "@/hooks/usePromotions";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Zap, Tag, Percent, ShoppingCart, Star, Loader2 } from "lucide-react";

const PROMO_TYPES = [
  { value: "percentage", label: "Réduction %", icon: Percent },
  { value: "flash", label: "Offre Flash", icon: Zap },
  { value: "buy_x_get_y", label: "X acheté Y offert", icon: ShoppingCart },
  { value: "tiered", label: "Palier de réduction", icon: Tag },
  { value: "product_of_day", label: "Produit du jour", icon: Star },
];

const defaultForm = {
  name: "",
  type: "percentage",
  discount_percent: 10,
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  is_flash: false,
  buy_quantity: 2,
  get_quantity: 1,
  get_product_id: "" as string | null,
  tier_rules: [{ min_qty: 3, discount_percent: 10 }, { min_qty: 5, discount_percent: 20 }] as TierRule[],
  target_type: "all",
  product_ids: [] as string[],
  category_ids: [] as string[],
  active: true,
};

const AdminPromotions = () => {
  const { data: promotions = [], isLoading } = usePromotions();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const createMut = useCreatePromotion();
  const updateMut = useUpdatePromotion();
  const deleteMut = useDeletePromotion();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(defaultForm);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      name: p.name,
      type: p.type,
      discount_percent: p.discount_percent,
      starts_at: p.starts_at.slice(0, 16),
      ends_at: p.ends_at.slice(0, 16),
      is_flash: p.is_flash,
      buy_quantity: p.buy_quantity || 2,
      get_quantity: p.get_quantity || 1,
      get_product_id: p.get_product_id || "",
      tier_rules: p.tier_rules || [{ min_qty: 3, discount_percent: 10 }],
      target_type: p.target_type,
      product_ids: p.product_ids || [],
      category_ids: p.category_ids || [],
      active: p.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Le nom est requis", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name,
      type: form.type,
      discount_percent: form.discount_percent,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      is_flash: form.type === "flash",
      buy_quantity: form.type === "buy_x_get_y" ? form.buy_quantity : null,
      get_quantity: form.type === "buy_x_get_y" ? form.get_quantity : null,
      get_product_id: form.type === "buy_x_get_y" && form.get_product_id ? form.get_product_id : null,
      tier_rules: form.type === "tiered" ? form.tier_rules : null,
      target_type: form.target_type,
      product_ids: form.target_type === "specific_products" ? form.product_ids : [],
      category_ids: form.target_type === "specific_categories" ? form.category_ids : [],
      active: form.active,
    };
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Promotion modifiée" });
      } else {
        await createMut.mutateAsync(payload);
        toast({ title: "Promotion créée" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette promotion ?")) return;
    await deleteMut.mutateAsync(id);
    toast({ title: "Promotion supprimée" });
  };

  const isActive = (p: Promotion) => {
    if (!p.active) return false;
    const now = new Date();
    return new Date(p.starts_at) <= now && new Date(p.ends_at) > now;
  };

  const toggleProductId = (id: string) => {
    setForm(f => ({
      ...f,
      product_ids: f.product_ids.includes(id)
        ? f.product_ids.filter(pid => pid !== id)
        : [...f.product_ids, id],
    }));
  };

  const toggleCategoryId = (id: string) => {
    setForm(f => ({
      ...f,
      category_ids: f.category_ids.includes(id)
        ? f.category_ids.filter(cid => cid !== id)
        : [...f.category_ids, id],
    }));
  };

  const addTierRule = () => {
    setForm(f => ({ ...f, tier_rules: [...f.tier_rules, { min_qty: 1, discount_percent: 5 }] }));
  };

  const updateTierRule = (i: number, field: keyof TierRule, val: number) => {
    setForm(f => {
      const rules = [...f.tier_rules];
      rules[i] = { ...rules[i], [field]: val };
      return { ...f, tier_rules: rules };
    });
  };

  const removeTierRule = (i: number) => {
    setForm(f => ({ ...f, tier_rules: f.tier_rules.filter((_, idx) => idx !== i) }));
  };

  const typeInfo = (type: string) => PROMO_TYPES.find(t => t.value === type) || PROMO_TYPES[0];

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
            <h1 className="font-serif text-xl sm:text-2xl text-foreground">Promotions Produits</h1>
            <p className="text-sm text-muted-foreground">{promotions.length} promotion(s)</p>
          </div>
          <Button onClick={openCreate} className="gap-2 rounded-none">
            <Plus className="w-4 h-4" /> Nouvelle Promotion
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((p) => {
            const info = typeInfo(p.type);
            const Icon = info.icon;
            const active = isActive(p);
            return (
              <Card key={p.id} className={!active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">{p.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{info.label}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {p.discount_percent > 0 && (
                            <Badge variant="secondary" className="text-xs">-{p.discount_percent}%</Badge>
                          )}
                          {p.is_flash && <Badge variant="destructive" className="text-xs">Flash</Badge>}
                          {p.type === "buy_x_get_y" && (
                            <Badge variant="secondary" className="text-xs">{p.buy_quantity} acheté(s) → {p.get_quantity} offert(s)</Badge>
                          )}
                          {p.type === "tiered" && p.tier_rules && (
                            <Badge variant="secondary" className="text-xs">{p.tier_rules.length} palier(s)</Badge>
                          )}
                          <Badge variant={active ? "default" : "outline"} className="text-xs">
                            {active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {new Date(p.starts_at).toLocaleDateString("fr-FR")} → {new Date(p.ends_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {promotions.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucune promotion</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier la promotion" : "Nouvelle promotion"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Black Friday -30%" />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, is_flash: v === "flash" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROMO_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(form.type === "percentage" || form.type === "flash" || form.type === "product_of_day") && (
              <div>
                <label className="text-sm font-medium">Réduction (%)</label>
                <Input type="number" min={1} max={100} value={form.discount_percent}
                  onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} />
              </div>
            )}

            {form.type === "buy_x_get_y" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Acheter X</label>
                  <Input type="number" min={1} value={form.buy_quantity}
                    onChange={(e) => setForm({ ...form, buy_quantity: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Offrir Y</label>
                  <Input type="number" min={1} value={form.get_quantity}
                    onChange={(e) => setForm({ ...form, get_quantity: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {form.type === "tiered" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Paliers de réduction</label>
                {form.tier_rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">Dès</span>
                    <Input type="number" min={1} value={rule.min_qty} className="w-20"
                      onChange={(e) => updateTierRule(i, "min_qty", Number(e.target.value))} />
                    <span className="text-xs text-muted-foreground shrink-0">articles →</span>
                    <Input type="number" min={1} max={100} value={rule.discount_percent} className="w-20"
                      onChange={(e) => updateTierRule(i, "discount_percent", Number(e.target.value))} />
                    <span className="text-xs text-muted-foreground shrink-0">%</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0"
                      onClick={() => removeTierRule(i)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addTierRule} className="text-xs">+ Ajouter un palier</Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Début</label>
                <Input type="datetime-local" value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Fin</label>
                <Input type="datetime-local" value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Cible</label>
              <Select value={form.target_type} onValueChange={(v) => setForm({ ...form, target_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="specific_products">Produits spécifiques</SelectItem>
                  <SelectItem value="specific_categories">Catégories spécifiques</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.target_type === "specific_products" && (
              <div className="max-h-40 overflow-y-auto border border-border rounded p-2 space-y-1">
                {products.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                    <Checkbox checked={form.product_ids.includes(p.id)}
                      onCheckedChange={() => toggleProductId(p.id)} />
                    {p.name}
                  </label>
                ))}
              </div>
            )}

            {form.target_type === "specific_categories" && (
              <div className="max-h-40 overflow-y-auto border border-border rounded p-2 space-y-1">
                {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                    <Checkbox checked={form.category_ids.includes(c.id)}
                      onCheckedChange={() => toggleCategoryId(c.id)} />
                    {c.name}
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <span className="text-sm">Active</span>
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

export default AdminPromotions;
