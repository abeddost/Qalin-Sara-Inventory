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


