export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accreditations: {
        Row: {
          country: string | null
          description: string | null
          id: number
          logo_url: string | null
          name: string
          slug: string | null
        }
        Insert: {
          country?: string | null
          description?: string | null
          id?: number
          logo_url?: string | null
          name: string
          slug?: string | null
        }
        Update: {
          country?: string | null
          description?: string | null
          id?: number
          logo_url?: string | null
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string | null
          category_id: string | null
          category_slug: string | null
          content_html: string | null
          content_md: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          reading_time_min: number | null
          search: unknown
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string | null
          category_id?: string | null
          category_slug?: string | null
          content_html?: string | null
          content_md?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_time_min?: number | null
          search?: unknown
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string | null
          category_id?: string | null
          category_slug?: string | null
          content_html?: string | null
          content_md?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_time_min?: number | null
          search?: unknown
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          clinic_id: string | null
          contact_method: string
          created_at: string
          id: string
          name: string
          phone: string
          service: string
          status: string
        }
        Insert: {
          clinic_id?: string | null
          contact_method: string
          created_at?: string
          id?: string
          name: string
          phone: string
          service: string
          status?: string
        }
        Update: {
          clinic_id?: string | null
          contact_method?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          service?: string
          status?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      clinic_accreditations: {
        Row: {
          accreditation_id: number
          clinic_id: string
        }
        Insert: {
          accreditation_id: number
          clinic_id: string
        }
        Update: {
          accreditation_id?: number
          clinic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_accreditations_accreditation_id_fkey"
            columns: ["accreditation_id"]
            isOneToOne: false
            referencedRelation: "accreditations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_amenities: {
        Row: {
          clinic_id: string
          enabled: boolean
          key: string
        }
        Insert: {
          clinic_id: string
          enabled: boolean
          key: string
        }
        Update: {
          clinic_id?: string
          enabled?: boolean
          key?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_amenities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_amenities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_amenities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_amenities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_amenities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_amenities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_amenities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_applications: {
        Row: {
          address: string | null
          city: string | null
          clinic_name: string
          contact_email: string | null
          contact_first_name: string | null
          contact_last_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          clinic_name: string
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          clinic_name?: string
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_categories: {
        Row: {
          category_id: number
          clinic_id: string
        }
        Insert: {
          category_id: number
          clinic_id: string
        }
        Update: {
          category_id?: number
          clinic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_hours: {
        Row: {
          clinic_id: string
          close: string | null
          dow: number | null
          hours_text: string | null
          id: string
          is_closed: boolean | null
          open: string | null
          weekday: number
        }
        Insert: {
          clinic_id: string
          close?: string | null
          dow?: number | null
          hours_text?: string | null
          id?: string
          is_closed?: boolean | null
          open?: string | null
          weekday: number
        }
        Update: {
          clinic_id?: string
          close?: string | null
          dow?: number | null
          hours_text?: string | null
          id?: string
          is_closed?: boolean | null
          open?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinic_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_hours_raw: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          payload: Json | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          payload?: Json | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_hours_raw_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_hours_raw_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_hours_raw_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_hours_raw_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_hours_raw_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_hours_raw_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_hours_raw_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_images: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          sort: number | null
          title: string | null
          url: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          sort?: number | null
          title?: string | null
          url: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          sort?: number | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_images_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_images_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_images_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_images_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_images_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_images_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_images_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_inquiries: {
        Row: {
          clinic_id: string
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_languages: {
        Row: {
          clinic_id: string
          language_id: number
        }
        Insert: {
          clinic_id: string
          language_id: number
        }
        Update: {
          clinic_id?: string
          language_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinic_languages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_languages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_languages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_languages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_languages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_languages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_languages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_members: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_premises: {
        Row: {
          clinic_id: string
          premise_id: number
        }
        Insert: {
          clinic_id: string
          premise_id: number
        }
        Update: {
          clinic_id?: string
          premise_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinic_premises_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_premises_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_premises_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_premises_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_premises_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_premises_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_premises_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_premises_premise_id_fkey"
            columns: ["premise_id"]
            isOneToOne: false
            referencedRelation: "premises"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_profile_drafts: {
        Row: {
          basic_info: Json | null
          clinic_id: string
          doctors: Json | null
          facilities: Json | null
          gallery: Json | null
          hours: Json | null
          location: Json | null
          pricing: Json | null
          services: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          basic_info?: Json | null
          clinic_id: string
          doctors?: Json | null
          facilities?: Json | null
          gallery?: Json | null
          hours?: Json | null
          location?: Json | null
          pricing?: Json | null
          services?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          basic_info?: Json | null
          clinic_id?: string
          doctors?: Json | null
          facilities?: Json | null
          gallery?: Json | null
          hours?: Json | null
          location?: Json | null
          pricing?: Json | null
          services?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_profile_drafts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_profile_drafts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_profile_drafts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_profile_drafts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_profile_drafts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_profile_drafts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_profile_drafts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_reports: {
        Row: {
          clinic_id: string
          contact: string | null
          created_at: string | null
          details: string | null
          id: string
          relationship: string | null
          reporter: string | null
          status: string | null
        }
        Insert: {
          clinic_id: string
          contact?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          relationship?: string | null
          reporter?: string | null
          status?: string | null
        }
        Update: {
          clinic_id?: string
          contact?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          relationship?: string | null
          reporter?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_requests: {
        Row: {
          clinic_id: string | null
          contact_method: string
          created_at: string
          doctor_id: string | null
          id: string
          name: string
          origin: string
          phone: string
          service_id: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          contact_method: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          name: string
          origin: string
          phone: string
          service_id?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          contact_method?: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          name?: string
          origin?: string
          phone?: string
          service_id?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_services: {
        Row: {
          clinic_id: string
          currency: string | null
          price: number | null
          service_id: number
        }
        Insert: {
          clinic_id: string
          currency?: string | null
          price?: number | null
          service_id: number
        }
        Update: {
          clinic_id?: string
          currency?: string | null
          price?: number | null
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_sources: {
        Row: {
          clinic_id: string
          content_hash: string | null
          first_seen_at: string
          last_seen_at: string
          src: string
          src_id: string
        }
        Insert: {
          clinic_id: string
          content_hash?: string | null
          first_seen_at?: string
          last_seen_at?: string
          src: string
          src_id: string
        }
        Update: {
          clinic_id?: string
          content_hash?: string | null
          first_seen_at?: string
          last_seen_at?: string
          src?: string
          src_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_sources_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_sources_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_sources_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_sources_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_sources_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_sources_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_sources_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_staff: {
        Row: {
          bio: string | null
          clinic_id: string
          created_at: string | null
          id: string
          languages: string[] | null
          name: string
          photo_url: string | null
          position: string | null
          title: string | null
        }
        Insert: {
          bio?: string | null
          clinic_id: string
          created_at?: string | null
          id?: string
          languages?: string[] | null
          name: string
          photo_url?: string | null
          position?: string | null
          title?: string | null
        }
        Update: {
          bio?: string | null
          clinic_id?: string
          created_at?: string | null
          id?: string
          languages?: string[] | null
          name?: string
          photo_url?: string | null
          position?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_translations: {
        Row: {
          clinic_id: string
          field: string
          locale: string
          value: string
        }
        Insert: {
          clinic_id: string
          field: string
          locale: string
          value: string
        }
        Update: {
          clinic_id?: string
          field?: string
          locale?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_translations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_translations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_translations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_translations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_translations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_translations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_translations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_travel_services: {
        Row: {
          clinic_id: string
          travel_service_id: number
        }
        Insert: {
          clinic_id: string
          travel_service_id: number
        }
        Update: {
          clinic_id?: string
          travel_service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinic_travel_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_travel_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_travel_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_travel_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_travel_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_travel_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_travel_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_travel_services_travel_service_id_fkey"
            columns: ["travel_service_id"]
            isOneToOne: false
            referencedRelation: "travel_services"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          about: string | null
          address: string | null
          amenities: Json | null
          city: string | null
          country: string | null
          created_at: string
          district: string | null
          document: unknown
          extra_email: string | null
          id: string
          is_official_partner: boolean
          is_published: boolean
          lat: number | null
          latitude: number | null
          lng: number | null
          longitude: number | null
          main_email: string | null
          map_embed_url: string | null
          moderation_comment: string | null
          moderation_status: string
          name: string
          owner_id: string | null
          province: string | null
          search: unknown
          slug: string
          status: string | null
          time_zone: string | null
          verified_by_medtravel: boolean
        }
        Insert: {
          about?: string | null
          address?: string | null
          amenities?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          district?: string | null
          document?: unknown
          extra_email?: string | null
          id?: string
          is_official_partner?: boolean
          is_published?: boolean
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          main_email?: string | null
          map_embed_url?: string | null
          moderation_comment?: string | null
          moderation_status?: string
          name: string
          owner_id?: string | null
          province?: string | null
          search?: unknown
          slug: string
          status?: string | null
          time_zone?: string | null
          verified_by_medtravel?: boolean
        }
        Update: {
          about?: string | null
          address?: string | null
          amenities?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          district?: string | null
          document?: unknown
          extra_email?: string | null
          id?: string
          is_official_partner?: boolean
          is_published?: boolean
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          main_email?: string | null
          map_embed_url?: string | null
          moderation_comment?: string | null
          moderation_status?: string
          name?: string
          owner_id?: string | null
          province?: string | null
          search?: unknown
          slug?: string
          status?: string | null
          time_zone?: string | null
          verified_by_medtravel?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "clinics_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          message: string | null
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          message?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          message?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio: string | null
          clinic_id: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          photo_url: string | null
          specialization: string | null
        }
        Insert: {
          bio?: string | null
          clinic_id: string
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          photo_url?: string | null
          specialization?: string | null
        }
        Update: {
          bio?: string | null
          clinic_id?: string
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          photo_url?: string | null
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string | null
          currency: string | null
          id: string
          status: string | null
        }
        Insert: {
          amount: number
          clinic_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      new_clinic_requests: {
        Row: {
          address: string | null
          city: string | null
          clinic_name: string
          contact_first_name: string
          contact_last_name: string
          country: string | null
          created_at: string
          email: string
          id: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          clinic_name: string
          contact_first_name: string
          contact_last_name: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          clinic_name?: string
          contact_first_name?: string
          contact_last_name?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      premises: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          locale: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          locale?: string
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          locale?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          clinic_id: string
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
          relationship: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          relationship?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          relationship?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          clinic_id: string
          consent_privacy: boolean
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          rating_assistant: number
          rating_doctor: number
          rating_facilities: number
          rating_overall: number
          rating_staff: number
          rating_support: number
          review: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          clinic_id: string
          consent_privacy: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          rating_assistant: number
          rating_doctor: number
          rating_facilities: number
          rating_overall: number
          rating_staff: number
          rating_support: number
          review?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          clinic_id?: string
          consent_privacy?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          rating_assistant?: number
          rating_doctor?: number
          rating_facilities?: number
          rating_overall?: number
          rating_staff?: number
          rating_support?: number
          review?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      staging_clinics: {
        Row: {
          accreditations: string | null
          address: string | null
          categories: string | null
          city: string | null
          clinic_name: string | null
          country: string | null
          languages: string | null
          latitude: number | null
          longitude: number | null
          premises: string | null
          services: string | null
          travel_services: string | null
        }
        Insert: {
          accreditations?: string | null
          address?: string | null
          categories?: string | null
          city?: string | null
          clinic_name?: string | null
          country?: string | null
          languages?: string | null
          latitude?: number | null
          longitude?: number | null
          premises?: string | null
          services?: string | null
          travel_services?: string | null
        }
        Update: {
          accreditations?: string | null
          address?: string | null
          categories?: string | null
          city?: string | null
          clinic_name?: string | null
          country?: string | null
          languages?: string | null
          latitude?: number | null
          longitude?: number | null
          premises?: string | null
          services?: string | null
          travel_services?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          clinic_id: string
          created_at: string | null
          currency: string | null
          id: string
          status: string | null
        }
        Insert: {
          amount?: number | null
          clinic_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          amount?: number | null
          clinic_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_services: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      whatclinic_raw: {
        Row: {
          about: string | null
          accreditations: Json | null
          additional: Json | null
          address: string | null
          city: string | null
          country: string | null
          district: string | null
          error: string | null
          google_map_location: string | null
          hours: Json | null
          id: number
          images: Json | null
          imported_at: string | null
          lat: number | null
          lng: number | null
          name: string
          payment: Json | null
          processed: boolean | null
          province: string | null
          services: Json | null
          slug: string | null
          source_url: string | null
          specialty: string | null
          staff: Json | null
        }
        Insert: {
          about?: string | null
          accreditations?: Json | null
          additional?: Json | null
          address?: string | null
          city?: string | null
          country?: string | null
          district?: string | null
          error?: string | null
          google_map_location?: string | null
          hours?: Json | null
          id?: number
          images?: Json | null
          imported_at?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          payment?: Json | null
          processed?: boolean | null
          province?: string | null
          services?: Json | null
          slug?: string | null
          source_url?: string | null
          specialty?: string | null
          staff?: Json | null
        }
        Update: {
          about?: string | null
          accreditations?: Json | null
          additional?: Json | null
          address?: string | null
          city?: string | null
          country?: string | null
          district?: string | null
          error?: string | null
          google_map_location?: string | null
          hours?: Json | null
          id?: number
          images?: Json | null
          imported_at?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          payment?: Json | null
          processed?: boolean | null
          province?: string | null
          services?: Json | null
          slug?: string | null
          source_url?: string | null
          specialty?: string | null
          staff?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      moderation_queue: {
        Row: {
          city: string | null
          clinic_id: string | null
          country: string | null
          created_at: string | null
          draft_status: string | null
          draft_updated_at: string | null
          is_published: boolean | null
          moderation_status: string | null
          name: string | null
          slug: string | null
          status: string | null
        }
        Relationships: []
      }
      moderation_queue_v2: {
        Row: {
          city: string | null
          clinic_id: string | null
          country: string | null
          draft_status: string | null
          draft_updated_at: string | null
          moderation_status: string | null
          name: string | null
          slug: string | null
        }
        Relationships: []
      }
      mv_admin_reviews: {
        Row: {
          author: string | null
          clinic_name: string | null
          created_at: string | null
          id: string | null
          rating: number | null
          status: string | null
        }
        Relationships: []
      }
      mv_catalog_clinics: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          district: string | null
          id: string | null
          min_price: number | null
          min_price_currency: string | null
          name: string | null
          province: string | null
          slug: string | null
        }
        Relationships: []
      }
      mv_clinic_inquiries: {
        Row: {
          clinic_city: string | null
          clinic_country: string | null
          clinic_district: string | null
          clinic_id: string | null
          clinic_name: string | null
          clinic_province: string | null
          clinic_slug: string | null
          created_at: string | null
          email: string | null
          id: string | null
          message: string | null
          name: string | null
          phone: string | null
          status: string | null
        }
        Relationships: []
      }
      mv_clinic_requests: {
        Row: {
          clinic_id: string | null
          clinic_name: string | null
          clinic_slug: string | null
          contact_method: string | null
          created_at: string | null
          doctor_id: string | null
          id: string | null
          name: string | null
          origin: string | null
          phone: string | null
          service_id: number | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_daily_bookings: {
        Row: {
          clinic_id: string | null
          day: string | null
          total_bookings: number | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_daily_clinic_applications: {
        Row: {
          day: string | null
          total_applications: number | null
        }
        Relationships: []
      }
      mv_daily_contacts: {
        Row: {
          day: string | null
          total_contacts: number | null
        }
        Relationships: []
      }
      mv_daily_inquiries: {
        Row: {
          clinic_id: string | null
          day: string | null
          total_inquiries: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_daily_reports: {
        Row: {
          clinic_id: string | null
          day: string | null
          total_reports: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_daily_reviews: {
        Row: {
          avg_overall_rating: number | null
          clinic_id: string | null
          day: string | null
          total_reviews: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_clinic_accreditations: {
        Row: {
          clinic_id: string | null
          description: string | null
          logo_url: string | null
          name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_accreditations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_clinic_dashboard: {
        Row: {
          bookings_done: number | null
          bookings_new: number | null
          clinic_id: string | null
          reports_new: number | null
          revenue_paid: number | null
          reviews_pending: number | null
        }
        Relationships: []
      }
      v_clinic_services: {
        Row: {
          clinic_id: string | null
          description: string | null
          name: string | null
          price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_customer_bookings: {
        Row: {
          clinic_id: string | null
          contact_method: string | null
          created_at: string | null
          id: string | null
          name: string | null
          phone: string | null
          service: string | null
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          contact_method?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          service?: never
          status?: string | null
        }
        Update: {
          clinic_id?: string | null
          contact_method?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          service?: never
          status?: string | null
        }
        Relationships: []
      }
      v_customer_clinic_requests: {
        Row: {
          clinic_id: string | null
          contact_method: string | null
          created_at: string | null
          id: string | null
          name: string | null
          phone: string | null
          service: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "booking_requests_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_customer_patients: {
        Row: {
          actual_cost: number | null
          clinic_id: string | null
          created_at: string | null
          patient_id: string | null
          patient_name: string | null
          phone: string | null
          preliminary_cost: number | null
          service: string | null
          status: string | null
        }
        Insert: {
          actual_cost?: never
          clinic_id?: string | null
          created_at?: string | null
          patient_id?: string | null
          patient_name?: string | null
          phone?: string | null
          preliminary_cost?: never
          service?: never
          status?: string | null
        }
        Update: {
          actual_cost?: never
          clinic_id?: string | null
          created_at?: string | null
          patient_id?: string | null
          patient_name?: string | null
          phone?: string | null
          preliminary_cost?: never
          service?: never
          status?: string | null
        }
        Relationships: []
      }
      v_customer_reports: {
        Row: {
          clinic_id: string | null
          contact: string | null
          created_at: string | null
          details: string | null
          id: string | null
          relationship: string | null
          reporter: string | null
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          contact?: never
          created_at?: string | null
          details?: never
          id?: string | null
          relationship?: never
          reporter?: never
          status?: string | null
        }
        Update: {
          clinic_id?: string | null
          contact?: never
          created_at?: string | null
          details?: never
          id?: string | null
          relationship?: never
          reporter?: never
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_customer_reviews: {
        Row: {
          clinic_id: string | null
          comment: string | null
          created_at: string | null
          id: string | null
          rating: number | null
          reviewer: string | null
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: never
          reviewer?: never
          status?: string | null
        }
        Update: {
          clinic_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: never
          reviewer?: never
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_customer_transactions: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          currency: string | null
          invoice_id: string | null
          invoice_price: number | null
          status: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          currency?: string | null
          invoice_id?: string | null
          invoice_price?: number | null
          status?: never
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          currency?: string | null
          invoice_id?: string | null
          invoice_price?: number | null
          status?: never
        }
        Relationships: [
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue_v2"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_catalog_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "mv_clinic_inquiries"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_clinic_dashboard"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_public_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_public_clinics: {
        Row: {
          about: string | null
          address: string | null
          amenities: Json | null
          city: string | null
          country: string | null
          created_at: string | null
          district: string | null
          document: unknown
          extra_email: string | null
          id: string | null
          is_official_partner: boolean | null
          is_published: boolean | null
          lat: number | null
          latitude: number | null
          lng: number | null
          longitude: number | null
          main_email: string | null
          map_embed_url: string | null
          moderation_comment: string | null
          moderation_status: string | null
          name: string | null
          owner_id: string | null
          province: string | null
          search: unknown
          slug: string | null
          status: string | null
          time_zone: string | null
          verified_by_medtravel: boolean | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          amenities?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          district?: string | null
          document?: unknown
          extra_email?: string | null
          id?: string | null
          is_official_partner?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          main_email?: string | null
          map_embed_url?: string | null
          moderation_comment?: string | null
          moderation_status?: string | null
          name?: string | null
          owner_id?: string | null
          province?: string | null
          search?: unknown
          slug?: string | null
          status?: string | null
          time_zone?: string | null
          verified_by_medtravel?: boolean | null
        }
        Update: {
          about?: string | null
          address?: string | null
          amenities?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          district?: string | null
          document?: unknown
          extra_email?: string | null
          id?: string | null
          is_official_partner?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          main_email?: string | null
          map_embed_url?: string | null
          moderation_comment?: string | null
          moderation_status?: string | null
          name?: string | null
          owner_id?: string | null
          province?: string | null
          search?: unknown
          slug?: string | null
          status?: string | null
          time_zone?: string | null
          verified_by_medtravel?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      blog_cat_id: { Args: { p_slug: string }; Returns: string }
      blog_index: {
        Args: {
          p_category_slug?: string
          p_page?: number
          p_page_size?: number
          p_q?: string
          p_tag_slug?: string
        }
        Returns: {
          facets: Json
          items: Json
          total_count: number
        }[]
      }
      blog_post_detail: { Args: { p_slug: string }; Returns: Json }
      catalog_browse: {
        Args: {
          p_category_slug: string
          p_city?: string
          p_country?: string
          p_district?: string
          p_limit?: number
          p_offset?: number
          p_province?: string
          p_service_slugs?: string[]
          p_sort?: string
        }
        Returns: {
          facets: Json
          items: Json
          total_count: number
        }[]
      }
      catalog_browse_basic: {
        Args: {
          p_category_slug: string
          p_city?: string
          p_country?: string
          p_district?: string
          p_limit?: number
          p_offset?: number
          p_province?: string
          p_service_slugs?: string[]
          p_sort?: string
        }
        Returns: {
          facets: Json
          items: Json
          total_count: number
        }[]
      }
      clinic_ids_for_user: { Args: { p_user: string }; Returns: string[] }
      has_any: { Args: { needles: string[]; src: string }; Returns: boolean }
      import_whatclinic_row: { Args: { p_id: number }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_clinic_member: { Args: { c_id: string }; Returns: boolean }
      is_customer: { Args: never; Returns: boolean }
      parse_amenities: { Args: { src: string }; Returns: Json }
      publish_clinic_from_draft: {
        Args: { p_clinic_id: string }
        Returns: undefined
      }
      raise_and_return_int: { Args: { msg: string }; Returns: number }
      raise_exception: { Args: { msg: string }; Returns: undefined }
      reject_clinic_draft: {
        Args: { p_clinic_id: string; p_reason: string }
        Returns: undefined
      }
      search_clinics_v1: {
        Args: { limit_count?: number; q: string }
        Returns: {
          category: string
          clinic_id: string
          clinic_name: string
          clinic_slug: string
          image_url: string
        }[]
      }
      seo_treatment_price_range: {
        Args: {
          p_category_slug: string
          p_city?: string
          p_country?: string
          p_district?: string
          p_service_slugs: string[]
        }
        Returns: {
          max: number
          min: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      slugify: { Args: { txt: string }; Returns: string }
      try_parse_lat_lng: {
        Args: { src: string }
        Returns: {
          lat: number
          lng: number
        }[]
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      booking_origin: "homepage" | "service" | "doctor"
      booking_status: "new" | "confirmed" | "cancelled" | "completed"
      contact_method: "phone" | "whatsapp" | "telegram" | "email"
      locale: "en" | "ru" | "pl"
      moderation_status: "pending" | "approved" | "rejected"
      user_role: "guest" | "patient" | "customer" | "partner" | "admin"
      week_day: "1" | "2" | "3" | "4" | "5" | "6" | "7"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_origin: ["homepage", "service", "doctor"],
      booking_status: ["new", "confirmed", "cancelled", "completed"],
      contact_method: ["phone", "whatsapp", "telegram", "email"],
      locale: ["en", "ru", "pl"],
      moderation_status: ["pending", "approved", "rejected"],
      user_role: ["guest", "patient", "customer", "partner", "admin"],
      week_day: ["1", "2", "3", "4", "5", "6", "7"],
    },
  },
} as const
