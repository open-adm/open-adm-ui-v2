export const AvisoUsuarioFormField = {
  Mensagem: 'mensagem',
} as const

export const avisoUsuarioMensagemMaxLength = 2000

export type CriarAvisoUsuario = {
  usuarioId: string
  mensagem: string
}

export type AvisoUsuario = {
  id: string
  usuarioId: string
  mensagem: string | null
  dataDeCriacao: string
  dataDeVisualizacao: string | null
  ativo: boolean
  visto: boolean
}
