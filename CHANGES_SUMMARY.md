# Changes Summary - Order and Invoice Tax Fix

## Overview
Fixed the order and invoice system to properly handle tax calculations and data transfer between orders and invoices.

## Changes Made

### 1. Database Changes
**File:** `supabase/migrations/20240101000008_add_tax_rate_to_orders.sql`
- Added `tax_rate` column to the `orders` table
- This column stores the tax percentage (e.g., 9 for 9%)

**Action Required:** You need to apply this migration to your database:

```bash
# If using Supabase CLI
supabase db push

# Or if using the Supabase dashboard, run this SQL:
ALTER TABLE orders ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
COMMENT ON COLUMN orders.tax_rate IS 'Tax rate as a percentage (e.g., 9 for 9%)';
```

### 2. TypeScript Types Update
**File:** `src/types/database.ts`
- Added `tax_rate: number` to the `orders` table type definitions
- Updated Row, Insert, and Update types

### 3. Order Form Updates
**File:** `src/components/orders/order-form.tsx`

**Changes:**
- Changed `tax_amount` field in form state to `tax_rate`
- Updated the UI label from "Tax Amount" to "Tax Rate (%)"
- Modified `calculateTotals()` function to:
  - Calculate tax from percentage: `tax = (taxableAmount × taxRate) / 100`
  - Apply discount before calculating tax
- Updated form submission to save both `tax_rate` and calculated `tax_amount`
- Updated the order summary display to show "Tax (X%): $Y.YY"
- **CRITICAL FIX:** Removed auto-fill of "Price per m²" when selecting a size
  - Previously, it was incorrectly using inventory's `selling_price` (price per unit)
  - Now users must manually enter the actual price per m² for each order
  - This prevents confusion between unit pricing and area-based pricing

**How it works now:**
1. User selects product and size
2. User manually enters:
   - Total Area (m²)
   - Price per m²
3. System calculates: `Item Total = Total Area × Price per m²`
4. User enters a discount amount (if any)
5. User enters a tax rate as a percentage (e.g., 10)
6. System calculates (REVERSE TAX - tax included in total):
   - `Total = Subtotal - Discount` (this is the FINAL total)
   - `Tax Amount = Total × (Tax Rate / 100)`
   - `Before Tax = Total - Tax Amount`

**Important:** The total remains FIXED. Tax is calculated FROM the total, not added to it.

**Example:**
- Subtotal: $900.00
- Discount: $31.00
- **Total: $869.00** (fixed)
- Tax Rate: 10%
- Tax (10%): $86.90 (10% OF the $869 total)
- Before Tax: $782.10 ($869 - $86.90)

### 4. Invoice Form Updates
**File:** `src/components/invoices/invoice-form.tsx`

**Changes:**
- Updated `handleOrderChange()` function to load `discount_amount` and `tax_rate` from the selected order
- Now when you select an order, the discount and tax rate fields are automatically populated

### 5. Inventory Page (No Changes Required)
**File:** `src/components/products/product-table.tsx`
- Already correctly displays price per unit (purchase_price and selling_price)
- No changes needed ✓

## What's Fixed

✅ **Inventory Page:** Continues to display price per unit (purchase and selling prices)

✅ **Order Page:** 
- **IMPORTANT FIX:** Removed auto-fill of "Price per m²" from inventory's selling price
  - The inventory selling_price is per unit/carpet, NOT per square meter
  - Users must now manually enter the price per m² for each order item
  - This ensures correct pricing calculation based on area
- User can enter size (m²) and price per square meter
- Total is automatically calculated: `Total = Total Area × Price per m²`
- **TAX CALCULATION CHANGE:** Tax is now calculated FROM the total (reverse/inclusive)
  - The total amount stays FIXED
  - When entering 10% tax rate, it calculates what portion of the total is tax
  - Example: Total $869 with 10% tax → Tax = $86.90, Before Tax = $782.10
  - The total remains $869 (not $869 + tax)

✅ **Invoice Page:**
- Now correctly retrieves discount and tax rate from the selected order
- Discount and tax fields are properly populated when loading from an order

## Testing Checklist

1. **Test Order Creation:**
   - Create a new order with items
   - Select product and size
   - **Manually enter** Total Area (m²) and Price per m²
   - Verify: Price per m² field should be empty by default (no auto-fill)
   - Verify: Item total calculates correctly (Total Area × Price per m²)
   - Add a discount amount (e.g., $31)
   - Add a tax rate (e.g., 10%)
   - Verify the totals calculate correctly (REVERSE TAX):
     - Subtotal = sum of items (e.g., $900)
     - Discount = $31
     - **Total = Subtotal - Discount = $869** (FIXED - this is the final amount)
     - Tax = Total × (10 / 100) = $86.90 (10% OF the total)
     - Before Tax = Total - Tax = $782.10
   - **Important:** Total should NOT increase when you add tax - it stays at $869

2. **Test Order to Invoice:**
   - Create an order with discount and tax
   - Create a new invoice
   - Select the order from the dropdown
   - Verify discount_amount and tax_rate fields are populated
   - Verify items are loaded correctly

3. **Test Inventory Display:**
   - Go to Products/Inventory page
   - Verify each size shows:
     - Count
     - Purchase price per unit
     - Selling price per unit

## Migration Instructions

**IMPORTANT:** Before testing, you must apply the database migration:

### Option 1: Using Supabase CLI (Recommended)
```bash
cd supabase
supabase db push
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run this SQL:
```sql
ALTER TABLE orders ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
COMMENT ON COLUMN orders.tax_rate IS 'Tax rate as a percentage (e.g., 9 for 9%)';
```

### Option 3: Manual Migration via Supabase Dashboard
1. Go to Database → Tables → orders
2. Click "Add Column"
3. Name: `tax_rate`
4. Type: `numeric` with precision 5, scale 2
5. Default: `0`
6. Nullable: No

## Notes

- Existing orders in the database will have `tax_rate = 0` by default
- The system is backward compatible - existing orders without tax_rate will still work
- Tax calculation follows the standard formula: Tax = (Subtotal - Discount) × (Tax Rate / 100)
- All changes maintain the existing data structure and don't break any existing functionality

