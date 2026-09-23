# 11 · Subida de archivos

## Propósito

Fija cómo el cliente sube archivos: el API firma, el navegador envía los bytes directo al bucket y
el recurso guarda solo la ruta que devolvió la firma. Cubre `src/core/upload.js`, los dos campos de
formulario que lo usan (`FormUploadFiles` y `FormUploadAvatar`) y `getPictureSrc`, que convierte una
ruta guardada en una URL que se puede pintar. Se usa en la **Fase 7** (subida de archivos), con
`core/service.js` ([04-core.md](04-core.md#coreservicejs)), `useForm`
([05-hooks.md](05-hooks.md#useform)) y los componentes de formulario
([09-componentes.md](09-componentes.md#formularios)) ya en su lugar.

## Flujo

```txt
1. Firma      navegador ──POST /api/uploads {name, size, type}──▶ API (exige sesión)
                        ◀──────────── {url, fields, path} ────────
2. Bytes      navegador ──POST multipart (fields… + file) a url──▶ bucket   (204 vacío o XML de error)
3. Guardado   el campo del formulario toma `path`; el formulario lo envía al API con el resto del recurso
4. Lectura    <img src={getPictureSrc(path)}> ──GET ${apiDomain}/api/files/<path>──▶ API ──302──▶ bucket
```

1. **Firma.** `uploadFile(file)` llama a `POST /api/uploads` con `service()`
   ([04-core.md](04-core.md#coreservicejs)) mandando solo metadatos: `{name, size, type}`. El endpoint
   exige sesión (la cookie viaja con `credentials: 'include'`), rechaza extensiones y tamaños no
   permitidos y devuelve la firma ([11-subida-de-archivos.md](11-subida-de-archivos.md#contrato-de-la-firma)).
2. **Bytes.** El navegador arma un `FormData` con los `fields` de la firma y el archivo al final, y
   lo envía con `fetch` directo a `url`, el bucket. **Los bytes nunca pasan por el API**: el API no
   carga con el ancho de banda ni con el límite de tamaño del cuerpo de su función.
3. **Guardado.** `uploadFile` devuelve `path`. El campo del formulario lo guarda como su valor y el
   formulario lo manda al API junto con el resto del recurso (por ejemplo, `picture` en el perfil).
   Lo que el servidor haga después con esa ruta (moverla a su carpeta definitiva, validar que sea del
   usuario) es contrato del servidor; el cliente no lo decide.
4. **Lectura.** Para mostrar un archivo guardado, el cliente pinta
   `getPictureSrc(path)` = `${apiDomain}/api/files/<path>`. El API responde con una redirección a una
   URL temporal del bucket. La cookie de sesión viaja sola en ese `<img>`: la app y el API son
   same-site (`app.dominio.com` y `api.dominio.com`) y la cookie es host-only con `SameSite=Lax`, así
   que el navegador la adjunta a la carga de la imagen sin configuración extra.

## core/upload.js

Path: `src/core/upload.js`.

```js
import service from '@/core/service';

const uploadsService = service('uploads');

export default async function uploadFile (file) {
  const signature = await uploadsService.post({name: file.name, size: file.size, type: file.type});

  const form = new FormData();

  Object.entries(signature.fields).forEach(([name, value]) => form.append(name, value));
  form.append('file', file);

  const response = await fetch(signature.url, {method: 'POST', body: form}).catch(() => {
    throw {error: 'No se pudo subir el archivo. Revisa tu conexión a internet.'};
  });

  if (!response.ok) {
    throw {error: uploadErrorMessage(response.status)};
  }

  return signature.path;
}

function uploadErrorMessage (status) {
  if (status === 400) {
    return 'El archivo no cumple con lo permitido. Revisa el tamaño y el formato.';
  }

  if (status === 403) {
    return 'La autorización para subir el archivo venció. Intenta de nuevo.';
  }

  return 'No se pudo subir el archivo. Intenta de nuevo.';
}
```

Subida en dos pasos: el API firma y el navegador manda los bytes directo al bucket.

- **El primer paso usa `service()`; el segundo no puede.** `service()` antepone la base del API
  (`${apiDomain}/api/`), desempaqueta un envelope `{response, errors}` que el bucket no devuelve (el
  bucket responde `204` sin cuerpo y sus errores vienen en XML) y limpia la sesión ante un `401`. Si
  el segundo paso pasara por `service()`, una firma vencida cerraría el panel del usuario. Por eso es
  un `fetch` crudo, sin `credentials`: el bucket no necesita la cookie y la autorización viaja en los
  `fields` firmados.
- **`file` va al final del `FormData`.** El bucket parsea el multipart en streaming y empieza a
  escribir al llegar al archivo; lo que venga después se ignora. Si `file` fuera primero, los campos
  de la firma no llegarían y la subida se rechazaría.
- **Los `fields` se copian tal cual.** Son la política firmada (clave, límites, credenciales
  temporales); cambiar uno invalida la firma.
- **Mensajes propios por status.** El bucket no devuelve un mensaje en el formato del API, solo el
  status:
  - `400` → el archivo no cumple lo permitido (la política firmada limita el tamaño).
  - `403` → la autorización venció (la firma dura poco) y hay que reintentar.
  - otro → error genérico.
  - Red caída → `fetch` rechaza y se lanza el mensaje de conexión.
- **Lanza `{error}`**, la misma forma que los errores de `service()`. Los campos de subida leen
  `failure.error` sin distinguir en qué paso falló.

## FormUploadFiles

Path: `src/components/form/FormUploadFiles.utils.js`.

```js
import uploadFile from '@/core/upload';

const UUID_REGEXP = (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

export const DEFAULT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx';

export const sizeStyles = {
  xs: {
    panel: 'rounded-xl p-3',
    statusWrapper: 'gap-2.5',
    statusIconBox: 'h-9 w-9 rounded-lg',
    statusIcon: 'h-4 w-4',
    buttonSize: 'sm',
    buttonClass: 'h-8 px-3 text-xs',
    buttonIcon: 'h-3.5 w-3.5',
    list: 'gap-2',
    item: 'rounded-lg px-3 py-2',
    fileIconBox: 'h-8 w-8 rounded-lg',
    fileIcon: 'h-4 w-4',
    fileName: 'text-xs',
    meta: 'text-[11px]',
    removeButton: 'h-7 w-7',
    emptyState: 'rounded-lg px-3 py-2',
    emptyStateText: 'text-xs'
  },
  sm: {
    panel: 'rounded-xl p-4',
    statusWrapper: 'gap-3',
    statusIconBox: 'h-10 w-10 rounded-xl',
    statusIcon: 'h-4 w-4',
    buttonSize: 'sm',
    buttonClass: 'h-9 px-3.5 text-sm',
    buttonIcon: 'h-4 w-4',
    list: 'gap-2.5',
    item: 'rounded-xl px-3.5 py-2.5',
    fileIconBox: 'h-9 w-9 rounded-lg',
    fileIcon: 'h-4 w-4',
    fileName: 'text-sm',
    meta: 'text-xs',
    removeButton: 'h-8 w-8',
    emptyState: 'rounded-xl px-3.5 py-3',
    emptyStateText: 'text-sm'
  },
  md: {
    panel: 'rounded-2xl p-5',
    statusWrapper: 'gap-3',
    statusIconBox: 'h-11 w-11 rounded-xl',
    statusIcon: 'h-5 w-5',
    buttonSize: 'default',
    buttonClass: 'h-10 px-4 text-sm',
    buttonIcon: 'h-4 w-4',
    list: 'gap-3',
    item: 'rounded-xl px-4 py-3',
    fileIconBox: 'h-10 w-10 rounded-xl',
    fileIcon: 'h-4 w-4',
    fileName: 'text-sm',
    meta: 'text-xs',
    removeButton: 'h-8 w-8',
    emptyState: 'rounded-xl px-4 py-3',
    emptyStateText: 'text-sm'
  },
  lg: {
    panel: 'rounded-2xl p-6',
    statusWrapper: 'gap-4',
    statusIconBox: 'h-12 w-12 rounded-2xl',
    statusIcon: 'h-5 w-5',
    buttonSize: 'lg',
    buttonClass: 'h-11 px-5 text-sm',
    buttonIcon: 'h-4 w-4',
    list: 'gap-3',
    item: 'rounded-2xl px-4 py-3.5',
    fileIconBox: 'h-11 w-11 rounded-xl',
    fileIcon: 'h-5 w-5',
    fileName: 'text-sm',
    meta: 'text-xs',
    removeButton: 'h-9 w-9',
    emptyState: 'rounded-2xl px-4 py-3.5',
    emptyStateText: 'text-sm'
  },
  xl: {
    panel: 'rounded-[1.5rem] p-7',
    statusWrapper: 'gap-4',
    statusIconBox: 'h-14 w-14 rounded-2xl',
    statusIcon: 'h-6 w-6',
    buttonSize: 'lg',
    buttonClass: 'h-12 px-6 text-base',
    buttonIcon: 'h-5 w-5',
    list: 'gap-3.5',
    item: 'rounded-2xl px-5 py-4',
    fileIconBox: 'h-12 w-12 rounded-2xl',
    fileIcon: 'h-5 w-5',
    fileName: 'text-base',
    meta: 'text-sm',
    removeButton: 'h-10 w-10',
    emptyState: 'rounded-2xl px-5 py-4',
    emptyStateText: 'text-sm'
  }
};

export function normalizeMultiValue (value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => typeof item === 'string' && item);
}

export function getStoredFiles ({multiple, value}) {
  if (multiple) {
    return value;
  }

  if (!value) {
    return [];
  }

  return [value];
}

export function getButtonLabel ({isUploading, multiple, totalFiles}) {
  if (isUploading) {
    return 'Subiendo...';
  }

  if (multiple) {
    return totalFiles ? 'Agregar archivos' : 'Seleccionar archivos';
  }

  return totalFiles ? 'Cambiar archivo' : 'Seleccionar archivo';
}

export function getStatusTitle ({isUploading, totalFiles}) {
  if (isUploading) {
    return 'Subiendo archivos';
  }

  if (totalFiles) {
    return 'Archivos cargados';
  }

  return 'Sube tus archivos';
}

export function getStatusDescription ({accept, isUploading, multiple, totalFiles, uploadingFilesCount}) {
  if (isUploading) {
    return uploadingFilesCount === 1 ? 'Subiendo 1 archivo...' : `Subiendo ${uploadingFilesCount} archivos...`;
  }

  if (!totalFiles) {
    return `Acepta ${formatAcceptHint(accept)}`;
  }

  if (!multiple) {
    return '1 archivo listo para enviar';
  }

  return totalFiles === 1 ? '1 archivo listo para enviar' : `${totalFiles} archivos listos para enviar`;
}

function formatAcceptHint (accept) {
  const formattedExtensions = String(accept || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
  .map((item) => item.replace('.', '').toUpperCase());

  if (!formattedExtensions.length) {
    return 'archivos compatibles';
  }

  return formattedExtensions.join(', ');
}

export function normalizeSingleValue (value) {
  if (Array.isArray(value)) {
    return normalizeSingleValue(value[0]);
  }

  if (typeof value !== 'string' || !value) {
    return null;
  }

  return value;
}

export function getFilesToUpload ({event, multiple}) {
  const selectedFiles = Array.from(event.target.files || []);

  event.target.value = '';

  if (multiple) {
    return selectedFiles;
  }

  return selectedFiles.slice(0, 1);
}

export async function uploadSelectedFiles (filesToUpload) {
  const successfulUploads = [];
  const failedMessages = [];

  for (const file of filesToUpload) {
    try {
      const path = await uploadFile(file);

      successfulUploads.push({path, name: file.name});
    } catch (failure) {
      failedMessages.push(failure?.error || failure?.message || `Error al subir ${file.name}`);
    }
  }

  return {successfulUploads, failedMessages};
}

export function buildDisplayNamesMap (successfulUploads) {
  return successfulUploads.reduce((result, uploadedFile) => ({
    ...result,
    [uploadedFile.path]: uploadedFile.name
  }), {});
}

export function mergeDisplayNames ({currentDisplayNames, multiple, nextDisplayNames, previousValue}) {
  if (multiple) {
    return {
      ...currentDisplayNames,
      ...nextDisplayNames
    };
  }

  const cleanedDisplayNames = previousValue
    ? removeDisplayName(currentDisplayNames, previousValue)
    : currentDisplayNames;

  return {
    ...cleanedDisplayNames,
    ...nextDisplayNames
  };
}

export function removeDisplayName (displayNames, path) {
  return Object.fromEntries(Object.entries(displayNames).filter(([key]) => key !== path));
}

export function getFileNameFromPath (path) {
  const lastSegment = decodeURIComponent(String(path || '').split('/').filter(Boolean).pop() || '');
  const cleanSegment = lastSegment.split('?')[0];
  const parts = cleanSegment.split('.');

  if (parts.length >= 3 && UUID_REGEXP.test(parts[0])) {
    return `${parts.slice(1, -1).join('.')}.${parts[parts.length - 1]}`;
  }

  return cleanSegment;
}

export function splitFileName (fileName) {
  const normalizedName = String(fileName || '').trim();
  const lastDotIndex = normalizedName.lastIndexOf('.');

  if (lastDotIndex <= 0 || lastDotIndex === normalizedName.length - 1) {
    return {
      baseName: normalizedName || 'Archivo sin nombre',
      extension: ''
    };
  }

  return {
    baseName: normalizedName.slice(0, lastDotIndex),
    extension: normalizedName.slice(lastDotIndex + 1)
  };
}
```

Path: `src/components/form/FormUploadFiles.jsx`.

```jsx
import {useState} from 'react';
import {useController} from 'react-hook-form';
import {FileText, Loader2, Upload, X} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Field, FieldDescription, FieldError, FieldLabel} from '@/components/ui/field';
import {
  buildDisplayNamesMap,
  DEFAULT_ACCEPT,
  getButtonLabel,
  getFileNameFromPath,
  getFilesToUpload,
  getStatusDescription,
  getStatusTitle,
  getStoredFiles,
  mergeDisplayNames,
  normalizeMultiValue,
  normalizeSingleValue,
  removeDisplayName,
  sizeStyles,
  splitFileName,
  uploadSelectedFiles
} from './FormUploadFiles.utils';

export function FormUploadFiles ({
  accept = DEFAULT_ACCEPT,
  className,
  control,
  description,
  disabled,
  label,
  labelClassName,
  multiple = false,
  name,
  onUploadingChange,
  size = 'md'
}) {
  const {field, fieldState} = useController({name, control});
  const [displayNames, setDisplayNames] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [uploadingFilesCount, setUploadingFilesCount] = useState(0);

  const normalizedValue = multiple ? normalizeMultiValue(field.value) : normalizeSingleValue(field.value);
  const storedFiles = getStoredFiles({multiple, value: normalizedValue});
  const currentSize = sizeStyles[size] || sizeStyles.md;
  const isUploading = uploadingFilesCount > 0;
  const isDisabled = disabled || isUploading;
  const totalFiles = storedFiles.length;
  const buttonLabel = getButtonLabel({isUploading, multiple, totalFiles});
  const statusTitle = getStatusTitle({isUploading, totalFiles});
  const statusDescription = getStatusDescription({accept, isUploading, multiple, totalFiles, uploadingFilesCount});

  const handleFileChange = async (event) => {
    const filesToUpload = getFilesToUpload({event, multiple});

    if (!filesToUpload.length) {
      return;
    }

    setUploadError('');
    setUploadingFilesCount(filesToUpload.length);
    onUploadingChange?.(true);

    const uploadResult = await uploadFiles(filesToUpload, setUploadingFilesCount);
    onUploadingChange?.(false);
    const {failedMessages, successfulUploads} = uploadResult;

    if (failedMessages.length) {
      setUploadError(failedMessages[0]);
    }

    if (!successfulUploads.length) {
      return;
    }

    const nextDisplayNames = buildDisplayNamesMap(successfulUploads);

    setDisplayNames((currentDisplayNames) => mergeDisplayNames({
      currentDisplayNames,
      multiple,
      nextDisplayNames,
      previousValue: normalizedValue
    }));

    if (multiple) {
      field.onChange([
        ...normalizedValue,
        ...successfulUploads.map((uploadedFile) => uploadedFile.path)
      ]);

      return;
    }

    field.onChange(successfulUploads[0].path);
  };

  const handleRemove = (path) => {
    setUploadError('');
    setDisplayNames((currentDisplayNames) => removeDisplayName(currentDisplayNames, path));

    if (multiple) {
      field.onChange(normalizedValue.filter((value) => value !== path));

      return;
    }

    field.onChange(null);
  };

  return (
    <Field data-disabled={isDisabled} data-invalid={fieldState.invalid}>
      <div className={cn('flex flex-col gap-3', className)}>
        {label && <FieldLabel htmlFor={name} className={labelClassName}>{label}</FieldLabel>}

        <div
          className={cn(
            'border border-dashed border-border bg-muted/20 backdrop-blur-sm transition-colors',
            currentSize.panel,
            (fieldState.invalid || uploadError) && 'border-destructive/60',
            isDisabled && 'opacity-80'
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className={cn('flex min-w-0 items-start', currentSize.statusWrapper)} aria-live="polite">
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center border border-border/60 bg-background text-primary shadow-xs',
                  currentSize.statusIconBox
                )}
              >
                {isUploading ? (
                  <Loader2 className={cn('animate-spin', currentSize.statusIcon)} />
                ) : (
                  <Upload className={cn(currentSize.statusIcon)} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{statusTitle}</p>
                <p className="text-sm text-muted-foreground">{statusDescription}</p>
              </div>
            </div>

            <input
              ref={field.ref}
              id={name}
              name={field.name}
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={isDisabled}
              onChange={handleFileChange}
              className="sr-only"
              aria-invalid={fieldState.invalid}
            />

            <label htmlFor={name} className={cn('shrink-0', isDisabled && 'pointer-events-none')}>
              <Button
                type="button"
                asChild
                variant="outline"
                size={currentSize.buttonSize}
                disabled={isDisabled}
                className={cn(
                  'cursor-pointer rounded-xl border-border bg-background/90 shadow-sm hover:bg-background',
                  currentSize.buttonClass
                )}
              >
                <span>
                  {isUploading ? (
                    <Loader2 className={cn('animate-spin', currentSize.buttonIcon)} />
                  ) : (
                    <Upload className={cn(currentSize.buttonIcon)} />
                  )}
                  {buttonLabel}
                </span>
              </Button>
            </label>
          </div>

          {totalFiles > 0 ? (
            <div className={cn('mt-4 grid', currentSize.list)}>
              {storedFiles.map((path) => {
                const fileName = displayNames[path] || getFileNameFromPath(path);
                const fileParts = splitFileName(fileName);

                return (
                  <div
                    key={path}
                    className={cn(
                      'flex min-w-0 items-center gap-3 border border-border/60 bg-background/80',
                      currentSize.item
                    )}
                  >
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-center bg-muted text-muted-foreground',
                        currentSize.fileIconBox
                      )}
                    >
                      <FileText className={cn(currentSize.fileIcon)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className={cn('min-w-0 flex-1 truncate font-medium text-foreground', currentSize.fileName)}>
                          {fileParts.baseName}
                        </p>

                        {fileParts.extension && (
                          <span className="shrink-0 rounded-full border border-border/70 bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {fileParts.extension}
                          </span>
                        )}
                      </div>

                      <p className={cn('text-muted-foreground', currentSize.meta)}>
                        Archivo listo para enviar
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isDisabled}
                      onClick={() => handleRemove(path)}
                      className={cn('shrink-0 rounded-full text-muted-foreground hover:text-foreground', currentSize.removeButton)}
                      aria-label={`Quitar ${fileName}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={cn(
                'mt-4 flex items-center justify-center border border-dashed border-border/70 bg-background/60 text-center text-muted-foreground',
                currentSize.emptyState
              )}
            >
              <p className={cn(currentSize.emptyStateText)}>
                No hay archivos cargados todavía.
              </p>
            </div>
          )}
        </div>

        {description && <FieldDescription>{description}</FieldDescription>}
        {uploadError && <FieldError>{uploadError}</FieldError>}
        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
      </div>
    </Field>
  );
}

async function uploadFiles (filesToUpload, setUploadingFilesCount) {
  try {
    return await uploadSelectedFiles(filesToUpload);
  } finally {
    setUploadingFilesCount(0);
  }
}
```

Campo de formulario para uno o varios archivos. Su valor es un `path` (`multiple = false`) o un
arreglo de `path` (`multiple`). Se importa desde `Form.jsx`
([09-componentes.md](09-componentes.md#formularios)) y se usa con el `control` de `useForm`:

```jsx
<FormUploadFiles
  control={form.control}
  name="attachment"
  label="Adjunto"
  description="Imágenes, PDF, DOC o DOCX. Máximo 10 MB."
  disabled={form.isSubmitting}
  onUploadingChange={setIsUploading}
/>
```

Props: `accept` (por defecto `DEFAULT_ACCEPT`), `className`, `control`, `description`, `disabled`,
`label`, `labelClassName`, `multiple` (por defecto `false`), `name`, `onUploadingChange` y `size`
(`xs`, `sm`, `md`, `lg`, `xl`; por defecto `md`).

Decisiones:

- **La lógica pura vive en `FormUploadFiles.utils.js`.** El componente solo maneja estado y JSX;
  normalizar el valor, armar los textos de estado y subir en serie son funciones sin React.
- **`DEFAULT_ACCEPT` es el mismo catálogo que acepta el endpoint de firma.** Si el servidor cambia
  las extensiones permitidas, esta constante cambia con él; si no, el selector ofrece archivos que la
  firma rechaza.
- **El nombre visible se recupera de la ruta.** El servidor arma la clave como
  `<uuid>.<nombre>.<ext>` dentro de la carpeta del usuario. `getFileNameFromPath` quita el uuid para
  mostrar `<nombre>.<ext>`; `displayNames` guarda el nombre original del archivo recién subido, que es
  más legible que el slug de la clave.
- **`getFilesToUpload` limpia `event.target.value`.** Sin eso, volver a elegir el mismo archivo no
  dispara `change`.
- **Se sube en serie y se reportan los fallos sin perder los aciertos.** `uploadSelectedFiles`
  recorre los archivos uno por uno; los que suben se agregan al valor y el primer error se muestra
  en el campo.
- **`onUploadingChange`.** Un formulario que crea un recurso a partir de este archivo necesita saber
  si hay una subida en vuelo, para no enviar mientras el valor todavía es el archivo anterior (o
  ninguno). La pantalla guarda ese booleano y deshabilita su botón de enviar.
- **`uploadFiles` pone el contador en cero en `finally`.** Aunque la subida lance, el campo sale del
  estado "subiendo".
- **El `<input type="file">` es `sr-only` y el botón es un `<label htmlFor>`.** Se conserva el
  control nativo (teclado, lector de pantalla, diálogo del sistema) con el aspecto del resto de la
  UI. El estado de la subida se anuncia con `aria-live="polite"`.

## FormUploadAvatar

Path: `src/components/form/FormUploadAvatar.jsx`.

```jsx
import {useEffect, useState} from 'react';
import {useController} from 'react-hook-form';
import {ImageUp, Loader2, Trash2, UserRound} from 'lucide-react';
import {cn, getPictureSrc} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Field, FieldError, FieldLabel} from '@/components/ui/field';
import uploadFile from '@/core/upload';

const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export function FormUploadAvatar ({className, control, disabled, label, name}) {
  const {field, fieldState} = useController({name, control});
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const value = typeof field.value === 'string' && field.value ? field.value : null;
  const hasFile = Boolean(value);
  const isDisabled = disabled || isUploading;
  const avatarSrc = localPreview || (hasFile ? getPictureSrc(value) : null);

  useEffect(() => {
    if (!localPreview) {
      return undefined;
    }

    return () => URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    setUploadError('');
    setIsUploading(true);

    setLocalPreview(URL.createObjectURL(file));

    try {
      field.onChange(await uploadFile(file));
    } catch (failure) {
      setLocalPreview(null);
      setUploadError(failure.error || failure.message || `Error al subir ${file.name}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setUploadError('');
    setLocalPreview(null);
    field.onChange(null);
  };

  return (
    <Field data-disabled={isDisabled} data-invalid={fieldState.invalid}>
      <div className={cn('my-1 flex flex-col gap-3', className)}>
        {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

        <div className="flex w-fit flex-col items-center gap-3">
          <div className={cn('inline-flex w-fit p-4 transition-colors', isDisabled && 'opacity-80')}>
            <input
              ref={field.ref}
              id={name}
              name={field.name}
              type="file"
              accept={AVATAR_ACCEPT}
              disabled={isDisabled}
              onChange={handleFileChange}
              className="sr-only"
              aria-invalid={fieldState.invalid}
            />

            <div className="flex flex-col items-center text-center">
              <div className="relative inline-flex" aria-live="polite">
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-400/20 to-blue-600/20 blur-xl" />
                <Avatar className="relative h-28 w-28 border-4 border-background shadow-lg ring-1 ring-border/60">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={label || 'Foto de perfil'} className="object-cover" />}
                  <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-white">
                    <UserRound className="h-11 w-11" />
                  </AvatarFallback>
                </Avatar>

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                )}

                {hasFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={isDisabled}
                    onClick={handleRemove}
                    className="absolute -top-1 -right-1 h-9 w-9 cursor-pointer rounded-full border-border bg-background/95 text-muted-foreground shadow-md hover:bg-background hover:text-destructive"
                    aria-label="Quitar foto de perfil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <label htmlFor={name} className={cn('absolute -bottom-1 -right-1', isDisabled && 'pointer-events-none')}>
                  <Button
                    type="button"
                    asChild
                    variant="default"
                    size="icon-sm"
                    disabled={isDisabled}
                    className="h-10 w-10 cursor-pointer rounded-full shadow-lg"
                  >
                    <span aria-hidden="true">
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageUp className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </div>

        {uploadError && <FieldError>{uploadError}</FieldError>}
        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
      </div>
    </Field>
  );
}
```

Campo de foto de perfil: un avatar circular con botón de subir y botón de quitar. Su valor es un
solo `path` o `null`. Lo usan las pantallas de edición de perfil
([07-rutas-y-sesion.md](07-rutas-y-sesion.md#módulos-de-cuenta-propia)):

```jsx
<FormUploadAvatar
  control={form.control}
  name="picture"
  label="Foto de perfil"
  disabled={form.isSubmitting}
  className="w-full"
/>
```

Decisiones:

- **La vista previa sale del `File` local, no del API.** Recién subido, el archivo está en una
  carpeta temporal del bucket que `/api/files/**` no sirve; además el `File` ya está en memoria, así
  que `URL.createObjectURL(file)` pinta la imagen sin ninguna petición.
- **El object URL se revoca en el cleanup del efecto.** Un object URL retiene el archivo en memoria
  hasta que se revoca; el efecto lo libera al reemplazarlo o al desmontar.
- **Solo un string no vacío cuenta como valor.** La foto de perfil es una sola ruta del storage;
  cualquier otra cosa (`null`, `undefined`, un objeto) se pinta como avatar vacío.
- **Si la subida falla, se descarta la vista previa** y el valor anterior del campo no cambia.
- **Quitar pone el valor en `null`.** Al guardar, el formulario envía `picture: null` y el perfil
  queda sin foto.
- **`AVATAR_ACCEPT` es más estrecho que `DEFAULT_ACCEPT`**: solo imágenes.
- **Mismo patrón de accesibilidad que `FormUploadFiles`**: input `sr-only`, `<label htmlFor>` como
  botón, `aria-label` en el botón de quitar y `aria-live` en el avatar.

## getPictureSrc

Path: `src/lib/utils.js`. Extracto: solo el import de entorno y la función; el archivo completo está
en [04-core.md](04-core.md#libutilsjs).

```js
import {apiDomain} from '@/lib/environment';

export function getPictureSrc (picture) {
  if (!picture) {
    return undefined;
  }

  if (['http://', 'https://', 'data:', 'blob:', '/'].some((prefix) => picture.startsWith(prefix))) {
    return picture;
  }

  return `${apiDomain}/api/files/${picture}`;
}
```

- **Una ruta guardada se convierte en `${apiDomain}/api/files/<path>`.** `apiDomain` sale de
  `src/lib/environment.js` ([03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#libenvironmentjs)),
  así que la URL del API no se repite en este archivo.
- **Lo que ya es una URL se devuelve tal cual:** absolutas (`http://`, `https://`), `data:`, `blob:`
  (vistas previas locales) y rutas relativas a la app (`/assets/...`, como las imágenes de
  `public/`).
- **Sin valor devuelve `undefined`, no `''`.** Un `src=""` hace que el navegador pida la página
  actual; con `undefined` el atributo no se pinta y `AvatarFallback` toma su lugar.
- **El API responde con una redirección a una URL temporal del bucket.** El `<img>` sigue la
  redirección; la cookie de sesión viaja en la petición al API porque es same-site
  ([11-subida-de-archivos.md](11-subida-de-archivos.md#flujo)).

## Contrato de la firma

`POST /api/uploads` (con sesión).

Cuerpo que manda el cliente:

| Campo | Tipo | Regla del servidor |
|---|---|---|
| `name` | string | 1 a 255 caracteres, extensión del catálogo permitido. |
| `size` | number | entero positivo, máximo 10 MB (10 × 1024 × 1024 bytes). |
| `type` | string | opcional e informativo: no decide la extensión ni el destino. |

Respuesta (dentro del envelope del API, que `service()` desempaqueta):

| Campo | Tipo | Qué es |
|---|---|---|
| `url` | string | URL del bucket a la que se hace el `POST` multipart. |
| `fields` | object | Campos de la política firmada; se copian al `FormData` antes de `file`. |
| `path` | string | Clave del objeto en el bucket. Es lo único que se guarda en el recurso. |

El servidor devuelve además `expiresAt` (ISO) con el vencimiento de la firma; el cliente no lo usa.

Lo que el cliente puede asumir del servidor:

- La firma dura poco (minutos). Por eso se pide justo antes de subir y nunca se guarda.
- La clave la arma el servidor entera: del nombre del archivo solo sobrevive un slug. Su forma es
  `<carpeta temporal>/<id del usuario>/<uuid>.<slug>.<ext>`. El uuid la hace no adivinable y el id del
  usuario permite al servidor comprobar después que la ruta es de quien la envía.
- El tamaño declarado en `size` sirve para rechazar temprano; el límite real lo impone la política
  firmada (`content-length-range`), y por eso el bucket responde `400` si se supera.
- Errores del paso de firma: llegan en el envelope del API (`{status, error, fields}`) como cualquier
  otra llamada de `service()` ([04-core.md](04-core.md#coreservicejs)), por ejemplo "Tipo de archivo
  no permitido".

## Reglas de uso

- **Todo archivo sube con `uploadFile`.** No mandes un `File` dentro del cuerpo de un `service().post`
  ni en un `FormData` hacia el API: los bytes van al bucket.
- **Los formularios usan `FormUploadFiles` o `FormUploadAvatar`**, no un `<input type="file">`
  propio. Así el valor del campo siempre es una ruta y el estado de subida se ve igual en toda la app.
- **El recurso guarda `path`, nunca `url`.** La URL de la firma sirve para escribir una sola vez y
  vence; la ruta es lo que el API sabe resolver.
- **Para mostrar un archivo, `getPictureSrc(path)`.** No armes `${apiDomain}/api/files/...` a mano
  en una pantalla.
- **No pases el segundo paso por `service()`.** Rompe la respuesta (no hay envelope) y un `403` de
  firma vencida no debe tocar la sesión.
- **No reordenes el `FormData`.** `file` va último.
- **Si el formulario crea un recurso a partir del archivo, usa `onUploadingChange`** y deshabilita el
  envío mientras hay una subida en vuelo.
- **Cambiar el catálogo de extensiones o el tamaño máximo es un cambio de servidor y cliente a la
  vez** (`DEFAULT_ACCEPT`, `AVATAR_ACCEPT` y el texto de ayuda del campo).

## Checklist del ejecutor

- [ ] Existe `POST /api/uploads` en el API del destino, con sesión, y responde `{url, fields, path}`.
- [ ] Existe `GET /api/files/<path>` en el API del destino, con sesión, que redirige a una URL
      temporal del bucket.
- [ ] La política CORS del bucket acepta `POST` desde el dominio de la app (el `fetch` al bucket es
      cross-origin).
- [ ] `src/core/upload.js` está copiado completo y usa `service('uploads')` solo para la firma.
- [ ] `FormUploadFiles.jsx`, `FormUploadFiles.utils.js` y `FormUploadAvatar.jsx` están en
      `src/components/form/` y `Form.jsx` los re-exporta.
- [ ] `DEFAULT_ACCEPT` coincide con el catálogo de extensiones del servidor.
- [ ] `getPictureSrc` usa `apiDomain` de `src/lib/environment.js`.
- [ ] La cookie de sesión del API es host-only con `SameSite=Lax` y app y API comparten dominio
      registrable, para que `<img src>` hacia `/api/files/` la lleve.
- [ ] Subir un archivo, guardar el recurso y recargar muestra el archivo desde `/api/files/`.
