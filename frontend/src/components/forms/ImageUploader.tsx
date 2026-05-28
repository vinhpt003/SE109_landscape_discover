import { useRef, useState } from 'react'
import { uploadsService } from '../../services/uploads.service'

interface ImageUploaderProps {
  value: string | null
  publicId?: string | null
  onChange: (next: { url: string | null; publicId: string | null }) => void
  /** Visual variant: 'cover' shows a wide preview, 'avatar' is a round small one */
  variant?: 'cover' | 'avatar'
  className?: string
  label?: string
  hint?: string
}

const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export default function ImageUploader({
  value,
  publicId,
  onChange,
  variant = 'cover',
  className = '',
  label,
  hint = 'JPG / PNG / WEBP / GIF — tối đa 5MB',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const triggerPick = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    setError('')
    if (file.size > MAX_BYTES) {
      setError('File vượt quá 5MB')
      return
    }
    setUploading(true)
    try {
      const result = await uploadsService.uploadImage(file)
      onChange({ url: result.url, publicId: result.publicId })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleClear = async () => {
    if (publicId) {
      uploadsService.deleteImage(publicId).catch(() => {})
    }
    onChange({ url: null, publicId: null })
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container border border-outline-variant shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[36px] text-outline">person</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerPick}
              disabled={uploading}
              className="px-4 py-2 rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary-fixed transition-colors disabled:opacity-60"
            >
              {uploading ? 'Đang tải...' : value ? 'Đổi ảnh' : 'Tải lên'}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                disabled={uploading}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors disabled:opacity-60"
              >
                Xóa
              </button>
            )}
          </div>
          <p className="font-caption text-caption text-outline">{hint}</p>
          {error && <p className="font-caption text-caption text-error">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{label}</label>
      )}
      <div
        onClick={!value && !uploading ? triggerPick : undefined}
        className={`relative border-2 border-dashed border-outline-variant rounded-lg bg-surface-bright overflow-hidden transition-colors ${
          !value && !uploading ? 'cursor-pointer hover:border-primary hover:bg-primary-fixed/10' : ''
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-56 object-cover" />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={triggerPick}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-md text-label-md hover:bg-surface-container-lowest disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">edit</span>
                Đổi
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-error/90 backdrop-blur-sm text-on-error font-label-md text-label-md hover:bg-error disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">delete</span>
                Xóa
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            {uploading ? (
              <>
                <div className="w-10 h-10 rounded-full border-4 border-primary-fixed border-t-primary animate-spin mb-3" />
                <p className="font-body-md text-body-md text-on-surface-variant">Đang tải lên Cloudinary...</p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[40px] text-outline mb-2">cloud_upload</span>
                <p className="font-label-md text-label-md text-on-surface">Bấm để chọn ảnh</p>
                <p className="font-caption text-caption text-outline mt-1">{hint}</p>
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="font-caption text-caption text-error mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
