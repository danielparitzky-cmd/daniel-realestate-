import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../database.types'

export type BuyerRow = Tables<'buyers'>
export type BuyerUpdateRow = Tables<'buyer_updates'>

export const buyersKey = ['buyers'] as const
export const buyerUpdatesKey = (buyerId: string) => ['buyer_updates', buyerId] as const

export function useBuyers() {
  return useQuery({
    queryKey: buyersKey,
    queryFn: async (): Promise<BuyerRow[]> => {
      const { data, error } = await supabase.from('buyers').select('*').order('full_name')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useBuyer(id: string | undefined) {
  const query = useBuyers()
  return { ...query, data: id ? query.data?.find((b) => b.id === id) : undefined }
}

export function useCreateBuyer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: TablesInsert<'buyers'>) => {
      const { data, error } = await supabase.from('buyers').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: buyersKey }),
  })
}

export function useUpdateBuyer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<'buyers'> }) => {
      const { data, error } = await supabase
        .from('buyers')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: buyersKey }),
  })
}

export function useDeleteBuyer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('buyers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: buyersKey }),
  })
}

/** לוג ה-CRM. הכי חדש למעלה — created_at הוא התאריך+שעה שמוצגים. */
export function useBuyerUpdates(buyerId: string | undefined) {
  return useQuery({
    queryKey: buyerUpdatesKey(buyerId ?? ''),
    enabled: Boolean(buyerId),
    queryFn: async (): Promise<BuyerUpdateRow[]> => {
      const { data, error } = await supabase
        .from('buyer_updates')
        .select('*')
        .eq('buyer_id', buyerId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAddBuyerUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ buyerId, body }: { buyerId: string; body: string }) => {
      const { data, error } = await supabase
        .from('buyer_updates')
        .insert({ buyer_id: buyerId, body })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, { buyerId }) =>
      void qc.invalidateQueries({ queryKey: buyerUpdatesKey(buyerId) }),
  })
}
