import { useEffect, useState } from 'react'
import { useApiAvisoUsuario } from '../../../api/useApiAvisoUsuario'
import {
  ButtonApp,
  ButtonAppColor,
  ButtonAppVariant,
} from '../../../components/ButtonApp/ButtonApp'
import { DividerApp } from '../../../components/DividerApp/DividerApp'
import { InputApp } from '../../../components/InputApp/InputApp'
import { ModalChildren } from '../../../components/Modal/ModalChildren'
import { StackApp } from '../../../components/StackApp/StackApp'
import { TextApp, TextAppColor } from '../../../components/TextApp/TextApp'
import { useFormikAdapter } from '../../../hook/useFormikAdapter'
import { YupAdapter } from '../../../lib/YupAdapter'
import {
  AvisoUsuarioFormField,
  avisoUsuarioMensagemMaxLength,
  type AvisoUsuario,
} from '../../../types/AvisoUsuarioTypes'
import type { ClienteVenda } from '../../../types/ClienteVendaTypes'
import { formatarDataHoraUtcLocal } from '../../../utils/dateUtils'

type ClienteVendaAvisosModalProps = {
  cliente: Pick<ClienteVenda, 'id' | 'nome'>
  onClose: () => void
}

const validationSchema = new YupAdapter()
  .stringWithTests(
    AvisoUsuarioFormField.Mensagem,
    [
      {
        name: 'conteudo',
        message: 'Informe a mensagem do aviso',
        test: (value) => Boolean(value?.trim()),
      },
      {
        name: 'comprimento',
        message: `A mensagem deve ter no máximo ${avisoUsuarioMensagemMaxLength} caracteres`,
        test: (value) => (value?.length ?? 0) <= avisoUsuarioMensagemMaxLength,
      },
    ],
    'Informe a mensagem do aviso',
  )
  .build()

