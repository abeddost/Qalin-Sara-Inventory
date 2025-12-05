# 🏪 Qalin Sara - Inventory Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**A modern, full-stack inventory management system for carpet retailers**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Overview

Qalin Sara is a comprehensive inventory management solution designed specifically for carpet retailers. Built with modern web technologies, it provides a seamless experience for managing products, orders, invoices, and expenses with real-time updates and beautiful UI.

### Why This Project?

This project demonstrates proficiency in:
- **Full-Stack Development**: Next.js 15 with App Router, Server Components, and API routes
- **Database Design**: PostgreSQL with Supabase, including migrations and RLS policies
- **Modern UI/UX**: Responsive design with Tailwind CSS and shadcn/ui components
- **Authentication & Security**: Row-level security, protected routes, session management
- **State Management**: React hooks, context providers, and real-time updates
- **Type Safety**: End-to-end TypeScript with generated database types
- **Internationalization**: Multi-language support (8 languages)

---

## ✨ Features

### 📦 Product Management
- Add, edit, and delete carpet products with photo uploads
- Manage 6 different size variants (12m, 9m, 6m, 4m, 3m, 2m)
- Track inventory counts, purchase prices, and selling prices
- Real-time search and sorting capabilities
- Bulk import/export (JSON and CSV formats)

### 📋 Order Management
- Create and manage customer orders
- Automatic price calculation with tax support
- Order status tracking (pending, confirmed, processing, shipped, delivered, cancelled)
- Link orders to invoices

### 🧾 Invoice System
- Generate invoices from orders or create standalone
- PDF export functionality
- Multiple status tracking (draft, sent, paid, overdue, cancelled)
- Automatic tax calculation (VAT-inclusive pricing)

### 💰 Expense Tracking
- Categorize business expenses
- Receipt upload and storage
- Payment method tracking
- Expense reporting and analytics

### 📊 Analytics Dashboard
- Real-time inventory metrics
- Stock value calculations
- Price range analysis
- Low stock alerts

### 🔔 Notification System
- Real-time notifications for low stock alerts
- Order and invoice notifications
- Persistent read/unread tracking

### 🎨 User Experience
- **Theme Support**: Light and dark mode
- **Multi-language**: English, German, French, Spanish, Turkish, Arabic, Persian, Pashto
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation and screen reader support

---

## 🖼️ Screenshots

<details>
<summary>Click to view screenshots</summary>

### Dashboard
The main dashboard showing inventory metrics and quick actions.

### Product Management
Product table with size variants and pricing information.

### Order Creation
Order form with automatic calculations and customer management.

### Invoice Generation
Invoice creation with PDF export capability.

