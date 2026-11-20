import { ApiResourceRoutePath, ApiRoutePath } from '../../api/apiRoutes'
import type { Tamanho } from '../../types/TamanhoTypes'
import { DropDownMultiSelectApp } from './DropDownMultiSelectApp'

type TamanhoMultiSelectProps = {
  onChange: (values: Tamanho[]) => void
  values: Tamanho[]
}

export function TamanhoMultiSelect(props: TamanhoMultiSelectProps) {
  return (
    <DropDownMultiSelectApp
      {...props}
      getOptionLabel={({ descricao }) => `${descricao}`}
      id="tamanhoId"
      label="Tamanhos"
      url={`${ApiRoutePath.Tamanho}${ApiResourceRoutePath.Dropdown}`}
    />
  )
}
