import { ApiResourceRoutePath, ApiRoutePath } from '../../api/apiRoutes'
import type { Produto } from '../../types/ProdutoTypes'
import { DropDownMultiSelectApp } from './DropDownMultiSelectApp'

type ProdutoMultiSelectProps = {
  onChange: (values: Produto[]) => void
  values: Produto[]
}

export function ProdutoMultiSelect(props: ProdutoMultiSelectProps) {
  return (
    <DropDownMultiSelectApp
      {...props}
      getOptionLabel={({ descricao }) => `${descricao}`}
      id="produtoId"
      label="Produtos"
      utilizarURLSearch
      url={`${ApiRoutePath.Produto}${ApiResourceRoutePath.Dropdown}`}
    />
  )
}
