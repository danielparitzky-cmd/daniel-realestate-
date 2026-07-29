import { useRef, useState, type ChangeEvent } from 'react'
import {
  useDeletePropertyImage,
  useSetMainImage,
  useUploadPropertyImages,
} from '../../lib/queries/propertyImages'
import { imageUrl } from '../../lib/supabaseClient'
import { Button } from '../../components/ui/Button'
import { ImageIcon, PlusIcon, StarIcon, TrashIcon } from '../../components/icons'
import type { Property } from '../../lib/queries/properties'

export function ImageManager({ property }: { property: Property }) {
  const upload = useUploadPropertyImages()
  const remove = useDeletePropertyImage()
  const setMain = useSetMainImage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const mainId = property.mainImage?.id ?? null

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // כדי שבחירת אותו קובץ שוב תפעיל אירוע
    if (files.length === 0) return

    setLocalError(null)
    try {
      await upload.mutateAsync({
        propertyId: property.id,
        files,
        startPosition: property.images.length,
        hasMainImage: property.main_image_id != null,
      })
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'ההעלאה נכשלה')
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-bold text-brand-700">
          תמונות {property.images.length > 0 && `(${property.images.length})`}
        </h2>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="ms-auto"
          loading={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <PlusIcon className="size-4" />
          {upload.isPending ? 'מעלה…' : 'הוסף תמונות'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void onFiles(e)}
        />
      </div>

      {property.images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-white/60 px-6 py-10 text-center transition-colors hover:border-brand-300 hover:bg-brand-50"
        >
          <ImageIcon className="size-8 text-brand-300" />
          <span className="text-sm font-semibold text-slate-700">אין עדיין תמונות</span>
          <span className="text-xs text-slate-500">
            התמונות נדחסות בדפדפן לפני ההעלאה, כדי שיעלו מהר גם על סלולר
          </span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {property.images.map((image) => {
            const isMain = image.id === mainId
            return (
              <li
                key={image.id}
                className="group relative aspect-4/3 overflow-hidden rounded-xl bg-brand-100 ring-1 ring-brand-200"
              >
                <img
                  src={imageUrl(image.storage_path)}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />

                {isMain && (
                  <span className="absolute start-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                    ראשית
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2">
                  {!isMain && (
                    <button
                      type="button"
                      title="הפוך לתמונה ראשית"
                      onClick={() => setMain.mutate({ propertyId: property.id, imageId: image.id })}
                      className="flex size-10 items-center justify-center rounded-lg bg-white/90 text-slate-700 transition-colors hover:bg-white hover:text-brand-600 sm:size-8"
                    >
                      <StarIcon className="size-4.5" />
                      <span className="sr-only">הפוך לתמונה ראשית</span>
                    </button>
                  )}
                  <button
                    type="button"
                    title="מחק תמונה"
                    onClick={() => {
                      if (confirm('למחוק את התמונה?')) remove.mutate(image)
                    }}
                    className="flex size-10 items-center justify-center rounded-lg bg-white/90 text-slate-700 transition-colors hover:bg-white hover:text-red-600 sm:size-8"
                  >
                    <TrashIcon className="size-4.5" />
                    <span className="sr-only">מחק תמונה</span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {(localError || remove.error || setMain.error) && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {localError ?? remove.error?.message ?? setMain.error?.message}
        </p>
      )}
    </div>
  )
}
