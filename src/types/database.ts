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