</details>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible UI components |
| [Lucide Icons](https://lucide.dev/) | Beautiful icon library |
| [Framer Motion](https://www.framer.com/motion/) | Animations and transitions |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| [Supabase](https://supabase.com/) | Backend-as-a-Service |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Supabase Auth](https://supabase.com/auth) | Authentication |
| [Supabase Storage](https://supabase.com/storage) | File storage |

### Development Tools
| Technology | Purpose |
|------------|---------|
| [React Hook Form](https://react-hook-form.com/) | Form handling |
| [Zod](https://zod.dev/) | Schema validation |
| [ESLint](https://eslint.org/) | Code linting |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF generation |

---

## 🚀 Installation

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm
- Supabase account ([sign up free](https://supabase.com))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/abeddost/qalin-sara-inventory.git
   cd qalin-sara-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the migration files in your Supabase SQL Editor in order:
   ```
   supabase/migrations/20240101000001_create_products.sql
   supabase/migrations/20240101000002_create_product_sizes.sql
   supabase/migrations/20240101000003_create_storage_bucket.sql
   supabase/migrations/20240101000004_create_orders.sql
   supabase/migrations/20240101000005_create_invoices.sql
   supabase/migrations/20240101000006_create_expenses.sql
   supabase/migrations/20240101000007_create_receipts_storage.sql
   supabase/migrations/20240101000008_add_tax_rate_to_orders.sql
   ```

5. **Create your first user**
   
   In Supabase Dashboard → Authentication → Users → Add User

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
qalin-sara-inventory/
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router
│   │   ├── 📂 (auth)/             # Authentication pages
│   │   │   └── login/             # Login page
│   │   ├── 📂 (dashboard)/        # Protected dashboard routes
│   │   │   ├── analytics/         # Analytics dashboard
│   │   │   ├── expenses/          # Expense management
│   │   │   ├── invoices/          # Invoice management
│   │   │   ├── orders/            # Order management
│   │   │   ├── products/          # Product/inventory management
│   │   │   ├── settings/          # User settings
│   │   │   └── layout.tsx         # Dashboard layout with sidebar
│   │   ├── globals.css            # Global styles and CSS variables
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page (redirects to products)
│   │
│   ├── 📂 components/             # React components
│   │   ├── 📂 dashboard/          # Dashboard-specific components
│   │   ├── 📂 expenses/           # Expense form and table
│   │   ├── 📂 invoices/           # Invoice form, table, and view
│   │   ├── 📂 layout/             # Layout components (header, sidebar, etc.)
│   │   ├── 📂 orders/             # Order form and view
│   │   ├── 📂 products/           # Product form, table, and image preview
│   │   ├── 📂 providers/          # Context providers (theme, locale)
│   │   ├── 📂 settings/           # Settings form components
│   │   └── 📂 ui/                 # shadcn/ui base components
│   │
│   ├── 📂 lib/                    # Utility libraries
│   │   ├── 📂 hooks/              # Custom React hooks
│   │   ├── 📂 supabase/           # Supabase client configuration
│   │   ├── 📂 translations/       # i18n translation files
│   │   ├── constants.ts           # Application constants
│   │   ├── inventory-export.ts    # Import/export utilities
│   │   ├── utils.ts               # General utilities
│   │   └── validations.ts         # Zod validation schemas
│   │
│   └── 📂 types/                  # TypeScript type definitions
│       └── database.ts            # Database schema types
│
├── 📂 supabase/
│   └── 📂 migrations/             # SQL migration files
│
├── 📂 public/                     # Static assets
├── 📂 docs/                       # Documentation
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies and scripts
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────────┐
│  products   │────<│  product_sizes   │
└─────────────┘     └──────────────────┘
       │
       │
┌──────┴──────┐     ┌──────────────────┐
│   orders    │────<│   order_items    │
└─────────────┘     └──────────────────┘
       │
       │
┌──────┴──────┐     ┌──────────────────┐
│  invoices   │────<│  invoice_items   │
└─────────────┘     └──────────────────┘

┌─────────────────────┐     ┌─────────────┐
│ expense_categories  │────<│  expenses   │
└─────────────────────┘     └─────────────┘
```

### Tables Overview

| Table | Description |
|-------|-------------|
| `products` | Product catalog with codes and photos |
| `product_sizes` | Size variants with inventory and pricing |
| `orders` | Customer orders with status tracking |
| `order_items` | Line items for each order |
| `invoices` | Generated invoices linked to orders |
| `invoice_items` | Line items for each invoice |
| `expense_categories` | Expense categorization |
| `expenses` | Business expense records |

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Project Summary](./PROJECT_SUMMARY.md) | One-page overview for collaborators & partners |
| [Database Setup](./docs/DATABASE_SETUP.md) | Complete database setup guide |
| [Deployment Guide](./docs/DEPLOYMENT.md) | Production deployment instructions |
| [API Reference](./docs/API.md) | Database schema and API documentation |
| [Contributing](./CONTRIBUTING.md) | Contribution guidelines |

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Abdul Qader Dost**
- Email: abdulqaderdost@yahoo.com
- GitHub: [@abeddost](https://github.com/abeddost)
- LinkedIn: [Abdul Qader Dost](https://www.linkedin.com/in/abdulqaderdost/)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ for Qalin Sara

</div>
