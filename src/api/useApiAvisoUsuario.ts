import { ApiMethod, useApi } from '../hook/useApi'
import type { AvisoUsuario, CriarAvisoUsuario } from '../types/AvisoUsuarioTypes'
import { ApiRoutePath } from './apiRoutes'

const avisoUsuarioStatusRoute = '/ativo'

export function useApiAvisoUsuario() {
  const listar = useApi({
    method: ApiMethod.Get,
    url: ApiRoutePath.AvisoUsuario,
    statusInicial: 'loading',
  })
  const criar = useApi({ method: ApiMethod.Post, url: ApiRoutePath.AvisoUsuario })
  const alterarAtivo = useApi({ method: ApiMethod.Put, url: ApiRoutePath.AvisoUsuario })

  return {
    listar: {
      fetch: (usuarioId: string) =>
        listar.action<AvisoUsuario[]>({ urlParams: `/${encodeURIComponent(usuarioId)}` }),
      loading: listar.loading,
    },
    criar: {
      fetch: (body: CriarAvisoUsuario) =>
        criar.action<AvisoUsuario>({ body, message: 'Aviso criado com sucesso' }),
      loading: criar.loading,
    },
    alterarAtivo: {
      fetch: (id: string, ativo: boolean) =>
        alterarAtivo.action<{ resultado: boolean }>({
          urlParams: `/${encodeURIComponent(id)}${avisoUsuarioStatusRoute}/${ativo}`,
          message: ativo ? 'Aviso ativado com sucesso' : 'Aviso inativado com sucesso',
        }),
      loading: alterarAtivo.loading,
    },
  }
}
