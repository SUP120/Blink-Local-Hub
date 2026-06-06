import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { Plus, Package, Pencil, Trash2, ToggleLeft, ToggleRight, Star } from "lucide-react";

interface Product {
  id: number; name: string; categoryId: number; categoryName: string; categorySlug: string;
  price: number; originalPrice: number | null; stock: number; unit: string;
  deliveryTime: string; inStock: boolean; featured: boolean; description: string | null; imageUrl: string | null;
}
interface Category { id: number; name: string; slug: string; icon: string; }

const EMPTY_FORM = { name: "", categoryId: "", price: "", originalPrice: "", stock: "100", unit: "1 pc", inStock: true, featured: false, description: "", deliveryTime: "10 mins", imageUrl: "" };

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) { setLocation("/admin/login"); return; }
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([p, c]) => { setProducts(p); setCategories(c); setLoading(false); });
  }, [setLocation]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, categoryId: String(p.categoryId), price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
      stock: String(p.stock), unit: p.unit, inStock: p.inStock, featured: p.featured,
      description: p.description ?? "", deliveryTime: p.deliveryTime, imageUrl: p.imageUrl ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name, categoryId: Number(form.categoryId), price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock), unit: form.unit, inStock: form.inStock, featured: form.featured,
      description: form.description || null, deliveryTime: form.deliveryTime,
      imageUrl: form.imageUrl || null,
    };
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PATCH" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const saved = await r.json();
    if (editing) {
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...body, id: editing.id, categoryName: categories.find(c => c.id === Number(form.categoryId))?.name ?? p.categoryName } : p)));
    } else {
      const cat = categories.find(c => c.id === Number(form.categoryId));
      setProducts((prev) => [...prev, { ...saved, categoryName: cat?.name ?? "", categorySlug: cat?.slug ?? "" }]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  const toggleStock = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inStock: !p.inStock }) });
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, inStock: !x.inStock } : x)));
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.categoryName.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Products</h1>
              <p className="text-sm text-muted-foreground">{products.length} products across {categories.length} categories</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="h-10 px-4 rounded-xl bg-white border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
            />
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-primary text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-white rounded-xl h-14 animate-pulse" />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/50">
                  <th className="text-left px-5 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary shrink-0">
                          <img src={p.imageUrl || `https://picsum.photos/seed/product-${p.id}/80/80`} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            {p.name}
                            {p.featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-medium">{p.categoryName}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold">₹{p.price}</span>
                      {p.originalPrice && <span className="text-xs text-muted-foreground line-through ml-1.5">₹{p.originalPrice}</span>}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{p.stock}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggleStock(p)} className="flex items-center gap-1.5 text-xs font-bold transition-colors">
                        {p.inStock
                          ? <><ToggleRight className="w-5 h-5 text-primary" /><span className="text-primary">In Stock</span></>
                          : <><ToggleLeft className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground">Out of Stock</span></>}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground font-medium">No products match your search</div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <h3 className="font-extrabold">{editing ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full bg-secondary hover:bg-border/60 flex items-center justify-center text-muted-foreground transition-colors">✕</button>
            </div>
            <form onSubmit={handleSave} className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Product Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Category *</label>
                    <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all">
                      <option value="">Select…</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Unit</label>
                    <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Price (₹) *</label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Original Price (₹)</label>
                    <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Stock</label>
                    <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Delivery Time</label>
                    <input value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Image URL</label>
                    <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" className="w-full h-10 px-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
                    <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-secondary border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all resize-none" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
                      <span className="text-sm font-semibold">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
                      <span className="text-sm font-semibold">Featured</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border/60 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border border-border/60 text-sm font-bold hover:bg-secondary transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 h-10 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : editing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
