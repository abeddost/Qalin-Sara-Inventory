# SCOPE - Qalin Sara Carpet Inventory System

## Project Overview
A modern, full-stack carpet inventory management system for Qalin Sara, featuring product management with multiple size variants, photo storage, and comprehensive pricing tracking.

---

## Business Requirements

### Core Functionality

#### 1. Product Management
- Add new carpet products with unique code
- Upload one photo per product to Supabase Storage
- Manage 6 size variants per product: 12m, 9m, 6m, 4m, 3m, 2m
- Track count, purchase price, and selling price for each size
- Edit product information and replace photos
- Delete products (with automatic cascade deletion of all size entries)

#### 2. Inventory Tracking
- Real-time inventory counts per size
- Purchase price tracking for cost analysis
- Selling price management for revenue calculation
- Total summaries at bottom of table:
  - Total count (sum of all counts across all sizes)
  - Total purchase value (sum of count × purchase_price)
  - Total selling value (sum of count × selling_price)

#### 3. Search & Filter
- Search products by code
- Real-time filtering

#### 4. Authentication & Security
- Email/password authentication via Supabase Auth
- Only authenticated users can access the system
- Protected routes for all management pages
- Secure file uploads to Supabase Storage

---

## Technical Specifications

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Auth, Storage)
- **Integration**: MCP (Model Context Protocol) for Supabase
- **Deployment**: Vercel
- **Additional**: Framer Motion (animations), React Hook Form, Zod (validation)

### Database Schema

#### Table: products
```sql
- id: UUID (primary key, auto-generated)
- code: TEXT (unique, required, indexed)
- photo_url: TEXT (Supabase Storage URL)
- created_at: TIMESTAMP (auto)
- updated_at: TIMESTAMP (auto)
```

#### Table: product_sizes
```sql
- id: UUID (primary key, auto-generated)
- product_id: UUID (foreign key → products.id, CASCADE DELETE)
- size: ENUM ('12m', '9m', '6m', '4m', '3m', '2m')
- count: INTEGER (default 0)
- purchase_price: DECIMAL(10,2) (default 0.00)
- selling_price: DECIMAL(10,2) (default 0.00)
- UNIQUE constraint: (product_id, size)
```

#### Storage Bucket: carpet-photos
- Public read access
- Authenticated write access
- Image file types only (jpg, png, webp)
- Max file size: 5MB

#### RLS Policies
- All tables: Authenticated users have full CRUD access
- Storage: Authenticated users can upload, public can read

---

## User Interface Requirements

### Modern Design Principles
- Clean, minimalist interface with ample white space
- Glassmorphism effects and subtle depth/shadows
- Smooth animations and micro-interactions (Framer Motion)
- Dark mode toggle support
- Responsive design (mobile, tablet, desktop)
- Fast loading with optimized images

### Branding
- **Logo**: Qalin Sara logo prominently displayed in navbar and login page
- **Color Scheme** (derived from logo):
  - Primary Red: #B71C1C, #D32F2F
  - Secondary Beige: #D7CCC8, #BCAAA4
  - Neutral Grays: #F5F5F5, #424242
  - Accent: Gradient combinations
- **Typography**: Geist/Inter font family
- **Patterns**: Subtle geometric pattern backgrounds inspired by traditional carpets

### Key UI Components

#### 1. Login Page
- Centered modern card with Qalin Sara logo
- Email and password inputs with validation
- Submit button with loading state
- Error message display
- Forgot password link (future)

#### 2. Dashboard Layout
- Top navbar with:
  - Qalin Sara logo (left)
  - Search bar (center)
  - Dark mode toggle
  - User menu with logout (right)
- Main content area
- Responsive sidebar (future expansion)

#### 3. Products Page - Table View
- **Header Section**:
  - Page title "Carpet Inventory"
  - "Add Product" button (primary CTA)
  - View toggle: Table / Card Grid
  - Search bar for filtering by code

- **Table Columns**:
  - Photo (thumbnail 60x60, clickable for preview)
  - Code
  - 12m Size (Count / Purchase / Selling)
  - 9m Size (Count / Purchase / Selling)
  - 6m Size (Count / Purchase / Selling)
  - 4m Size (Count / Purchase / Selling)
  - 3m Size (Count / Purchase / Selling)
  - 2m Size (Count / Purchase / Selling)
  - Actions (Edit, Delete icons)

- **Table Features**:
  - Sticky header on scroll
  - Hover effects on rows
  - Zebra striping (subtle)
  - Responsive (horizontal scroll on mobile)
  - Loading skeleton states
  - Empty state with illustration

#### 4. Totals Footer
- Sticky footer or card below table
- Three animated statistics cards:
  - **Total Units**: Sum of all counts
  - **Total Purchase Value**: Sum of (count × purchase_price)
  - **Total Selling Value**: Sum of (count × selling_price)
