import type { TableCellRendererParams, TypeColumns } from '../../../components/Tabela/tabelaComDragTypes'
import type { Estoque } from '../../../types/EstoqueTypes'
import { EstoqueMobileCard } from './EstoqueMobileCard'

export const estoqueMobileRowHeight = 132

const estoqueMobileField = 'produto'

export function criarColunasEstoqueMobile(
  editar?: (item: Estoque) => void,
): TypeColumns[] {
  return [
    {
      field: estoqueMobileField,
      headerName: 'Produtos',
      flex: 1,
      minWidth: 280,
      sortable: false,
      cellStyle: { paddingRight: '0px' },
      cellRenderer: ({ data }: TableCellRendererParams<Estoque>) =>
        data && (
          <EstoqueMobileCard
            item={data}
            onEditar={editar && (() => editar(data))}
          />
        ),
    },
  ]
}
