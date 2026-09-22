import service from '@/core/service'

type UploadSignature = {
  url: string
  fields: Record<string, string>
  path: string
}

type UploadFailure = {
  error: string
}

const uploadsService = service('uploads')

export default async function uploadFile(file: File): Promise<string> {
  const signature = await uploadsService.post<UploadSignature>({ name: file.name, size: file.size, type: file.type })

  const form = new FormData()

  Object.entries(signature.fields).forEach(([name, value]) => form.append(name, value))
  form.append('file', file)

  const response = await fetch(signature.url, { method: 'POST', body: form }).catch(() => {
    const failure: UploadFailure = { error: 'No se pudo subir el archivo. Revisa tu conexión a internet.' }
    throw failure
  })

  if (!response.ok) {
    const failure: UploadFailure = { error: uploadErrorMessage(response.status) }
    throw failure
  }

  return signature.path
}

function uploadErrorMessage(status: number): string {
  if (status === 400) {
    return 'El archivo no cumple con lo permitido. Revisa el tamaño y el formato.'
  }

  if (status === 403) {
    return 'La autorización para subir el archivo venció. Intenta de nuevo.'
  }

  return 'No se pudo subir el archivo. Intenta de nuevo.'
}
