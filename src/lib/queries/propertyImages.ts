import { useMutation, useQueryClient } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import { supabase } from '../supabaseClient'
import { propertiesKey, type PropertyImageRow } from './properties'

/**
 * המתווך מצלם מהאייפון בשטח על סלולר. דוחסים בדפדפן לפני ההעלאה,
 * אחרת מעלים 4MB לתמונה על רשת איטית.
 */
const COMPRESSION = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: 'image/jpeg',
} as const

export function useUploadPropertyImages() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      propertyId,
      files,
      startPosition,
      hasMainImage,
    }: {
      propertyId: string
      files: File[]
      startPosition: number
      hasMainImage: boolean
    }): Promise<PropertyImageRow[]> => {
      const uploaded: PropertyImageRow[] = []

      for (const [index, file] of files.entries()) {
        const compressed = await imageCompression(file, COMPRESSION)
        const path = `${propertyId}/${crypto.randomUUID()}.jpg`

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(path, compressed, { contentType: 'image/jpeg', upsert: false })
        if (uploadError) throw uploadError

        const { data, error } = await supabase
          .from('property_images')
          .insert({ property_id: propertyId, storage_path: path, position: startPosition + index })
          .select()
          .single()

        if (error) {
          // הרשומה נכשלה — לא משאירים קובץ יתום ב-storage
          await supabase.storage.from('property-images').remove([path])
          throw error
        }

        uploaded.push(data)
      }

      // הראשונה שהועלתה הופכת לראשית, אלא אם כבר נבחרה אחת
      if (!hasMainImage && uploaded.length > 0) {
        await supabase
          .from('properties')
          .update({ main_image_id: uploaded[0].id })
          .eq('id', propertyId)
      }

      return uploaded
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: propertiesKey }),
  })
}

export function useDeletePropertyImage() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (image: PropertyImageRow) => {
      // ה-FK של main_image_id הוא on delete set null, אז הסימון מתנקה מעצמו
      const { error } = await supabase.from('property_images').delete().eq('id', image.id)
      if (error) throw error
      await supabase.storage.from('property-images').remove([image.storage_path])
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: propertiesKey }),
  })
}

export function useSetMainImage() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ propertyId, imageId }: { propertyId: string; imageId: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ main_image_id: imageId })
        .eq('id', propertyId)
      if (error) throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: propertiesKey }),
  })
}
