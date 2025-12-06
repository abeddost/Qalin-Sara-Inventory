# API Reference

This document describes the database schema and API structure for Qalin Sara Inventory.

## Overview

The application uses Supabase as the backend, which provides:
- PostgreSQL database with auto-generated REST API
- Real-time subscriptions
- Authentication
- File storage

All database operations use the Supabase JavaScript client.

---

## Authentication

Authentication is handled by Supabase Auth.

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut()
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser()
```

---

## Database Tables

### Products

**Table: `products`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| code | varchar(100) | NOT NULL, UNIQUE |
| photo_url | text | nullable |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Operations:**

```typescript
// Create product
const { data, error } = await supabase
  .from('products')
  .insert({ code: 'CARPET-001', photo_url: 'https://...' })
  .select()
  .single()

// Read products with sizes
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    product_sizes (*)
  `)
  .order('created_at', { ascending: false })

// Update product
const { error } = await supabase
  .from('products')
  .update({ code: 'NEW-CODE' })
  .eq('id', productId)

// Delete product
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)
```

---

### Product Sizes

**Table: `product_sizes`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| product_id | uuid | REFERENCES products(id) ON DELETE CASCADE |
| size | varchar(10) | CHECK (size IN ('12m', '9m', '6m', '4m', '3m', '2m')) |
| count | integer | DEFAULT 0 |
| purchase_price | decimal(10,2) | DEFAULT 0 |
| selling_price | decimal(10,2) | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Operations:**

```typescript
// Create size entry
const { data, error } = await supabase
  .from('product_sizes')
  .insert({
    product_id: productId,
    size: '12m',
    count: 10,
    purchase_price: 100.00,
    selling_price: 150.00
  })

// Update size entry
const { error } = await supabase
  .from('product_sizes')
  .update({ count: 5 })
  .eq('id', sizeId)
```

---

### Orders

**Table: `orders`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| order_number | varchar(50) | NOT NULL, UNIQUE |
| customer_name | varchar(255) | NOT NULL |
| customer_email | varchar(255) | nullable |
| customer_phone | varchar(50) | nullable |
| customer_address | text | nullable |
| status | varchar(20) | DEFAULT 'pending' |
| total_amount | decimal(10,2) | DEFAULT 0 |
| discount_amount | decimal(10,2) | DEFAULT 0 |
| tax_rate | decimal(5,2) | DEFAULT 0 |
| tax_amount | decimal(10,2) | DEFAULT 0 |
| final_amount | decimal(10,2) | DEFAULT 0 |
| notes | text | nullable |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Status Values:**
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Operations:**

```typescript
// Create order with items
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    order_number: 'ORD-001',
    customer_name: 'John Doe',
    status: 'pending',
    total_amount: 500.00,
    final_amount: 500.00
  })
  .select()
  .single()

// Then create order items
const { error: itemsError } = await supabase
  .from('order_items')
  .insert([
    {
      order_id: order.id,
      product_id: productId,
      product_size: '12m',
      quantity: 2,
      unit_price: 250.00,
      total_price: 500.00
    }
  ])

// Read orders with items
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (*)
  `)
  .order('created_at', { ascending: false })
```

---

### Order Items

**Table: `order_items`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| order_id | uuid | REFERENCES orders(id) ON DELETE CASCADE |
| product_id | uuid | REFERENCES products(id) |
| product_size | varchar(10) | NOT NULL |
| quantity | integer | DEFAULT 1 |
| unit_price | decimal(10,2) | NOT NULL |
| total_price | decimal(10,2) | NOT NULL |
| created_at | timestamptz | DEFAULT now() |

---

### Invoices

**Table: `invoices`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| invoice_number | varchar(50) | NOT NULL, UNIQUE |
| order_id | uuid | REFERENCES orders(id) ON DELETE SET NULL |
| customer_name | varchar(255) | NOT NULL |
| customer_email | varchar(255) | nullable |
| customer_phone | varchar(50) | nullable |
| customer_address | text | nullable |
| status | varchar(20) | DEFAULT 'draft' |
| subtotal | decimal(10,2) | DEFAULT 0 |
| discount_amount | decimal(10,2) | DEFAULT 0 |
| tax_rate | decimal(5,2) | DEFAULT 0 |
| tax_amount | decimal(10,2) | DEFAULT 0 |
| total_amount | decimal(10,2) | DEFAULT 0 |
| paid_amount | decimal(10,2) | DEFAULT 0 |
| due_date | date | nullable |
| issue_date | date | nullable |
| notes | text | nullable |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Status Values:**
- `draft`
- `sent`
- `paid`
- `overdue`
- `cancelled`

---

### Invoice Items

**Table: `invoice_items`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| invoice_id | uuid | REFERENCES invoices(id) ON DELETE CASCADE |
| product_id | uuid | REFERENCES products(id) |
| product_code | varchar(100) | nullable |
| product_size | varchar(10) | nullable |
| description | text | nullable |
| quantity | integer | DEFAULT 1 |
| unit_price | decimal(10,2) | NOT NULL |
| total_price | decimal(10,2) | NOT NULL |
| created_at | timestamptz | DEFAULT now() |

---

### Expense Categories

**Table: `expense_categories`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| name | varchar(100) | NOT NULL, UNIQUE |
| description | text | nullable |
| color | varchar(7) | DEFAULT '#6B7280' |
| created_at | timestamptz | DEFAULT now() |

---

### Expenses

**Table: `expenses`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| expense_number | varchar(50) | NOT NULL, UNIQUE |
| category_id | uuid | REFERENCES expense_categories(id) ON DELETE SET NULL |
| description | text | NOT NULL |
| amount | decimal(10,2) | NOT NULL |
| expense_date | date | DEFAULT CURRENT_DATE |
| payment_method | varchar(50) | DEFAULT 'cash' |
| vendor_name | varchar(255) | nullable |
| receipt_url | text | nullable |
| notes | text | nullable |
| status | varchar(20) | DEFAULT 'confirmed' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Payment Methods:**
- `cash`
- `card`
- `bank_transfer`
- `check`
- `other`

**Status Values:**
- `pending`
- `confirmed`
- `rejected`

---

## File Storage

### Upload Product Photo

```typescript
const file = selectedFile
const fileExt = file.name.split('.').pop()
const fileName = `${Date.now()}.${fileExt}`
const filePath = `public/${fileName}`

const { data, error } = await supabase.storage
  .from('carpet-photos')
  .upload(filePath, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('carpet-photos')
  .getPublicUrl(filePath)
```

### Upload Receipt

```typescript
const { data, error } = await supabase.storage
  .from('receipts')
  .upload(fileName, file)
```

### Delete File

```typescript
const { error } = await supabase.storage
  .from('carpet-photos')
  .remove([filePath])
```

---

## TypeScript Types

All database types are defined in `src/types/database.ts`:

```typescript
// Product types
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

// Product with sizes
export type ProductWithSizes = Product & {
  product_sizes: ProductSize[]
}

// Order types
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderWithItems = Order & {
  order_items: OrderItem[]
}

// Invoice types
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceWithItems = Invoice & {
  invoice_items: InvoiceItem[]
}

// Expense types
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseWithCategory = Expense & {
  expense_categories: ExpenseCategory | null
}
```

---

## Error Handling

All Supabase operations return an error object:

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')

if (error) {
  console.error('Error:', error.message)
  // Handle error appropriately
  return
}

// Use data safely
```

Common error codes:
- `23505` - Unique constraint violation
- `42P01` - Table does not exist
- `PGRST116` - Row not found


