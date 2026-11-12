export enum CategoriaFormField {
  Descricao = 'descricao',
  Foto = 'foto',
  InativoEcommerce = 'inativoEcommerce',
  NovaFoto = 'novaFoto',
  OrdemExibixao = 'ordemExibixao',
}

export enum CategoriaFiltroField {
  Descricao = 'descricao',
  Ativo = 'ativo',
  Pagina = 'pagina',
  QuantidadePorPagina = 'quantidadePorPagina',
}

export interface Categoria {
  id: string
  dataDeCriacao: string
  dataDeAtualizacao?: string
  numero: number
  descricao: string
  ativo: boolean
  foto?: string
  novaFoto?: string
  inativoEcommerce: boolean
  ordemExibixao?: number
}

export type CategoriaPayload = Partial<Categoria>
