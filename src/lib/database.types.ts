// נוצר אוטומטית מהסכמה של Supabase. אל תערוך ידנית —
// אחרי כל מיגרציה, צור מחדש (Supabase CLI: `supabase gen types typescript`).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      buyer_property_interest: {
        Row: {
          buyer_id: string
          created_at: string
          property_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          property_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'buyer_property_interest_buyer_id_fkey'
            columns: ['buyer_id']
            isOneToOne: false
            referencedRelation: 'buyers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'buyer_property_interest_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
        ]
      }
      buyer_updates: {
        Row: {
          body: string
          buyer_id: string
          created_at: string
          id: string
        }
        Insert: {
          body: string
          buyer_id: string
          created_at?: string
          id?: string
        }
        Update: {
          body?: string
          buyer_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'buyer_updates_buyer_id_fkey'
            columns: ['buyer_id']
            isOneToOne: false
            referencedRelation: 'buyers'
            referencedColumns: ['id']
          },
        ]
      }
      buyers: {
        Row: {
          callback_date: string | null
          callback_done: boolean
          created_at: string
          full_name: string
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          callback_date?: string | null
          callback_done?: boolean
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          callback_date?: string | null
          callback_done?: boolean
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          city: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          balcony_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          build_year: number | null
          city: string | null
          condition: string | null
          created_at: string
          description: string | null
          floor: number | null
          has_balcony: boolean
          has_safe_room: boolean
          has_storage: boolean
          id: string
          internal_notes: string | null
          main_image_id: string | null
          neighborhood_id: string | null
          parking_spots: number
          price: number | null
          property_type: string | null
          rooms: number | null
          seller_id: string | null
          size_sqm: number | null
          status: string
          total_floors: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          balcony_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          build_year?: number | null
          city?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          floor?: number | null
          has_balcony?: boolean
          has_safe_room?: boolean
          has_storage?: boolean
          id?: string
          internal_notes?: string | null
          main_image_id?: string | null
          neighborhood_id?: string | null
          parking_spots?: number
          price?: number | null
          property_type?: string | null
          rooms?: number | null
          seller_id?: string | null
          size_sqm?: number | null
          status?: string
          total_floors?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          balcony_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          build_year?: number | null
          city?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          floor?: number | null
          has_balcony?: boolean
          has_safe_room?: boolean
          has_storage?: boolean
          id?: string
          internal_notes?: string | null
          main_image_id?: string | null
          neighborhood_id?: string | null
          parking_spots?: number
          price?: number | null
          property_type?: string | null
          rooms?: number | null
          seller_id?: string | null
          size_sqm?: number | null
          status?: string
          total_floors?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'properties_main_image_fk'
            columns: ['main_image_id']
            isOneToOne: false
            referencedRelation: 'property_images'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'properties_neighborhood_id_fkey'
            columns: ['neighborhood_id']
            isOneToOne: false
            referencedRelation: 'neighborhoods'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'properties_seller_id_fkey'
            columns: ['seller_id']
            isOneToOne: false
            referencedRelation: 'sellers'
            referencedColumns: ['id']
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          position: number
          property_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          property_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          property_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: 'property_images_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
        ]
      }
      sellers: {
        Row: {
          created_at: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      share_links: {
        Row: {
          created_at: string
          id: string
          property_id: string
          revoked_at: string | null
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          revoked_at?: string | null
          token?: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          revoked_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: 'share_links_property_id_fkey'
            columns: ['property_id']
            isOneToOne: false
            referencedRelation: 'properties'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: {
      get_shared_property: { Args: { p_token: string }; Returns: Json }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
