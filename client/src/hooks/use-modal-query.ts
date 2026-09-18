import { useSearchParams } from 'react-router'

const MODAL_QUERY_KEY = 'modal'

type ModalQuery<TParamKey extends string> = {
  isOpen: boolean
  params: Record<TParamKey, string | null>
  openModal: (params: Record<TParamKey, string>) => void
  closeModal: () => void
}

export default function useModalQuery<TParamKey extends string>(
  modalName: string,
  paramKeys: readonly TParamKey[],
): ModalQuery<TParamKey> {
  const [searchParams, setSearchParams] = useSearchParams()

  function openModal(params: Record<TParamKey, string>) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set(MODAL_QUERY_KEY, modalName)
      paramKeys.forEach((key) => next.set(key, params[key]))

      return next
    })
  }

  function closeModal() {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete(MODAL_QUERY_KEY)
        paramKeys.forEach((key) => next.delete(key))

        return next
      },
      { replace: true },
    )
  }

  const entries = paramKeys.map((key) => [key, searchParams.get(key)] as const)

  return {
    isOpen: searchParams.get(MODAL_QUERY_KEY) === modalName,
    params: Object.fromEntries(entries) as Record<TParamKey, string | null>,
    openModal,
    closeModal,
  }
}
