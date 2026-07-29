import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { propertiesKey } from './properties'
import type { Tables, TablesInsert, TablesUpdate } from '../database.types'

export type SellerRow = Tables<'sellers'>

export const sellersKey = ['sellers'] as const

export function useSellers() {
  return useQuery({
    queryKey: sellersKey,
    queryFn: async (): Promise<SellerRow[]> => {
      const { data, error } = await supabase.from('sellers').select('*').order('full_name')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useSeller(id: string | undefined) {
  const query = useSellers()
  return { ...query, data: id ? query.data?.find((s) => s.id === id) : undefined }
}

export function useCreateSeller() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: TablesInsert<'sellers'>) => {
      const { data, error } = await supabase.from('sellers').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: sellersKey }),
  })
}

export function useUpdateSeller() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<'sellers'> }) => {
      const { data, error } = await supabase
        .from('sellers')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: sellersKey }),
  })
}

export function useDeleteSeller() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // ה-FK על properties.seller_id הוא בלי on delete, אז משחררים את הנכסים קודם
      const { error: unlinkError } = await supabase
        .from('properties')
        .update({ seller_id: null })
        .eq('seller_id', id)
      if (unlinkError) throw unlinkError

      const { error } = await supabase.from('sellers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sellersKey })
      void qc.invalidateQueries({ queryKey: propertiesKey })
    },
  })
}

/**
 * שיוך מוכר לנכס. seller_id הוא עמודה בודדת, לא M2M — כלומר מוכר אחד לנכס
 * נאכף מבנית, ושיוך מוכר חדש מחליף את הקודם במקום להוסיף לצידו.
 * sellerId = null מבטל שיוך.
 */
export function useSetPropertySeller() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      propertyId,
      sellerId,
    }: {
      propertyId: string
      sellerId: string | null
    }) => {
      const { error } = await supabase
        .from('properties')
        .update({ seller_id: sellerId })
        .eq('id', propertyId)
      if (error) throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: propertiesKey }),
  })
}
