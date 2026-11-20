import { ApiResourceRoutePath, ApiRoutePath } from '../../api/apiRoutes'
import type { Categoria } from '../../types/CategoriaTypes'
import { DropDownMultiSelectApp } from './DropDownMultiSelectApp'

type CategoriaMultiSelectProps = {
  onChange: (values: Categoria[]) => void
  values: Categoria[]
}

export function CategoriaMultiSelect(props: CategoriaMultiSelectProps) {
  return (
    <DropDownMultiSelectApp
      {...props}
      id="categoriaId"
      label="Categorias"
      url={`${ApiRoutePath.Categoria}${ApiResourceRoutePath.Dropdown}`}
    />
  )
}
