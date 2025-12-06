# Database Setup Guide

This guide walks you through setting up the Supabase database for Qalin Sara Inventory.

## Prerequisites

- A Supabase account ([sign up free](https://supabase.com))
- Access to Supabase Dashboard

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: qalin-sara-inventory
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Run Migrations

Navigate to **SQL Editor** in your Supabase dashboard and run each migration file in order:

### Migration Order

| Order | File | Description |
|-------|------|-------------|
| 1 | `20240101000001_create_products.sql` | Products table |
| 2 | `20240101000002_create_product_sizes.sql` | Product size variants |
| 3 | `20240101000003_create_storage_bucket.sql` | Photo storage bucket |
| 4 | `20240101000004_create_orders.sql` | Orders and order items |
| 5 | `20240101000005_create_invoices.sql` | Invoices and invoice items |
| 6 | `20240101000006_create_expenses.sql` | Expenses and categories |
| 7 | `20240101000007_create_receipts_storage.sql` | Receipt storage bucket |
| 8 | `20240101000008_add_tax_rate_to_orders.sql` | Tax rate column |

### Running Migrations

1. Open **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy the contents of each migration file
4. Click **Run** (or Ctrl+Enter)
5. Verify the migration succeeded
6. Repeat for each migration file in order

## Step 4: Configure Storage Buckets

After running migrations, verify the storage buckets are created:

1. Go to **Storage** in Supabase Dashboard
2. You should see:
   - `carpet-photos` - For product images
   - `receipts` - For expense receipts

### Storage Policies

The migrations create RLS policies that allow authenticated users to:
- Upload files
- Read files
- Delete their own files

## Step 5: Create Your First User

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - Email address
   - Password
4. Click **Create user**

> **Note**: Email confirmation is disabled by default for manually created users.

## Database Schema

### Tables Overview

```
┌─────────────────────┐
│     products        │
├─────────────────────┤
│ id (PK)             │
│ code (unique)       │
│ photo_url           │
│ created_at          │
│ updated_at          │
└─────────┬───────────┘
          │
          │ 1:N
          ▼
┌─────────────────────┐
│   product_sizes     │
├─────────────────────┤
│ id (PK)             │
│ product_id (FK)     │
│ size                │
│ count               │
│ purchase_price      │
│ selling_price       │
└─────────────────────┘
```

### Products Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | VARCHAR | Unique product code |
| photo_url | TEXT | URL to product image |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Product Sizes Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | Foreign key to products |
| size | ENUM | Size variant (12m, 9m, 6m, 4m, 3m, 2m) |
| count | INTEGER | Inventory count |
| purchase_price | DECIMAL | Cost price |
| selling_price | DECIMAL | Retail price |

### Orders Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_number | VARCHAR | Unique order number |
| customer_name | VARCHAR | Customer name |
| customer_email | VARCHAR | Customer email |
| customer_phone | VARCHAR | Customer phone |
| customer_address | TEXT | Delivery address |
| status | ENUM | Order status |
| total_amount | DECIMAL | Subtotal before discounts |
| discount_amount | DECIMAL | Discount applied |
| tax_rate | DECIMAL | Tax percentage |
| tax_amount | DECIMAL | Calculated tax |
| final_amount | DECIMAL | Total after tax |
| notes | TEXT | Order notes |

### Invoices Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoice_number | VARCHAR | Unique invoice number |
| order_id | UUID | Optional link to order |
| customer_* | - | Customer details |
| status | ENUM | Invoice status |
| subtotal | DECIMAL | Subtotal |
| discount_amount | DECIMAL | Discount |
| tax_rate | DECIMAL | Tax percentage |
| tax_amount | DECIMAL | Tax amount |
| total_amount | DECIMAL | Total |
| due_date | DATE | Payment due date |
| issue_date | DATE | Invoice date |

### Expenses Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| expense_number | VARCHAR | Unique expense number |
| category_id | UUID | Link to category |
| description | TEXT | Expense description |
| amount | DECIMAL | Amount |
| expense_date | DATE | Date of expense |
| payment_method | ENUM | Payment method |
| vendor_name | VARCHAR | Vendor name |
| receipt_url | TEXT | Receipt image URL |
| status | ENUM | Approval status |

## Row Level Security (RLS)

All tables have RLS enabled with policies that require authentication:

- **SELECT**: Authenticated users can read all rows
- **INSERT**: Authenticated users can insert rows
- **UPDATE**: Authenticated users can update rows
- **DELETE**: Authenticated users can delete rows

## Troubleshooting

### Common Issues

**1. "relation does not exist" error**
- Ensure you ran all migrations in order
- Check the SQL Editor for errors

**2. Storage upload fails**
- Verify the storage bucket exists
- Check RLS policies on the bucket

**3. Authentication issues**
- Ensure your environment variables are correct
- Check that the user exists in Supabase Auth

### Getting Help

If you encounter issues:
1. Check the Supabase logs in Dashboard
2. Review the browser console for errors
3. Verify your environment variables are set correctly



