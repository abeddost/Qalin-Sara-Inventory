# Qalin Sara Carpet Inventory Management System

A modern, full-stack carpet inventory management system built with Next.js 14, Supabase, and shadcn/ui.

## 🚀 Features

- **Modern UI**: Clean, responsive design with Qalin Sara branding
- **Authentication**: Secure login with Supabase Auth
- **Product Management**: Add, edit, delete carpet products
- **Photo Upload**: Store product images in Supabase Storage
- **Size Variants**: Manage 6 different carpet sizes (12m, 9m, 6m, 4m, 3m, 2m)
- **Inventory Tracking**: Track counts, purchase prices, and selling prices
- **Real-time Search**: Find products by code
- **MCP Integration**: Model Context Protocol for Supabase

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Auth, Storage)
- **Integration**: MCP (Model Context Protocol)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd qalin-sara-inventory
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to get your credentials
3. Copy `env-template.txt` to `.env.local` and fill in your Supabase details:

```bash
cp env-template.txt .env.local
```

Fill in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:

```sql
-- Run each file in supabase/migrations/ in order:
-- 1. 20240101000001_create_products.sql
-- 2. 20240101000002_create_product_sizes.sql  
-- 3. 20240101000003_create_storage_bucket.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - you'll be redirected to the login page.

### 5. Create Your First User

1. Go to your Supabase dashboard
2. Navigate to **Authentication → Users**
3. Click **Add User** and create an account
4. Use those credentials to log in

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/           # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Dashboard layout
│   │   └── products/        # Products management
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home (redirects to products)
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── layout/
│       └── navbar.tsx       # Navigation bar
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── constants.ts         # App constants
│   ├── utils.ts             # Utility functions
│   └── validations.ts       # Zod schemas
└── types/
    └── database.ts          # Database types
```

## 🗄️ Database Schema

### Products Table
- `id`: UUID (primary key)
- `code`: TEXT (unique, required)
- `photo_url`: TEXT (Supabase Storage URL)
- `created_at`, `updated_at`: TIMESTAMP

### Product Sizes Table
- `id`: UUID (primary key)
- `product_id`: UUID (foreign key → products.id)
- `size`: ENUM ('12m', '9m', '6m', '4m', '3m', '2m')
- `count`: INTEGER
- `purchase_price`: DECIMAL(10,2)
- `selling_price`: DECIMAL(10,2)

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🎨 Customization

### Colors
The app uses a custom color scheme inspired by the Qalin Sara logo:
- Primary Red: `#B71C1C`, `#D32F2F`
- Beige: `#D7CCC8`, `#BCAAA4`
- Defined in `tailwind.config.ts` and `globals.css`

### Components
All UI components are from shadcn/ui and can be customized in `src/components/ui/`

## 📝 Next Steps

The foundation is complete! To continue building:

1. **Database Setup**: Run the migrations in Supabase
2. **Authentication**: Create your first user in Supabase Auth
3. **Product Management**: Add the product form and table components
4. **Photo Upload**: Implement Supabase Storage integration
5. **Search & Filter**: Add real-time search functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Qalin Sara**