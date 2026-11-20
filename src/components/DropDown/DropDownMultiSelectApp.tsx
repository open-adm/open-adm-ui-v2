import { Autocomplete, TextField } from '@mui/material'
import { useState } from 'react'
import { ApiMethod, type TypeMethod } from '../../hook/useApi'
import { useDropDownOptions } from './useDropDownOptions'

type MultiSelectItem = {
  id: string
  descricao: string
}

type DropDownMultiSelectAppProps<T extends MultiSelectItem> = {
  body?: Record<string, unknown>
  method?: TypeMethod
  utilizarURLSearch?: boolean
  getOptionLabel?: (option: T) => string
  id: string
  label: string
  onChange: (values: T[]) => void
  readonly?: boolean
  url: string
  values: T[]
}

export function DropDownMultiSelectApp<T extends MultiSelectItem>({
  body,
  method = ApiMethod.Get,
  utilizarURLSearch,
  getOptionLabel = (option) => option.descricao,
  id,
  label,
  onChange,
  readonly,
  url,
  values,
}: DropDownMultiSelectAppProps<T>) {
  const [open, setOpen] = useState(false)
  const { options, loading, pesquisar, resetarBusca } = useDropDownOptions<T>({
    url,
    method,
    body,
    open,
    readonly,
    utilizarURLSearch,
  })

  return (
    <Autocomplete
      disabled={readonly}
      filterOptions={
        method !== ApiMethod.Get || utilizarURLSearch ? (options) => options : undefined
      }
      getOptionKey={(option) => option.id}
      getOptionLabel={getOptionLabel}
      id={id}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={loading}
      multiple
      onChange={(_, newValues) => onChange(newValues)}
      onClose={() => {
        setOpen(false)
        resetarBusca()
      }}
      onInputChange={(_, value, reason) => {
        if (reason === 'input' || reason === 'clear') pesquisar(value)
      }}
      onOpen={() => setOpen(true)}
      open={open}
      options={options}
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
      slotProps={{
        chip: {
          size: 'small',
          variant: 'outlined',
          color: 'primary',
        },
      }}
      value={values}
    />
  )
}
