import { createUploadthing } from 'uploadthing/server'
import type { FileRouter } from 'uploadthing/server'

const f = createUploadthing()

export const ourFileRouter = {
  productImages: f({
    image: { maxFileSize: '4MB', maxFileCount: 5 },
  })
    .middleware(async () => {
      return {}
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete:', file.url)
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
