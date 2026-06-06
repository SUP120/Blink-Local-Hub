import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Zap, ChefHat, Wallet, GraduationCap, Heart, Loader2, ShoppingCart, AlertTriangle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AIProduct {
  id: number; name: string; price: number; originalPrice: number | null; unit: string;
  categoryName: string; categorySlug: string; imageUrl: string | null; quantity?: number;
}

const TABS = [
  { id: "emergency", label: "Emergency Mode", icon: Zap, color: "text-red-500", bg: "bg-red-50 border-red-200", activeBg: "bg-red-500 text-white" },
  { id: "recipe", label: "Recipe Shopping", icon: ChefHat, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", activeBg: "bg-amber-500 text-white" },
  { id: "budget", label: "Budget Mode", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", activeBg: "bg-emerald-600 text-white" },
  { id: "student", label: "Student Mode", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", activeBg: "bg-blue-600 text-white" },
  { id: "health", label: "Health Cart", icon: Heart, color: "text-pink-600", bg: "bg-pink-50 border-pink-200", activeBg: "bg-pink-600 text-white" },
];

const STUDENT_PRESETS = ["Survive the Week", "Exam Night Fuel", "End of Month Struggle", "Weekend Cook-Up", "Protein on a Budget"];
const HEALTH_GOALS = ["Weight Loss", "Muscle Gain", "Better Skin", "Better Sleep", "Immunity Boost"];

const IMG_BG: Record<string, string> = {
  groceries: "bg-amber-50", "dairy-eggs": "bg-blue-50", "fruits-vegetables": "bg-emerald-50",
  snacks: "bg-orange-50", "cold-drinks": "bg-cyan-50", "frozen-food": "bg-indigo-50",
  "instant-ready": "bg-red-50", "personal-care": "bg-pink-50", household: "bg-slate-50",
  "baby-care": "bg-purple-50", "pet-supplies": "bg-lime-50", medicines: "bg-rose-50",
  electronics: "bg-sky-50", stationery: "bg-yellow-50",
};

function ProductResultCard({ product, qty }: { product: AIProduct; qty?: number }) {
  return (
    <div className="bg-white rounded-xl border border-border/40 overflow-hidden shadow-sm">
      <div className={`aspect-[4/3] ${IMG_BG[product.categorySlug] ?? "bg-gray-50"} flex items-center justify-center p-3 relative`}>
        <img src={product.imageUrl || `https://picsum.photos/seed/product-${product.id}/200/150`} alt={product.name} className="w-full h-full object-cover rounded-lg" />
        {qty && qty > 1 && (
          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">×{qty}</div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-xs line-clamp-2 mb-1">{product.name}</p>
        <p className="text-[11px] text-muted-foreground mb-2">{product.unit}</p>
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-[11px] text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("emergency");
  const [input, setInput] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    products: AIProduct[]; message: string; tip?: string; cookingTip?: string;
    missingIngredients?: string[]; estimatedCost?: number; estimatedTotal?: number;
    savings?: string; totalEstimate?: number; reasons?: string[]; weeklyPlan?: string;
  } | null>(null);
  const [addingAll, setAddingAll] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  const callAI = async () => {
    setLoading(true);
    setResult(null);
    try {
      let url = `${BASE}/api/ai/${activeTab}`;
      let body: Record<string, unknown> = {};
      if (activeTab === "emergency") body = { situation: input };
      else if (activeTab === "recipe") body = { recipe: input };
      else if (activeTab === "budget") body = { budget: Number(budget) };
      else if (activeTab === "student") body = { preset: selectedPreset };
      else if (activeTab === "health") body = { goal: selectedGoal };

      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("AI request failed");
      const data = await r.json();
      setResult(data);
    } catch (err) {
      toast({ title: "AI Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addAllToCart = async () => {
    if (!result?.products?.length) return;
    setAddingAll(true);
    const items = result.products;
    for (const item of items) {
      const qty = (item as AIProduct & { quantity?: number }).quantity ?? 1;
      await new Promise<void>((resolve) => {
        addToCart.mutate(
          { data: { productId: item.id, quantity: qty } },
          { onSuccess: resolve, onError: resolve }
        );
      });
    }
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    setAddingAll(false);
    toast({ title: `${items.length} items added to cart!`, description: "Head to cart to checkout." });
  };

  const canSubmit = () => {
    if (activeTab === "emergency") return input.trim().length > 3;
    if (activeTab === "recipe") return input.trim().length > 2;
    if (activeTab === "budget") return Number(budget) > 0;
    if (activeTab === "student") return !!selectedPreset;
    if (activeTab === "health") return !!selectedGoal;
    return false;
  };

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold text-xs px-4 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Grok AI
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">AI Smart Shopping</h1>
        <p className="text-muted-foreground max-w-md mx-auto">Tell AI what you need and it builds the perfect cart for you in seconds.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 flex-wrap justify-center mb-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border transition-all ${active ? tab.activeBg + " border-transparent shadow-md" : "bg-white border-border/60 text-muted-foreground hover:border-border hover:text-foreground"}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Input Card */}
      <div className={`bg-white rounded-2xl border-2 ${currentTab.bg} p-6 mb-6 card-shadow`}>
        <div className="flex items-center gap-2 mb-4">
          <currentTab.icon className={`w-5 h-5 ${currentTab.color}`} />
          <h2 className="font-extrabold text-base">{currentTab.label}</h2>
        </div>

        {activeTab === "emergency" && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Describe your situation and AI will build the perfect cart.</p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I have guests coming in 30 minutes and need snacks, drinks and quick bites…"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all resize-none"
            />
          </div>
        )}

        {activeTab === "recipe" && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Type a dish name and get all the ingredients added to your cart.</p>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Butter Chicken, Pasta Carbonara, Biryani…"
              className="w-full h-11 px-4 rounded-xl bg-secondary border border-border/60 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
            />
          </div>
        )}

        {activeTab === "budget" && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Enter your budget and AI will create the best grocery basket.</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="500"
                min="50"
                className="w-full h-11 pl-9 pr-4 rounded-xl bg-secondary border border-border/60 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {[100, 200, 500, 1000].map((b) => (
                <button key={b} onClick={() => setBudget(String(b))} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${budget === String(b) ? "bg-emerald-600 text-white border-transparent" : "border-border/60 text-muted-foreground hover:border-border"}`}>₹{b}</button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "student" && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Pick a preset for your hostel/college situation.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STUDENT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-3 rounded-xl border-2 text-sm font-bold text-left transition-all ${selectedPreset === preset ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border/60 hover:border-border text-muted-foreground"}`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "health" && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Pick your health goal and get scientifically-curated products.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HEALTH_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  className={`p-3 rounded-xl border-2 text-sm font-bold text-left transition-all ${selectedGoal === goal ? "border-pink-500 bg-pink-50 text-pink-700" : "border-border/60 hover:border-border text-muted-foreground"}`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={callAI}
          disabled={loading || !canSubmit()}
          className={`mt-4 w-full h-12 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${currentTab.activeBg}`}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> AI is thinking…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Smart Cart</>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* AI Message */}
          <div className="bg-white rounded-2xl border border-border/40 p-5 card-shadow">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${currentTab.activeBg}`}>
                <currentTab.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Grok says:</p>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.tip && <p className="text-xs text-primary font-semibold mt-2 bg-primary/8 rounded-lg px-3 py-2">💡 {result.tip}</p>}
                {result.cookingTip && <p className="text-xs text-amber-700 font-semibold mt-2 bg-amber-50 rounded-lg px-3 py-2">👨‍🍳 {result.cookingTip}</p>}
                {result.weeklyPlan && <p className="text-xs text-pink-700 font-semibold mt-2 bg-pink-50 rounded-lg px-3 py-2">📅 {result.weeklyPlan}</p>}
                {result.reasons && result.reasons.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.reasons.map((r, i) => <p key={i} className="text-xs text-muted-foreground">✓ {r}</p>)}
                  </div>
                )}
              </div>
            </div>

            {result.missingIngredients && result.missingIngredients.length > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 mb-1">Not available in our store:</p>
                  <p className="text-xs text-amber-700">{result.missingIngredients.join(", ")}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
              <div>
                {result.estimatedTotal !== undefined && (
                  <p className="text-sm font-bold">Total: <span className="text-primary">₹{result.estimatedTotal}</span></p>
                )}
                {result.estimatedCost !== undefined && (
                  <p className="text-sm font-bold">Estimated cost: <span className="text-primary">₹{result.estimatedCost}</span></p>
                )}
                {result.totalEstimate !== undefined && (
                  <p className="text-sm font-bold">Estimated total: <span className="text-primary">₹{result.totalEstimate}</span></p>
                )}
                {result.savings && <p className="text-xs text-emerald-600 font-semibold">{result.savings}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{result.products.length} products selected</p>
              </div>
              <button
                onClick={addAllToCart}
                disabled={addingAll}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-60"
              >
                {addingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                {addingAll ? "Adding…" : "Add All to Cart"}
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {result.products.map((product) => (
              <ProductResultCard key={product.id} product={product} qty={(product as AIProduct & { quantity?: number }).quantity} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
