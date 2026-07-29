import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import type { Tables } from '../database.types'

export type ShareLinkRow = Tables<'share_links'>

export const shareLinksKey = (propertyId: string) => ['share_links', propertyId] as const

export function useShareLinks(propertyId: string | undefined) {
  return useQuery({
    queryKey: shareLinksKey(propertyId ?? ''),
    enabled: Boolean(propertyId),
    queryFn: async (): Promise<ShareLinkRow[]> => {
      const { data, error } = await supabase
        .from('share_links')
        .select('*')
        .eq('property_id', propertyId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateShareLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (propertyId: string) => {
      // הטוקן נוצר ב-DB (128 ביט אקראיים), לא בקליינט
      const { data, error } = await supabase
        .from('share_links')
        .insert({ property_id: propertyId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, propertyId) =>
      void qc.invalidateQueries({ queryKey: shareLinksKey(propertyId) }),
  })
}

/** ביטול ולא מחיקה — כדי שיישאר תיעוד שהלינק היה קיים ומתי בוטל. */
export function useRevokeShareLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; propertyId: string }) => {
      const { error } = await supabase
        .from('share_links')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, { propertyId }) =>
      void qc.invalidateQueries({ queryKey: shareLinksKey(propertyId) }),
  })
}

export function shareUrl(token: string): string {
  return `${window.location.origin}/s/${token}`
}
