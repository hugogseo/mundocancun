export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'editor' | 'user'
export type PackageStatus = 'draft' | 'published' | 'archived'
export type BookingMode = 'inquiry' | 'quote' | 'payment'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type QuoteStatus = 'pending' | 'sent' | 'accepted' | 'rejected'
export type InquirySource = 'website' | 'chat' | 'email' | 'phone' | 'other'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      cat_categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      pkg_packages: {
        Row: {
          id: string
          title: string
          slug: string
          destination: string
          short_description: string | null
          long_description: string | null
          price_base: number
          currency: string
          duration_nights: number
          min_guests: number
          max_guests: number
          cover_url: string | null
          status: PackageStatus
          booking_mode: BookingMode
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          destination: string
          short_description?: string | null
          long_description?: string | null
          price_base: number
          currency?: string
          duration_nights: number
          min_guests?: number
          max_guests?: number
          cover_url?: string | null
          status?: PackageStatus
          booking_mode?: BookingMode
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          destination?: string
          short_description?: string | null
          long_description?: string | null
          price_base?: number
          currency?: string
          duration_nights?: number
          min_guests?: number
          max_guests?: number
          cover_url?: string | null
          status?: PackageStatus
          booking_mode?: BookingMode
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pkg_package_images: {
        Row: {
          id: string
          package_id: string
          image_url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          package_id: string
          image_url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          package_id?: string
          image_url?: string
          sort_order?: number
          created_at?: string
        }
      }
      pkg_package_tags: {
        Row: {
          package_id: string
          category_id: string
        }
        Insert: {
          package_id: string
          category_id: string
        }
        Update: {
          package_id?: string
          category_id?: string
        }
      }
      lead_inquiries: {
        Row: {
          id: string
          package_id: string | null
          full_name: string
          email: string
          phone: string | null
          dates: string | null
          guests: number | null
          budget: number | null
          notes: string | null
          source: InquirySource
          created_at: string
        }
        Insert: {
          id?: string
          package_id?: string | null
          full_name: string
          email: string
          phone?: string | null
          dates?: string | null
          guests?: number | null
          budget?: number | null
          notes?: string | null
          source?: InquirySource
          created_at?: string
        }
        Update: {
          id?: string
          package_id?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          dates?: string | null
          guests?: number | null
          budget?: number | null
          notes?: string | null
          source?: InquirySource
          created_at?: string
        }
      }
      lead_quotes: {
        Row: {
          id: string
          package_id: string | null
          inquiry_id: string | null
          price_total: number
          currency: string
          status: QuoteStatus
          details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          package_id?: string | null
          inquiry_id?: string | null
          price_total: number
          currency?: string
          status?: QuoteStatus
          details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          package_id?: string | null
          inquiry_id?: string | null
          price_total?: number
          currency?: string
          status?: QuoteStatus
          details?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          package_id: string | null
          user_id: string | null
          checkin: string
          checkout: string
          guests: number
          amount: number
          currency: string
          status: BookingStatus
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          package_id?: string | null
          user_id?: string | null
          checkin: string
          checkout: string
          guests: number
          amount: number
          currency?: string
          status?: BookingStatus
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          package_id?: string | null
          user_id?: string | null
          checkin?: string
          checkout?: string
          guests?: number
          amount?: number
          currency?: string
          status?: BookingStatus
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          amount: number
          currency: string
          status: PaymentStatus
          raw: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          amount: number
          currency?: string
          status?: PaymentStatus
          raw?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          amount?: number
          currency?: string
          status?: PaymentStatus
          raw?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          channel: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          channel?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          channel?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          sender: string
          message: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender: string
          message: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender?: string
          message?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Profile = Tables<'profiles'>
export type Category = Tables<'cat_categories'>
export type Package = Tables<'pkg_packages'>
export type PackageImage = Tables<'pkg_package_images'>
export type PackageTag = Tables<'pkg_package_tags'>
export type LeadInquiry = Tables<'lead_inquiries'>
export type LeadQuote = Tables<'lead_quotes'>
export type Booking = Tables<'bookings'>
export type Payment = Tables<'payments'>
export type ChatSession = Tables<'chat_sessions'>
export type ChatMessage = Tables<'chat_messages'>

// Extended types with relations
export type PackageWithDetails = Package & {
  images: PackageImage[]
  categories: Category[]
}
