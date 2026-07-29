import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import type { Tables } from '../database.types'

export type NeighborhoodRow = Tables<'neighborhoods'>

export const neighborhoodsKey = ['neighborhoods'] as const

export function useNeighborhoods() {
  return useQuery({
    queryKey: neighborhoodsKey,
    queryFn: async (): Promise<NeighborhoodRow[]> => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('*')
        .order('city')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })
}

/**
 * יוצר שכונה תוך כדי מילוי הטופס. יש unique(city, name) ב-DB, אז אם השכונה
 * כבר קיימת מחזירים את הקיימת במקום להיכשל — המתווך לא צריך לדעת מזה.
 */
export function useCreateNeighborhood() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ city, name }: { city: string; name: string }) => {
      const trimmed = { city: city.trim(), name: name.trim() }

      const { data, error } = await supabase
        .from('neighborhoods')
        .insert(trimmed)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          const { data: existing, error: findError } = await supabase
            .from('neighborhoods')
            .select('*')
            .eq('city', trimmed.city)
            .eq('name', trimmed.name)
            .single()
          if (findError) throw findError
          return existing
        }
        throw error
      }

      return data
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: neighborhoodsKey }),
  })
}
