import { ApiMethod, useApi } from '../hook/useApi'
import type {
  AtualizarOrdemDaLojaPayload,
  ItemOrdenacaoDaLoja,
  TipoOrdenacaoLoja,
} from '../types/OrdenacaoDaLojaTypes'
import {
  ApiRoutePath,
  CategoriaApiRoutePath,
  PesoApiRoutePath,
  ProdutoApiRoutePath,
  TamanhoApiRoutePath,
} from './apiRoutes'

const rotasOrdenacao = {
  categoria: `${ApiRoutePath.Categoria}${CategoriaApiRoutePath.OrdemExibicao}`,
  produto: `${ApiRoutePath.Produto}${ProdutoApiRoutePath.OrdemExibicao}`,
  peso: `${ApiRoutePath.Peso}${PesoApiRoutePath.OrdemExibicao}`,
  tamanho: `${ApiRoutePath.Tamanho}${TamanhoApiRoutePath.OrdemExibicao}`,
} as const

export function useApiOrdenacaoDaLoja() {
  const listarApi = useApi({ method: ApiMethod.Get, url: '', naoRenderizarResposta: true })
  const atualizarApi = useApi({ method: ApiMethod.Put, url: '' })

  return {
    listar: {
      fetch: (tipo: TipoOrdenacaoLoja) =>
        listarApi.action<ItemOrdenacaoDaLoja[]>({ urlParams: rotasOrdenacao[tipo] }),
      loading: listarApi.loading,
    },
    atualizar: {
      fetch: async (tipo: TipoOrdenacaoLoja, payload: AtualizarOrdemDaLojaPayload) => {
        let sucesso = false
        await atualizarApi.action({
          body: payload,
          message: 'Ordem de exibição atualizada com sucesso',
          onSuccess: () => {
            sucesso = true
          },
          urlParams: rotasOrdenacao[tipo],
        })
        return sucesso
      },
      loading: atualizarApi.loading,
    },
  }
}