- Icons for each metric
- Smooth number count-up animation

#### 5. Add/Edit Product Dialog
- Modern modal/drawer (sheet component)
- **Form Sections**:
  - **Product Code**: Text input with validation (required, unique)
  - **Photo Upload**: 
    - Drag & drop area
    - Click to browse
    - Image preview with remove option
    - File size/type validation
  - **Size Entries** (6 rows for each size):
    - Size badge (12m, 9m, 6m, 4m, 3m, 2m)
    - Count input (number, min 0)
    - Purchase Price (currency format)
    - Selling Price (currency format)
- **Actions**:
  - Submit button (with loading state)
  - Cancel button
- **Validation**:
  - Real-time field validation
  - Form-level validation on submit
  - Toast notifications for success/error

#### 6. Image Preview Modal
- Click thumbnail to open full preview
- Features:
  - Full-size image display
  - Zoom in/out controls
  - Close button (X)
  - Click outside to close
  - Smooth fade/scale animation
  - Product code shown

#### 7. Delete Confirmation Dialog
- Alert dialog with warning icon
- Shows product code being deleted
- Warning message about cascade deletion
- Confirm (destructive) / Cancel buttons
- Toast notification on success

#### 8. Card/Grid View (Alternative to Table)
- Responsive grid (3-4 columns desktop, 1-2 mobile)
- Each card shows:
  - Product image (large)
  - Product code
  - Quick stats summary
  - Edit/Delete actions
- Hover effects with lift/shadow
- Click to expand for details

---

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Initialize Next.js 14 project with App Router
- [x] Configure TypeScript
- [x] Set up Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Configure MCP for Supabase in `.cursor/mcp.json`
- [x] Set up environment variables (.env.local)
- [x] Install dependencies

### Phase 2: Database & Storage 🗄️
- [ ] Create Supabase migrations for database schema
- [ ] Set up `products` table with RLS policies
- [ ] Set up `product_sizes` table with RLS policies
- [ ] Create `carpet-photos` storage bucket
- [ ] Configure storage policies
- [ ] Test database connections

### Phase 3: Authentication 🔐
- [ ] Set up Supabase Auth configuration
- [ ] Create Supabase client utilities (server & client)
- [ ] Build login page with email/password
- [ ] Implement auth middleware for protected routes
- [ ] Add logout functionality
- [ ] Test authentication flow

### Phase 4: Core Product Management 📦
- [ ] Create products list page with table view
- [ ] Implement add product form with photo upload
- [ ] Build edit product functionality
- [ ] Implement delete product with confirmation
- [ ] Add real-time data fetching
- [ ] Handle optimistic UI updates

### Phase 5: Search & Filtering 🔍
- [ ] Add search bar component
- [ ] Implement search by code functionality
- [ ] Add debounced search
- [ ] Filter table results in real-time

### Phase 6: UI Polish & Animations ✨
- [ ] Add Qalin Sara branding (logo, colors)
- [ ] Implement Framer Motion animations
- [ ] Add image preview modal with zoom
- [ ] Create animated totals footer
- [ ] Add toast notifications
- [ ] Implement dark mode toggle
- [ ] Add loading states and skeletons
- [ ] Create empty states

### Phase 7: Responsive & Alternative Views 📱
- [ ] Make fully responsive (mobile, tablet, desktop)
- [ ] Add card/grid view option
- [ ] Optimize for touch interactions
- [ ] Test across different screen sizes

### Phase 8: Testing & Deployment 🚀
- [ ] Test all CRUD operations
- [ ] Test authentication flow
- [ ] Test file uploads and storage
- [ ] Optimize images and performance
- [ ] Deploy to Vercel
- [ ] Set up production environment variables

---

## File Structure
```
qalin-sara-inventory/
├── .cursor/
│   └── mcp.json                          # MCP Supabase configuration
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                  # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Dashboard layout with navbar
│   │   └── products/
│   │       └── page.tsx                  # Products list page
│   ├── api/                              # API routes (if needed)
│   ├── globals.css                       # Global styles + Tailwind
│   ├── layout.tsx                        # Root layout
│   └── providers.tsx                     # Theme, toast providers
├── components/
│   ├── ui/                               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── products/
│   │   ├── product-table.tsx             # Main products table
│   │   ├── product-form.tsx              # Add/Edit product form
│   │   ├── product-card.tsx              # Card view component
│   │   ├── product-grid.tsx              # Grid view
│   │   ├── delete-dialog.tsx             # Delete confirmation
│   │   ├── image-preview.tsx             # Image modal
│   │   └── size-input.tsx                # Size entry row
│   ├── layout/
│   │   ├── navbar.tsx                    # Main navigation
│   │   └── sidebar.tsx                   # Sidebar (future)
│   ├── totals-footer.tsx                 # Statistics footer
│   ├── search-bar.tsx                    # Search component
│   └── theme-toggle.tsx                  # Dark mode toggle
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Client-side Supabase client
│   │   ├── server.ts                     # Server-side Supabase client
│   │   └── middleware.ts                 # Auth middleware
│   ├── utils.ts                          # Utility functions (cn, etc.)
│   ├── validations.ts                    # Zod schemas
│   └── constants.ts                      # Constants (sizes, etc.)
├── supabase/
│   └── migrations/
│       ├── 20240101_create_products.sql
│       └── 20240102_create_product_sizes.sql
├── public/
│   ├── logo.png                          # Qalin Sara logo
│   └── patterns/                         # Background patterns
├── types/
│   └── database.ts                       # Database types
├── .env.local                            # Environment variables (gitignored)
├── .env.example                          # Environment template
├── scope.md                              # This file
├── components.json                       # shadcn/ui config
├── tailwind.config.ts                    # Tailwind configuration
├── tsconfig.json                         # TypeScript config
├── next.config.js                        # Next.js config
├── package.json
└── README.md
```

