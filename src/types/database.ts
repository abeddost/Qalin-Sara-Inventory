export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          code: string
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_sizes: {
        Row: {
          id: string
          product_id: string
          size: '12m' | '9m' | '6m' | '4m' | '3m' | '2m'
          count: number
          purchase_price: number
          selling_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: '12m' | '9m' | '6m' | '4m' | '3m' | '2m'
          count?: number
          purchase_price?: number
          selling_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: '12m' | '9m' | '6m' | '4m' | '3m' | '2m'
          count?: number
          purchase_price?: number
          selling_price?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          customer_address: string | null
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          discount_amount: number
          tax_rate: number
          tax_amount: number
          final_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          discount_amount?: number
          tax_rate?: number
          tax_amount?: number
          final_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          discount_amount?: number
          tax_rate?: number
          tax_amount?: number
          final_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_size: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_size: string
          quantity?: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_size?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          order_id: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          customer_address: string | null
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal: number
          discount_amount: number
          tax_rate: number
          tax_amount: number
          total_amount: number
          paid_amount: number
          due_date: string | null
          issue_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          order_id?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal?: number
          discount_amount?: number
          tax_rate?: number
          tax_amount?: number
          total_amount?: number
          paid_amount?: number
          due_date?: string | null
          issue_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          order_id?: string | null
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          subtotal?: number
          discount_amount?: number
          tax_rate?: number
          tax_amount?: number
          total_amount?: number
          paid_amount?: number
          due_date?: string | null
          issue_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string | null
          product_code: string | null
          product_size: string | null
          description: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id?: string | null
          product_code?: string | null
          product_size?: string | null
          description?: string | null
          quantity?: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string | null
          product_code?: string | null
          product_size?: string | null
          description?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      expense_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          expense_number: string
          category_id: string | null
          description: string
          amount: number
          expense_date: string
          payment_method: 'cash' | 'card' | 'bank_transfer' | 'check' | 'other'
          vendor_name: string | null
          receipt_url: string | null
          notes: string | null
          status: 'pending' | 'confirmed' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          expense_number: string
          category_id?: string | null
          description: string
          amount: number
          expense_date?: string
          payment_method?: 'cash' | 'card' | 'bank_transfer' | 'check' | 'other'
          vendor_name?: string | null
          receipt_url?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          expense_number?: string
          category_id?: string | null
          description?: string
          amount?: number
          expense_date?: string
          payment_method?: 'cash' | 'card' | 'bank_transfer' | 'check' | 'other'
          vendor_name?: string | null
          receipt_url?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type ProductSize = Database['public']['Tables']['product_sizes']['Row']
export type ProductSizeInsert = Database['public']['Tables']['product_sizes']['Insert']
export type ProductSizeUpdate = Database['public']['Tables']['product_sizes']['Update']

export type ProductWithSizes = Product & {
  product_sizes: ProductSize[]
}

// Order types
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']

export type OrderWithItems = Order & {
  order_items: OrderItem[]
}

// Invoice types
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert']
export type InvoiceItemUpdate = Database['public']['Tables']['invoice_items']['Update']

export type InvoiceWithItems = Invoice & {
  invoice_items: InvoiceItem[]
}

// Expense types
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
export type ExpenseCategoryInsert = Database['public']['Tables']['expense_categories']['Insert']
export type ExpenseCategoryUpdate = Database['public']['Tables']['expense_categories']['Update']

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type ExpenseWithCategory = Expense & {
  expense_categories: ExpenseCategory | null
}
