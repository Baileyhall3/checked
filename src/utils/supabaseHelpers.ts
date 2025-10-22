import { supabase } from '@/api/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

interface QueryResult<T> {
  data: T | null
  error: PostgrestError | null
}

export const supabaseHelpers = {
  /**
   * Fetch a single record by ID
   */
  async getById<T extends Record<string, any>>(
    table: string,
    id: string | number,
    columns: string | string[] = '*'
  ): Promise<QueryResult<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(columns as any)
        .eq('id', id)
        .single<T>()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error(`Error fetching ${table} with ID ${id}:`, error)
      return { data: null, error: error as PostgrestError }
    }
  },

  /**
   * Create a new record
   */
  async create<T extends Record<string, any>>(
    table: string,
    data: T
  ): Promise<QueryResult<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single<T>()

      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      console.error(`Error creating record in ${table}:`, error)
      return { data: null, error: error as PostgrestError }
    }
  },

  /**
   * Execute a custom query
   */
  async customQuery<T>(
    queryFn: (supabase: typeof import('@/api/supabase')['supabase']) => Promise<{ data: T; error: PostgrestError | null }>
  ): Promise<QueryResult<T>> {
    try {
      const { data, error } = await queryFn(supabase)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error executing custom query:', error)
      return { data: null, error: error as PostgrestError }
    }
  },
}
