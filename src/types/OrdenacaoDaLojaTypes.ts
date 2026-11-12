export const TipoOrdenacaoLoja = {
  Categoria: 'categoria',
  Produto: 'produto',
  Peso: 'peso',
  Tamanho: 'tamanho',
} as const

export type TipoOrdenacaoLoja = (typeof TipoOrdenacaoLoja)[keyof typeof TipoOrdenacaoLoja]

export type ItemOrdenacaoDaLoja = {
  id: string
  descricao: string
  foto?: string
  ordemExibicao: number
}

export type AtualizarOrdemDaLojaPayload = {
  idOrigem: string
  posicaoOrigem: number
  idDestino: string
  posicaoDestino: number
}
