import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import type { Tables } from '../database.types'

export type InterestRow = Tables<'buyer_property_interest'>

export const interestKey = ['buyer_property_interest'] as const

/**
 * טבלה אחת שמייצגת גם "מתעניינים בנכס X" וגם "וישליסט של לקוח Y".
 * שורה אחת נראית משני הצדדים — הדו-כיווניות היא המבנה עצמו, לא לוגיקת סנכרון.
 * לכן טוענים את כל השורות פעם אחת וגוזרים את שני הכיוונים בצד הקליינט.
 */
export function useInterests() {
  return useQuery({
    queryKey: interestKey,
    queryFn: async (): Promise<InterestRow[]> => {
      const { data, error } = await supabase.from('buyer_property_interest').select('*')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAddInterest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ buyerId, propertyId }: { buyerId: string; propertyId: string }) => {
      const { error } = await supabase
        .from('buyer_property_interest')
        .insert({ buyer_id: buyerId, property_id: propertyId })
      // 23505 = הקשר כבר קיים. זו לא שגיאה מבחינת המשתמש, התוצאה זהה.
      if (error && error.code !== '23505') throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: interestKey }),
  })
}

export function useRemoveInterest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ buyerId, propertyId }: { buyerId: string; propertyId: string }) => {
      const { error } = await supabase
        .from('buyer_property_interest')
        .delete()
        .eq('buyer_id', buyerId)
        .eq('property_id', propertyId)
      if (error) throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: interestKey }),
  })
}