---

## Environment Variables

### `.env.local`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### MCP Configuration (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${NEXT_PUBLIC_SUPABASE_URL}",
        "SUPABASE_ANON_KEY": "${NEXT_PUBLIC_SUPABASE_ANON_KEY}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

---

## Key User Flows

### 1. Login Flow
1. User visits app → Redirected to `/login` if not authenticated
2. Enter email and password
3. Click "Sign In" button
4. On success → Redirect to `/products`
5. On error → Display error message below form

### 2. Add Product Flow
1. Click "Add Product" button in products page
2. Modal/dialog opens with empty form
3. Enter product code
4. Upload photo (drag & drop or click to browse)
5. Preview photo shows in upload area
6. Fill in size entries (count, purchase price, selling price) for desired sizes
7. Click "Add Product" button
8. Form validates → Shows errors if invalid
9. On success:
   - Photo uploads to Supabase Storage
   - Product record created
   - Size records created
   - Toast notification: "Product added successfully"
   - Modal closes
   - Table refreshes with new product

### 3. Edit Product Flow
1. Click Edit icon (pencil) on product row
2. Modal opens pre-filled with current product data
3. Modify any fields:
   - Change code (validates uniqueness)
   - Replace photo (upload new image)
   - Update size entries
4. Click "Update Product" button
5. On success:
   - Database updated
   - If new photo → Old photo deleted, new uploaded
   - Toast notification: "Product updated successfully"
   - Modal closes
   - Table refreshes

### 4. Delete Product Flow
1. Click Delete icon (trash) on product row
2. Confirmation dialog appears:
   - Title: "Delete Product?"
   - Message: "Are you sure you want to delete product [CODE]? This will also delete all size entries. This action cannot be undone."
3. Click "Delete" (destructive) or "Cancel"
4. On confirm:
   - Product deleted from database
   - All related size entries deleted (cascade)
   - Photo deleted from storage
   - Toast notification: "Product deleted successfully"
   - Table refreshes

### 5. Search Flow
1. Type in search bar (auto-focuses with Cmd+K)
2. Input is debounced (300ms)
3. Table filters in real-time to show matching products by code
4. Shows "No results found" if no matches
5. Clear search (X button) to show all products

### 6. View Photo Flow
1. Click on product thumbnail in table
2. Modal opens with full-size image
3. Image shown at full resolution with zoom controls
4. Product code displayed below image
5. Click close (X), press Escape, or click outside to close
6. Smooth fade/scale animation

---

## Success Criteria

### Functional Requirements ✅
- All CRUD operations work correctly
- Photo upload/delete works reliably
- Search filters products accurately
- Totals calculate correctly in real-time
- Authentication protects all routes
- Cascade deletion works properly

### Non-Functional Requirements ✅
- Page load time < 2 seconds
- Image upload < 5 seconds
- Smooth animations (60fps)
- Responsive on all devices
- Accessible (ARIA labels, keyboard navigation)
- Clean, maintainable code
- Type-safe with TypeScript
- Production-ready quality

### User Experience ✅
- Intuitive interface requiring no training
- Clear visual feedback for all actions
- Error messages are helpful
- Loading states prevent confusion
- Modern, professional appearance
- Qalin Sara branding is prominent

---

## Future Enhancements (Out of Scope for v1)

- [ ] Export to Excel/PDF
- [ ] Print invoices
- [ ] Email notifications for low stock
- [ ] Multi-user roles (admin, viewer, editor)
- [ ] Activity log/audit trail
- [ ] Barcode/QR code generation
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Bulk import/export
- [ ] Multiple photo support per product
- [ ] Product categories/tags
- [ ] Supplier management
- [ ] Purchase orders
- [ ] Sales tracking

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-10  
**Status**: Ready for Implementation 🚀
