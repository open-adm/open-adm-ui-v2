import { MenuApp } from '../../../components/MenuApp/MenuApp'
import { StackApp } from '../../../components/StackApp/StackApp'
import { TextApp, TextAppColor, TextAppWeight } from '../../../components/TextApp/TextApp'
import { useThemeApp } from '../../../hook/useThemeApp'
import type { Estoque } from '../../../types/EstoqueTypes'
import { formatarDataHoraUtcLocal } from '../../../utils/dateUtils'
import { EstoqueQuantidadeBadge } from './EstoqueQuantidadeBadge'

type EstoqueMobileCardProps = {
  item: Estoque
  onEditar?: () => void
}

export function EstoqueMobileCard({ item, onEditar }: EstoqueMobileCardProps) {
  const { cores } = useThemeApp()
  const quantidades = [
    { label: 'Saldo', value: item.quantidade },
    { label: 'Disponível', value: item.quantidadeDisponivel },
    { label: 'Reservada', value: item.quantidadeReservada },
  ]

  return (
    <StackApp spacing={0.75} sx={{ width: '100%', minWidth: 0 }}>
      <StackApp direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
        <StackApp sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <TextApp fontSize="0.85rem" noWrap weight={TextAppWeight.Bold}>
            {item.produto || '—'}
          </TextApp>
          {item.peso && (
            <TextApp color={TextAppColor.Secondary} fontSize="0.75rem" noWrap>
              Peso {item.peso}
            </TextApp>
          )}
          {item.tamanho && (
            <TextApp color={TextAppColor.Secondary} fontSize="0.75rem" noWrap>
              Tamanho {item.tamanho}
            </TextApp>
          )}
        </StackApp>
        {onEditar && (
          <StackApp onClick={(event) => event.stopPropagation()}>
            <MenuApp
              ariaLabel={`Ações de estoque de ${item.produto || item.numero}`}
              buttonIcon="mdi:dots-vertical"
              buttonSize="small"
              buttonSx={{ padding: 0.5 }}
              id={`estoque-acoes-${item.id}`}
              items={[
                {
                  icon: 'solar:pen-linear',
                  iconColor: cores.primary,
                  label: 'Editar estoque',
                  onClick: onEditar,
                },
              ]}
              tooltip="Ações do estoque"
            />
          </StackApp>
        )}
      </StackApp>
      <StackApp direction="row" spacing={0.75} sx={{ justifyContent: 'space-between', pr: 1 }}>
        {quantidades.map(({ label, value }) => (
          <StackApp key={label} spacing={0.25}>
            <TextApp color={TextAppColor.Secondary} fontSize="0.75rem">
              {label}
            </TextApp>
            <EstoqueQuantidadeBadge compacto value={value} />
          </StackApp>
        ))}
      </StackApp>
      <TextApp color={TextAppColor.Secondary} fontSize="0.75rem">
        Última movimentação {formatarDataHoraUtcLocal(item.dataDeAtualizacao) || '—'}
      </TextApp>
    </StackApp>
  )
}
