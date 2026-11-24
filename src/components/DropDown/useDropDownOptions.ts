import { useEffect, useRef, useState } from 'react'
import { ApiMethod, useApi, type TypeMethod } from '../../hook/useApi'
import { useDebounce } from '../../hook/useDebounce'

type DropDownOptionsConfig = {
  url: string
  method: TypeMethod
  open: boolean
  readonly?: boolean
  utilizarURLSearch?: boolean
  body?: Record<string, unknown>
  header?: Record<string, unknown>
}

type Search = { term: string }

export function useDropDownOptions<T>({
  url,
  method,
  open,
  readonly,
  utilizarURLSearch,
  body,
  header,
}: DropDownOptionsConfig) {
  const { action, loading } = useApi({
    url,
    method,
    header,
    naoRenderizarResposta: true,
  })
  const [search, setSearch] = useState<Search | null>(null)
  const debouncedSearch = useDebounce(search)
  const key = JSON.stringify([url, method, header, body, utilizarURLSearch])
  const [initial, setInitial] = useState<{ key: string; options: T[] }>()
  const [result, setResult] = useState<{ key: string; options: T[] }>()
  const initialOptions = initial?.key === key ? initial.options : undefined
  const lastRequest = useRef<{ key: string; search: Search | null } | null>(null)

  useEffect(() => {
    if (readonly || (search?.term !== '' && search !== debouncedSearch)) return
    if (!search && (!open || initialOptions)) return
    if (lastRequest.current?.key === key && lastRequest.current.search === search) return

    const request = { key, search }
    lastRequest.current = request
    const term = search?.term

    async function carregar() {
      const response = await action<T[] | { values: T[] }>({
        body: method === ApiMethod.Get ? undefined : { ...body, search: term || undefined },
        urlParams:
          method === ApiMethod.Get && (utilizarURLSearch || search)
            ? `?${new URLSearchParams({ search: term ?? '' })}`
            : undefined,
      })
      if (lastRequest.current !== request) return

      const options = Array.isArray(response) ? response : response?.values
      if (Array.isArray(options)) {
        if (!term) setInitial({ key, options })
        setResult({ key, options })
      }
      if (!search) lastRequest.current = null
    }

    void carregar()
    // A chave representa a configuração da consulta e a busca representa uma ação no campo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, initialOptions, key, open, readonly, search])

  const latestOptions = result?.key === key ? result.options : undefined

  return {
    options: (search ? (latestOptions ?? initialOptions) : (initialOptions ?? latestOptions)) ?? [],
    loading,
    search: search?.term ?? '',
    pesquisar: (term: string) => setSearch({ term }),
    resetarBusca: () => setSearch(null),
  }
}
