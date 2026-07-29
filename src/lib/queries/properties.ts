import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../database.types'

export type PropertyRow = Tables<'properties'>
export type NeighborhoodRow = Tables<'neighborhoods'>
export type PropertyImageRow = Tables<'property_images'>

/** נכס עם השכונה והתמונות שלו, והתמונה הראשית כבר מחושבת. */
export type Property = PropertyRow & {
  neighborhood: NeighborhoodRow | null
  images: PropertyImageRow[]
  mainImage: PropertyImageRow | null
}

export const propertiesKey = ['properties'] as const

/**
 * טוען את כל הנכסים בבת אחת. למתווך יחיד הכמות קטנה, וזה מה שמאפשר
 * חיפוש type-ahead מיידי בצד הקליינט בלי קריאת שרת לכל הקלדה.
 *
 * שתי שאילתות ואיחוד ב-JS ולא embed מקונן, כי בין properties ל-property_images
 * יש שני FK הפוכים (main_image_id ו-property_id) ו-PostgREST לא יודע לבחור.
 */
async function fetchProperties(): Promise<Property[]> {
  const [propsRes, imagesRes] = await Promise.all([
    supabase
      .from('properties')
      .select('*, neighborhood:neighborhoods(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('property_images')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  if (propsRes.error) throw propsRes.error
  if (imagesRes.error) throw imagesRes.error

  const byProperty = new Map<string, PropertyImageRow[]>()
  for (const img of imagesRes.data ?? []) {
    const list = byProperty.get(img.property_id)
    if (list) list.push(img)
    else byProperty.set(img.property_id, [img])
  }

  return (propsRes.data ?? []).map((row) => {
    const images = byProperty.get(row.id) ?? []
    // התמונה הראשית היא המסומנת; אם לא סומנה — הראשונה בגלריה
    const mainImage = images.find((i) => i.id === row.main_image_id) ?? images[0] ?? null
    return { ...row, images, mainImage }
  })
}

export function useProperties() {
  return useQuery({ queryKey: propertiesKey, queryFn: fetchProperties })
}

/** נגזר מרשימת הנכסים — מקור אמת אחד, בלי סנכרון קאשים. */
export function useProperty(id: string | undefined) {
  const query = useProperties()
  return {
    ...query,
    data: id ? query.data?.find((p) => p.id === id) : undefined,
  }
}

export function useCreateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: TablesInsert<'properties'>) => {
      const { data, error } = await supabase.from('properties').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: propertiesKey }),
  })
}

export function useUpdateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<'properties'> }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: propertiesKey }),
  })
}

export function useDeleteProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // התמונות ב-storage לא נמחקות ב-cascade של ה-DB — מנקים אותן קודם
      const { data: images } = await supabase
        .from('property_images')
        .select('storage_path')
        .eq('property_id', id)

      const paths = (images ?? []).map((i) => i.storage_path)
      if (paths.length > 0) {
        await supabase.storage.from('property-images').remove(paths)
      }

      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: propertiesKey }),
  })
}
