# ðŸ›ï¸ Blink Local Hub â€” 10-Minute Grocery Delivery

> **Hackathon Project** Â· Built by **Supriyam Kumar**

A modern, full-stack quick-commerce platform that delivers groceries and daily essentials in **under 10 minutes**, powered by **AI smart shopping**.

---

## ðŸŒ Live Demo

ðŸ”— **[https://sup120.github.io/quickshop-hackathon/](https://sup120.github.io/quickshop-hackathon/)**

---

## ðŸ” Admin Panel Access

> For hackathon judges & evaluators â€” use these credentials to access the admin dashboard.

| Field | Value |
|-------|-------|
| ðŸ”— **Admin URL** | `/admin` â†’ click **ðŸ›¡ï¸ Admin** in the navbar |
| ðŸ“§ **Email** | `hedstart-bootcamp@gmail.com` |
| ðŸ”‘ **Password** | `Admin@12` |

### Admin Panel Features:
- ðŸ“Š **Dashboard** â€” Live stats: revenue, orders, low stock alerts
- ðŸ“¦ **Orders Management** â€” Accept / Reject / Mark Delivered
- ðŸ›ï¸ **Product Inventory** â€” Update stock in real-time
- âž• **Add Products** â€” Add new items with emoji, price, unit, badge

---

## âœ¨ Key Features

| Feature | Description |
|---------|-------------|
| âš¡ **10-Min Delivery** | Ultra-fast local delivery simulation |
| ðŸ¤– **AI Smart Shopping** | Groq-powered AI builds your cart automatically |
| ðŸ›’ **Full Cart & Checkout** | Add, update, remove items with GST calculation |
| ðŸ“‹ **Order Tracking** | Real-time order status updates |
| ðŸ›¡ï¸ **Admin Panel** | Full store management dashboard |
| ðŸ“± **Responsive Design** | Works on mobile, tablet & desktop |
| ðŸ” **Smart Search** | Instant product search with dropdown |

---

## ðŸ¤– AI Shopping Modes (Groq AI â€” Llama 3)

| Mode | What it does |
|------|-------------|
| âš¡ **Emergency Mode** | Describe your situation â†’ AI builds cart |
| ðŸ³ **Recipe Shopping** | Type a dish â†’ AI adds all ingredients |
| ðŸ’° **Budget Mode** | Enter budget â†’ AI maximises value |
| ðŸŽ“ **Student Mode** | Hostel/college presets for students |
| â¤ï¸ **Health Cart** | Health goal based product curation |

---

## ðŸ§± Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js 24, Express 5 |
| **Database** | PostgreSQL + Drizzle ORM |
| **AI** | Groq API (Llama 3 â€” 8B) |
| **Validation** | Zod v4, drizzle-zod |
| **API** | OpenAPI spec + Orval codegen |
| **Package Manager** | pnpm workspaces |

---

## ðŸš€ Running Locally

### Prerequisites
- Node.js 24+
- pnpm (`npm i -g pnpm`)
- PostgreSQL database

### Setup

```bash
# Clone the repo
git clone https://github.com/SUP120/Blink-Local-Hub.git
cd Blink-Local-Hub

# Install dependencies
pnpm install

# Set environment variable
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/blinkdb" > .env

# Push DB schema
pnpm --filter @workspace/db run push

# Start API server (port 5000)
pnpm --filter @workspace/api-server run dev

# Start frontend (port 3000)
pnpm --filter @workspace/shop run dev
```

---

## ðŸ“ Project Structure

```
Blink-Local-Hub/
â”œâ”€â”€ artifacts/
â”‚   â”œâ”€â”€ shop/               # React frontend (Vite + Tailwind)
â”‚   â”‚   â””â”€â”€ src/
â”‚   â”‚       â”œâ”€â”€ pages/      # Home, Cart, Orders, Admin, AI Assistant
â”‚   â”‚       â”œâ”€â”€ components/ # Reusable UI components
â”‚   â”‚       â””â”€â”€ lib/        # Auth & utilities
â”‚   â””â”€â”€ api-server/         # Express backend
â”‚       â””â”€â”€ src/routes/     # REST API routes (products, cart, orders, AI)
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ db/                 # Drizzle ORM schema & migrations
â”‚   â”œâ”€â”€ api-spec/           # OpenAPI specification
â”‚   â””â”€â”€ api-client-react/   # Auto-generated React Query hooks
â””â”€â”€ scripts/                # Utility scripts
```

---

## ðŸ‘¨â€ðŸ’» Built By

**Supriyam Kumar**
ðŸ“§ hedstart-bootcamp@gmail.com

---

## ðŸ“„ License

MIT â€” Built for Hackathon Demo purposes.
