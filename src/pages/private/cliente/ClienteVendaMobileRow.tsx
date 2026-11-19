import { MenuApp } from '../../../components/MenuApp/MenuApp'
import { StackApp } from '../../../components/StackApp/StackApp'
import { TextApp, TextAppColor, TextAppWeight } from '../../../components/TextApp/TextApp'
import { useNavigationApp } from '../../../hook/useNavigationApp'
import { useThemeApp } from '../../../hook/useThemeApp'
import { PrivateRoutePath } from '../../../routes/appRoutes'
import type { ClienteVenda } from '../../../types/ClienteVendaTypes'
import { formatarCnpj, formatarCpf, formatarTelefone } from '../../../utils/documentUtils'

type ClienteVendaMobileRowProps = {
  cliente: ClienteVenda
  onAbrirAvisos: () => void
  onAlterarAcesso: () => void
}

export function ClienteVendaMobileRow({
  cliente,
  onAbrirAvisos,
  onAlterarAcesso,
}: ClienteVendaMobileRowProps) {
  const { navigate } = useNavigationApp()
  const { cores } = useThemeApp()
  const documento = cliente.cpf ? formatarCpf(cliente.cpf) : formatarCnpj(cliente.cnpj)

  return (
    <StackApp direction="row" spacing={0.5} sx={{ width: '100%', alignItems: 'flex-start' }}>
      <StackApp spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <TextApp fontSize="0.875rem" noWrap weight={TextAppWeight.Bold}>
          {cliente.nome}
        </TextApp>
        {cliente.numero != null && (
          <TextApp color={TextAppColor.Secondary} fontSize="0.75rem">
            Cliente #{cliente.numero}
          </TextApp>
        )}
        {cliente.telefone && (
          <TextApp fontSize="0.75rem">{formatarTelefone(cliente.telefone)}</TextApp>
        )}
        {documento && (
          <TextApp fontSize="0.75rem">
            {cliente.cpf ? 'CPF' : 'CNPJ'} {documento}
          </TextApp>
        )}
      </StackApp>
      <StackApp
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <MenuApp
          ariaLabel={`Ações do cliente ${cliente.nome}`}
          buttonIcon="mdi:dots-vertical"
          buttonSize="small"
          buttonSx={{ padding: 0.5 }}
          id={`cliente-venda-acoes-${cliente.id}`}
          items={[
            {
              icon: 'solar:eye-linear',
              iconColor: cores.primary,
              label: 'Visualizar cliente',
              onClick: () => navigate(`${PrivateRoutePath.ClienteVendaVisualizar}/${cliente.id}`),
            },
            {
              icon: 'material-symbols-light:refresh-rounded',
              iconColor: cores.primary,
              label: 'Atualizar senha',
              onClick: () =>
                navigate(`${PrivateRoutePath.ClienteVendaAtualizarSenha}/${cliente.id}`),
            },
            {
              icon: 'solar:bell-linear',
              iconColor: cores.primary,
              label: 'Avisos',
              onClick: onAbrirAvisos,
            },
            {
              icon: cliente.ativo ? 'material-symbols:block-outline' : 'fontisto:checkbox-active',
              iconColor: cliente.ativo ? cores.error : cores.success,
              label: cliente.ativo ? 'Bloquear acesso' : 'Ativar acesso',
              onClick: onAlterarAcesso,
            },
          ]}
          tooltip="Ações do cliente"
        />
      </StackApp>
    </StackApp>
  )
}
