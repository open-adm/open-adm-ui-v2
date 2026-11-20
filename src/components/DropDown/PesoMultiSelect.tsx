import { ApiResourceRoutePath, ApiRoutePath } from '../../api/apiRoutes'
import type { Peso } from '../../types/PesoTypes'
import { DropDownMultiSelectApp } from './DropDownMultiSelectApp'

type PesoMultiSelectProps = {
  onChange: (values: Peso[]) => void
  values: Peso[]
}

export function PesoMultiSelect(props: PesoMultiSelectProps) {
  return (
    <DropDownMultiSelectApp
      {...props}
      getOptionLabel={({ descricao }) => `${descricao}`}
      id="pesoId"
      label="Pesos"
      url={`${ApiRoutePath.Peso}${ApiResourceRoutePath.Dropdown}`}
    />
  )
}
