export type UploadRequest = {
  file: File
  folder: string
  signal?: AbortSignal
}

export type UploadedFile = {
  url: string
  name: string
  sizeInBytes: number
  contentType: string
}

export function upload(_request: UploadRequest): Promise<UploadedFile> {
  throw new Error('Not implemented: upload')
}
