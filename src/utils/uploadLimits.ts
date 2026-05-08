export const CLOUDINARY_SINGLE_IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const CLOUDINARY_SINGLE_IMAGE_MAX_LABEL = '10MB'

export const DOCUMENT_UPLOAD_MAX_BYTES = CLOUDINARY_SINGLE_IMAGE_MAX_BYTES
export const DOCUMENT_UPLOAD_MAX_LABEL = CLOUDINARY_SINGLE_IMAGE_MAX_LABEL

export function assertCloudinaryImageSize(file: File): void {
  if (file.size > CLOUDINARY_SINGLE_IMAGE_MAX_BYTES) {
    throw new Error(`Ảnh quá lớn. Tối đa ${CLOUDINARY_SINGLE_IMAGE_MAX_LABEL}.`)
  }
}
