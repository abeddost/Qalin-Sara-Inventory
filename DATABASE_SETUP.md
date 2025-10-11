# 🗄️ Database Setup Guide

## ❌ Current Issue
The Orders, Invoices, and Expenses pages are showing errors because the database tables don't exist yet.

## 🛠️ Solution: Run Database Migrations

You have **3 options** to create the missing database tables:

### **Option 1: Via Supabase Dashboard (Recommended - Easiest)**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/wsvhtvxyvzkvfofryncp
2. **Navigate to SQL Editor** (left sidebar)
3. **Run these migrations one by one**:

#### **Step 1: Create Orders Tables**
Copy and paste this SQL into the SQL Editor and run it:

```sql
-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_size VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_customer_name ON orders(customer_name);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all order_items" ON order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert order_items" ON order_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update order_items" ON order_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete order_items" ON order_items FOR DELETE USING (auth.role() = 'authenticated');
```

#### **Step 2: Create Invoices Tables**
Run this SQL:

```sql
-- Create invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  issue_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_items table
CREATE TABLE invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_code VARCHAR(100),
  product_size VARCHAR(50),
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer_name ON invoices(customer_name);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all invoices" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert invoices" ON invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete invoices" ON invoices FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all invoice_items" ON invoice_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert invoice_items" ON invoice_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update invoice_items" ON invoice_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete invoice_items" ON invoice_items FOR DELETE USING (auth.role() = 'authenticated');
```

#### **Step 3: Create Expenses Tables**
Run this final SQL:

```sql
-- Create expense_categories table
CREATE TABLE expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_number VARCHAR(50) UNIQUE NOT NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'check', 'other')),
  vendor_name VARCHAR(255),
  receipt_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_expenses_expense_number ON expenses(expense_number);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_vendor_name ON expenses(vendor_name);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- Enable RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all expense_categories" ON expense_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert expense_categories" ON expense_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update expense_categories" ON expense_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete expense_categories" ON expense_categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all expenses" ON expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert expenses" ON expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update expenses" ON expenses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete expenses" ON expenses FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default expense categories
INSERT INTO expense_categories (name, description, color) VALUES
('Rent', 'Office/store rent payments', '#EF4444'),
('Utilities', 'Electricity, water, internet bills', '#F59E0B'),
('Marketing', 'Advertising and promotional expenses', '#8B5CF6'),
('Transportation', 'Delivery and transportation costs', '#06B6D4'),
('Office Supplies', 'Stationery and office materials', '#10B981'),
('Maintenance', 'Equipment and facility maintenance', '#F97316'),
('Insurance', 'Business insurance premiums', '#84CC16'),
('Other', 'Miscellaneous expenses', '#6B7280');
```

### **Option 2: Install Supabase CLI (Advanced)**

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Link to your project**:
   ```bash
   supabase link --project-ref wsvhtvxyvzkvfofryncp
   ```

3. **Run migrations**:
   ```bash
   supabase db push
   ```

### **Option 3: Manual Table Creation**

If you prefer, you can manually create each table through the Supabase Dashboard:
1. Go to **Table Editor**
2. Create each table with the columns specified above

## ✅ **After Running Migrations**

Once you've run the migrations:

1. **Refresh your app** - the errors should disappear
2. **Orders page** will show "No orders yet" instead of errors
3. **Invoices page** will work properly
4. **Expenses page** will work with default categories
5. **Analytics page** will show additional metrics

## 🎯 **Expected Result**

After running all 3 migration scripts, you should have:
- ✅ **orders** table with 12 columns
- ✅ **order_items** table with 8 columns  
- ✅ **invoices** table with 17 columns
- ✅ **invoice_items** table with 9 columns
- ✅ **expense_categories** table with 8 default categories
- ✅ **expenses** table with 12 columns
- ✅ All tables have proper RLS policies for security

## 🚨 **If You Get Errors**

- Make sure you're running each SQL script **one at a time**
- Check that the `products` table already exists (it should from your initial setup)
- If you get foreign key errors, make sure to run the scripts in order: Orders → Invoices → Expenses

---

**After completing this setup, all your new pages will work perfectly!** 🎉

