-- Create product_sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL CHECK (size IN ('12m', '9m', '6m', '4m', '3m', '2m')),
    count INTEGER DEFAULT 0 CHECK (count >= 0),
    purchase_price DECIMAL(10,2) DEFAULT 0.00 CHECK (purchase_price >= 0),
    selling_price DECIMAL(10,2) DEFAULT 0.00 CHECK (selling_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, size)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_size ON product_sizes(size);

-- Create trigger for updated_at
CREATE TRIGGER update_product_sizes_updated_at 
    BEFORE UPDATE ON product_sizes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view product_sizes" ON product_sizes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert product_sizes" ON product_sizes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product_sizes" ON product_sizes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product_sizes" ON product_sizes
    FOR DELETE USING (auth.role() = 'authenticated');
