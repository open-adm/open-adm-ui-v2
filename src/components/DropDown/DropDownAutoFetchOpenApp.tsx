import { CircularProgress, Paper, TextField } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import { Fragment, useMemo, useState } from 'react'
import { ApiMethod, type TypeMethod } from '../../hook/useApi'
import { ButtonApp } from '../ButtonApp/ButtonApp'
import { useDropDownOptions } from './useDropDownOptions'

interface propsDropDown {
  value: any
  onChange?: (id: string, newValue?: any) => void
  onBlur?: (e: any) => void
  label: string
  keyLabel: string | string[]
  url: string
  size?: 'small' | 'medium'
  id: string
  required?: boolean
  helperText?: any
  error?: boolean
  method?: TypeMethod
  readonly?: boolean
  orderBy?: string
  autoFocus?: boolean
  renderOption?: (props: any, value: any) => React.ReactNode
  asc?: boolean
  textoBotaoNovoRegistro?: string
  onClickBotaoNovoRegistro?: (search?: string) => void
  textoNaoEncontrado?: string
  startAdornment?: React.ReactNode
  body?: any
  utilizarURLSearch?: boolean
  tooltipBotaoNovoRegistro?: string
  headerApi?: any
}

interface propsCustomListbox extends React.HTMLAttributes<HTMLUListElement> {
  textoBotaoNovoRegistro?: string
  onClickBotaoNovoRegistro?: (search?: string) => void
  valorDigitado?: string
}

function CustomListbox(props: propsCustomListbox) {
  const { children, textoBotaoNovoRegistro, onClickBotaoNovoRegistro, valorDigitado, ...other } =
    props

  const handleClickNovoRegistro = () => {
    if (!onClickBotaoNovoRegistro) return
    onClickBotaoNovoRegistro(valorDigitado)
  }

  const buttonContent = (
    <div
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleClickNovoRegistro()
      }}
      style={{ width: '100%' }}
    >
      <ButtonApp fullWidth startIcon={'ic:round-plus'}>
        {textoBotaoNovoRegistro}
      </ButtonApp>
    </div>
  )

  return (
    <Paper
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
      }}
      component="ul"
      {...other}
    >
      {children}
      {onClickBotaoNovoRegistro && (
        <li
          style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            padding: '8px',
          }}
        >
          {buttonContent}
        </li>
      )}
    </Paper>
  )
}

function getLabel(record: any, keyLabel: string | string[]) {
  const labels = Array.isArray(keyLabel) ? keyLabel : [keyLabel]

  return labels
    .map((key) => key?.split('.').reduce((value, part) => value?.[part], record))
    .filter(Boolean)
    .join(' - ')
}

export function DropDownAutoFetchOpenApp(props: propsDropDown) {
  const [open, setOpen] = useState(false)
  const {
    options: valuesOriginais,
    loading,
    search,
    pesquisar,
    resetarBusca,
  } = useDropDownOptions<any>({
    method: props.method ?? ApiMethod.Post,
    url: props.url,
    header: props.headerApi,
    body: { orderBy: props.orderBy, ...props.body },
    utilizarURLSearch: props.utilizarURLSearch,
    readonly: props.readonly,
    open,
  })
  const textoNaoEncontrado = props.textoNaoEncontrado ?? 'S/R'
  const { value: selectedRecord, keyLabel } = props

  const value = useMemo(() => {
    if (selectedRecord == null || selectedRecord === '') return null

    const id = selectedRecord.id
    return {
      id,
      record: selectedRecord,
      label: getLabel(selectedRecord, keyLabel) || (id ? textoNaoEncontrado : ''),
    }
  }, [selectedRecord, keyLabel, textoNaoEncontrado])

  return (
    <Autocomplete
      noOptionsText={'Não há registros'}
      id={props.id}
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
        resetarBusca()
      }}
      value={value}
      loading={loading}
      loadingText="Carregando..."
      getOptionLabel={(opt) => `${opt?.label || ''}`}
      onInputChange={(_, novoValor, reason) => {
        if (reason === 'input' || reason === 'clear') pesquisar(novoValor)
      }}
      onChange={(_, newValue, reason) => {
        props.onChange?.(props.id, reason === 'clear' ? undefined : newValue?.record)
      }}
      onBlur={props.onBlur}
      renderOption={
        props.renderOption && ((params, option) => props.renderOption?.(params, option.record))
      }
      slotProps={{
        paper: {
          component: (props2) => (
            <CustomListbox
              {...props2}
              textoBotaoNovoRegistro={props.textoBotaoNovoRegistro}
              onClickBotaoNovoRegistro={props.onClickBotaoNovoRegistro}
              valorDigitado={search}
            />
          ),
        },
      }}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      readOnly={props.readonly}
      fullWidth
      options={valuesOriginais
        .filter((record) => record?.id != null)
        .map((record) => ({
          id: record.id,
          label: getLabel(record, keyLabel) || textoNaoEncontrado,
          record,
        }))}
      size={props.size ?? 'small'}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          autoFocus={props.autoFocus}
          required={props.required}
          helperText={props.helperText}
          error={props.error}
          disabled={props.readonly}
          slotProps={{
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <Fragment>
                  {props.startAdornment}
                  {params.slotProps.input.startAdornment}
                </Fragment>
              ),
              endAdornment: (
                <Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.slotProps.input.endAdornment}
                </Fragment>
              ),
            },
            inputLabel: params.slotProps.inputLabel,
            htmlInput: params.slotProps.htmlInput,
          }}
        />
      )}
    />
  )
}