export function ClienteVendaAvisosModal({ cliente, onClose }: ClienteVendaAvisosModalProps) {
  const { listar, criar, alterarAtivo } = useApiAvisoUsuario()
  const [avisos, setAvisos] = useState<AvisoUsuario[]>()
  const [tentativa, setTentativa] = useState(0)
  const [criando, setCriando] = useState(false)
  const [avisoSelecionado, setAvisoSelecionado] = useState<AvisoUsuario>()

  useEffect(() => {
    let atual = true
    void listar.fetch(cliente.id).then((response) => {
      if (atual) setAvisos(response)
    })
    return () => {
      atual = false
    }
    // Os métodos de useApi são recriados a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente.id, tentativa])

  const form = useFormikAdapter<{ mensagem: string }>({
    initialValues: { mensagem: '' },
    validationSchema,
    onSubmit: async ({ mensagem }: { mensagem: string }) => {
      if (criar.loading) return
      const aviso = await criar.fetch({ usuarioId: cliente.id, mensagem: mensagem.trim() })
      if (aviso) {
        fecharCadastro()
        setTentativa((valor) => valor + 1)
      }
    },
  })

  function fecharCadastro() {
    form.limpar()
    setCriando(false)
  }

  async function confirmarAlteracaoAtivo() {
    if (!avisoSelecionado || alterarAtivo.loading) return

    const response = await alterarAtivo.fetch(avisoSelecionado.id, !avisoSelecionado.ativo)
    if (response?.resultado) {
      setAvisoSelecionado(undefined)
      setTentativa((valor) => valor + 1)
    }
  }

  if (criando) {
    return (
      <ModalChildren
        close={criar.loading ? undefined : fecharCadastro}
        footerChildren={
          <>
            <ButtonApp
              disabled={criar.loading}
              onClick={fecharCadastro}
              variant={ButtonAppVariant.Outlined}
            >
              Cancelar
            </ButtonApp>
            <ButtonApp loading={criar.loading} onClick={form.onSubmit}>
              Salvar
            </ButtonApp>
          </>
        }
        fullWidth
        maxWidth="sm"
        open
        titulo={`Novo aviso para ${cliente.nome}`}
      >
        <InputApp
          disabled={criar.loading}
          error={form.error(AvisoUsuarioFormField.Mensagem)}
          focus
          helperText={form.helperText(AvisoUsuarioFormField.Mensagem)}
          id={AvisoUsuarioFormField.Mensagem}
          label="Mensagem"
          maxLength={avisoUsuarioMensagemMaxLength}
          multiline
          onBlur={form.onBlur}
          onChange={form.onChange}
          required
          rows={5}
          value={form.values.mensagem}
        />
      </ModalChildren>
    )
  }

  if (avisoSelecionado) {
    const acao = avisoSelecionado.ativo ? 'Inativar' : 'Ativar'

    function voltar() {
      setAvisoSelecionado(undefined)
    }

    return (
      <ModalChildren
        close={alterarAtivo.loading ? undefined : voltar}
        footerChildren={
          <>
            <ButtonApp
              disabled={alterarAtivo.loading}
              onClick={voltar}
              variant={ButtonAppVariant.Outlined}
            >
              Cancelar
            </ButtonApp>
            <ButtonApp
              color={avisoSelecionado.ativo ? ButtonAppColor.Error : ButtonAppColor.Primary}
              loading={alterarAtivo.loading}
              onClick={confirmarAlteracaoAtivo}
            >
              {acao}
            </ButtonApp>
          </>
        }
        fullWidth
        maxWidth="sm"
        open
        titulo={`${acao} aviso`}
      >
        <TextApp>
          Deseja {acao.toLowerCase()} este aviso de {cliente.nome}?
        </TextApp>
        <TextApp
          color={TextAppColor.Secondary}
          sx={{ mt: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          {avisoSelecionado.mensagem}
        </TextApp>
      </ModalChildren>
    )
  }

  return (
    <ModalChildren
      close={onClose}
      footerChildren={
        <>
          <ButtonApp onClick={onClose} variant={ButtonAppVariant.Outlined}>
            Fechar
          </ButtonApp>
          <ButtonApp onClick={() => setCriando(true)}>Novo aviso</ButtonApp>
        </>
      }
      fullWidth
      maxWidth="sm"
      open
      titulo={`Avisos de ${cliente.nome}`}
    >
      {listar.loading ? (
        <TextApp>Carregando avisos…</TextApp>
      ) : avisos === undefined ? (
        <StackApp spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextApp>Não foi possível carregar os avisos.</TextApp>
          <ButtonApp
            variant={ButtonAppVariant.Outlined}
            onClick={() => setTentativa((valor) => valor + 1)}
          >
            Tentar novamente
          </ButtonApp>
        </StackApp>
      ) : avisos.length === 0 ? (
        <TextApp>Nenhum aviso cadastrado para este cliente.</TextApp>
      ) : (
        <StackApp divider={<DividerApp />} spacing={2}>
          {avisos.map((aviso) => (
            <StackApp key={aviso.id} spacing={0.5}>
              <TextApp sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {aviso.mensagem}
              </TextApp>
              <TextApp color={TextAppColor.Secondary} fontSize="0.75rem">
                {aviso.ativo ? 'Ativo' : 'Inativo'} ·{' '}
                {aviso.visto ? 'Visualizado' : 'Não visualizado'}
              </TextApp>
              <TextApp color={TextAppColor.Secondary} fontSize="0.75rem">
                Criado em {formatarDataHoraUtcLocal(aviso.dataDeCriacao)}
              </TextApp>
              {aviso.dataDeVisualizacao && (
                <TextApp color={TextAppColor.Secondary} fontSize="0.75rem">
                  Visualizado em {formatarDataHoraUtcLocal(aviso.dataDeVisualizacao)}
                </TextApp>
              )}
              {!aviso.visto && (
                <ButtonApp
                  color={aviso.ativo ? ButtonAppColor.Error : ButtonAppColor.Primary}
                  onClick={() => setAvisoSelecionado(aviso)}
                  sx={{ alignSelf: 'flex-end' }}
                  variant={ButtonAppVariant.Outlined}
                >
                  {aviso.ativo ? 'Inativar' : 'Ativar'}
                </ButtonApp>
              )}
            </StackApp>
          ))}
        </StackApp>
      )}
    </ModalChildren>
  )
}
