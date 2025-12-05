-- Add tax_rate column to orders table
ALTER TABLE orders ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN orders.tax_rate IS 'Tax rate as a percentage (e.g., 9 for 9%)';




