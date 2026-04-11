import { createUploadthing } from 'uploadthing/server'
import type { FileRouter } from 'uploadthing/server'
import { z } from 'zod'

const f = createUploadthing()

export const ourFileRouter = {
  productImages: f({
    image: { maxFileSize: '4MB', maxFileCount: 5 },
  })
    .input(z.object({ productId: z.string().optional() }))
    .middleware(async () => {
      return { uploadedBy: 'admin' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for user:', metadata.uploadedBy)
      console.log('file url:', file.url)
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
