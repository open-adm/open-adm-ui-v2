import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApiParcela } from '../../../api/useApiParcela'
import { BoxApp } from '../../../components/BoxApp/BoxApp'
import { ButtonApp, ButtonAppVariant } from '../../../components/ButtonApp/ButtonApp'
import { MeioDePagamentoDropDown } from '../../../components/DropDown/MeioDePagamentoDropDown'
import { InputApp } from '../../../components/InputApp/InputApp'
import { InputAppType } from '../../../components/InputApp/inputAppTypes'
import { ModalChildren } from '../../../components/Modal/ModalChildren'
import { ProgressApp } from '../../../components/ProgressApp/ProgressApp'
import { StackApp } from '../../../components/StackApp/StackApp'
import { TextApp, TextAppColor, TextAppWeight } from '../../../components/TextApp/TextApp'
import { FormRoot } from '../../../form'
import { useFormikAdapter } from '../../../hook/useFormikAdapter'
import { useNavigationApp } from '../../../hook/useNavigationApp'
import { useThemeApp } from '../../../hook/useThemeApp'
import { YupAdapter } from '../../../lib/YupAdapter'
import { PrivateRoutePath } from '../../../routes/appRoutes'
import {
  MeioDePagamento,
  PagarParcelaFormField,
  TipoFatura,
  type PagarParcelaForm,
  type PagarParcelaPayload,
  type Parcela,
} from '../../../types/FaturaTypes'
import { formatarDataHoraUtcLocal } from '../../../utils/dateUtils'
import { formatMoney } from '../../../utils/moneyUtils'

function dataAtualInput() {
  const agora = new Date()
  const offset = agora.getTimezoneOffset() * 60_000
  return new Date(agora.getTime() - offset).toISOString().slice(0, 10)
}

type FormValues = Omit<PagarParcelaForm, 'valor'> & {
  valor: number | ''
  valorBase: number
}

const initialValues: FormValues = {
  valor: 0,
  valorBase: 0,
  desconto: 0,
  juros: 0,
  meioDePagamento: MeioDePagamento.Pix,
  dataDePagamento: dataAtualInput(),
  observacao: '',
}

const validationSchema = new YupAdapter()
  .number(PagarParcelaFormField.Valor, 'Informe um valor maior que zero', 0.01)
  .build()

type ResumoLinhaProps = { label: string; value: string; destaque?: boolean; corValor?: string }

function ResumoLinha({ destaque, label, value, corValor }: ResumoLinhaProps) {
  return (
    <StackApp direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <TextApp
        color={destaque ? TextAppColor.Default : TextAppColor.Secondary}
        weight={destaque ? TextAppWeight.SemiBold : undefined}
      >
        {label}
      </TextApp>
      <TextApp color={corValor} weight={destaque ? TextAppWeight.SemiBold : undefined}>
        {value}
      </TextApp>
    </StackApp>
  )
}

type ResumoPagamentoProps = Pick<PagarParcelaForm, 'valor' | 'desconto' | 'juros'> & {
  valorParcela: number
}

function ResumoPagamento({ valorParcela, desconto = 0, juros = 0, valor }: ResumoPagamentoProps) {
  const { cores } = useThemeApp()

  return (
    <StackApp spacing={0.75}>
      <ResumoLinha label="Valor da parcela" value={formatMoney(valorParcela)} />
      <ResumoLinha label="Desconto" value={formatMoney(desconto)} corValor={cores.warning} />
      <ResumoLinha label="Juros" value={formatMoney(juros)} corValor={cores.error} />
      <BoxApp borderTop="1px solid" borderColor="divider" pt="0.75rem">
        <ResumoLinha
          destaque
          label="Total recebido"
          value={formatMoney(valor)}
          corValor={cores.success}
        />
      </BoxApp>
    </StackApp>
  )
}

export function PagarParcelaPage() {
  const { id } = useParams<{ id: string }>()
  const { navigate } = useNavigationApp()
  const { obter, pagar } = useApiParcela()
  const [parcela, setParcela] = useState<Parcela>()
  const [pagamentoPendente, setPagamentoPendente] = useState<PagarParcelaPayload>()
  const urlVoltar =
    parcela?.fatura.tipo === TipoFatura.APagar
      ? PrivateRoutePath.ContaAPagar
      : PrivateRoutePath.ContaAReceber
  const form = useFormikAdapter<FormValues>({
    initialValues,
    validationSchema,
    onSubmit: (values: FormValues) => {
      if (!id || !parcela || pagamentoPendente) return
      setPagamentoPendente({
        id,
        valor: Number(values.valor),
        desconto: values.desconto || undefined,
        juros: values.juros || undefined,
        meioDePagamento: values.meioDePagamento ? Number(values.meioDePagamento) : undefined,
        dataDePagamento: values.dataDePagamento || undefined,
        observacao: values.observacao?.trim() || undefined,
      })
    },
  })

  function cancelarConfirmacao() {
    setPagamentoPendente(undefined)
  }

  async function confirmarPagamento() {
    if (!pagamentoPendente || pagamentoPendente.id !== id || pagar.loading) return
    const response = await pagar.fetch(pagamentoPendente)
    if (!response) return
    setPagamentoPendente(undefined)
    navigate(urlVoltar)
  }

  function alterarValorRecebido(valor: number | '') {
    const { desconto = 0, juros = 0 } = form.values
    form.setValue({
      valor,
      valorBase: Math.round((Number(valor) + desconto - juros) * 100) / 100,
    })
  }

  function alterarAjuste(
    campo: typeof PagarParcelaFormField.Desconto | typeof PagarParcelaFormField.Juros,
    valor: number | undefined,
  ) {
    const values = { ...form.values, [campo]: valor }
    const { valorBase, desconto = 0, juros = 0 } = values
    form.setValue({
      [campo]: valor,
      valor: Math.max(0, Math.round((valorBase - desconto + juros) * 100) / 100),
    })
  }

  useEffect(() => {
    if (!id) return
    async function carregar() {
      const response = await obter.fetch(id as string)
      if (!response) return
      setParcela(response)
      form.setValue({
        valor: response.valorAPagarAReceber,
        valorBase: response.valorAPagarAReceber,
      })
    }
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <FormRoot.Form
      loading={obter.loading || pagar.loading}
      responsiveMobileActions
      submit={form.onSubmit}
      textoButton="Baixar parcela"
      urlVoltar={urlVoltar}
    >
      {obter.loading && <ProgressApp />}
      {parcela && (
        <StackApp spacing={3} sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
          <BoxApp border="1px solid" borderColor="divider" borderRadius={1} padding="1rem">
            <StackApp spacing={1.5}>
              <StackApp
                direction={{ xs: 'column', sm: 'row' }}
                spacing={0.5}
                sx={{ justifyContent: 'space-between' }}
              >
                <TextApp weight={TextAppWeight.SemiBold}>
                  Fatura #{parcela.fatura.numero}
                  {parcela.fatura.pedido?.numero
                    ? ` · Pedido #${parcela.fatura.pedido.numero}`
                    : ''}
                </TextApp>
                <TextApp weight={TextAppWeight.SemiBold}>Parcela {parcela.numeroDaParcela}</TextApp>
              </StackApp>
              <TextApp>{parcela.fatura.usuario?.nome || '-'}</TextApp>
              <StackApp
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between' }}
              >
                <TextApp color={TextAppColor.Secondary}>
                  Vencimento {formatarDataHoraUtcLocal(parcela.dataDeVencimento)}
                </TextApp>
                <StackApp direction="row" spacing={1}>
                  <TextApp color={TextAppColor.Secondary}>Restante</TextApp>
                  <TextApp weight={TextAppWeight.SemiBold}>
                    {formatMoney(parcela.valorAPagarAReceber)}
                  </TextApp>
                </StackApp>
              </StackApp>
            </StackApp>
          </BoxApp>

          <FormRoot.FormRow>
            <FormRoot.FormItemRow md={6} xs={12}>
              <InputApp
                error={form.error(PagarParcelaFormField.Valor)}
                helperText={form.helperText(PagarParcelaFormField.Valor)}
                id={PagarParcelaFormField.Valor}
                label="Valor recebido"
                onBlur={form.onBlur}
                onChange={(_, value) =>
                  alterarValorRecebido(typeof value === 'number' ? value : '')
                }
                required
                startAdornment="R$"
                type={InputAppType.Currency}
                value={form.values.valor}
              />
            </FormRoot.FormItemRow>
            <FormRoot.FormItemRow md={6} xs={12}>
              <InputApp
                id={PagarParcelaFormField.DataDePagamento}
                label="Data do pagamento"
                onChange={form.onChange}
                type={InputAppType.Date}
                value={form.values.dataDePagamento ?? ''}
              />
            </FormRoot.FormItemRow>
            <FormRoot.FormItemRow xs={12}>
              <MeioDePagamentoDropDown
                id={PagarParcelaFormField.MeioDePagamento}
                onChange={(value) => form.onChange(PagarParcelaFormField.MeioDePagamento, value)}
                value={form.values.meioDePagamento}
              />
            </FormRoot.FormItemRow>
          </FormRoot.FormRow>

          <StackApp spacing={1}>
            <TextApp weight={TextAppWeight.SemiBold}>Ajustes</TextApp>
            <FormRoot.FormRow>
              <FormRoot.FormItemRow md={6} xs={12}>
                <InputApp
                  id={PagarParcelaFormField.Desconto}
                  label="Desconto"
                  onChange={(_, value) =>
                    alterarAjuste(
                      PagarParcelaFormField.Desconto,
                      typeof value === 'number' ? value : undefined,
                    )
                  }
                  startAdornment="R$"
                  type={InputAppType.Currency}
                  value={form.values.desconto ?? ''}
                />
              </FormRoot.FormItemRow>
              <FormRoot.FormItemRow md={6} xs={12}>
                <InputApp
                  id={PagarParcelaFormField.Juros}
                  label="Juros"
                  onChange={(_, value) =>
                    alterarAjuste(
                      PagarParcelaFormField.Juros,
                      typeof value === 'number' ? value : undefined,
                    )
                  }
                  startAdornment="R$"
                  type={InputAppType.Currency}
                  value={form.values.juros ?? ''}
                />
              </FormRoot.FormItemRow>
            </FormRoot.FormRow>
          </StackApp>

          <FormRoot.FormRow>
            <FormRoot.FormItemRow xs={12}>
              <InputApp
                id={PagarParcelaFormField.Observacao}
                label="Observação"
                maxLength={500}
                multiline
                onChange={form.onChange}
                rows={3}
                value={form.values.observacao ?? ''}
              />
            </FormRoot.FormItemRow>
          </FormRoot.FormRow>

          <ResumoPagamento
            valorParcela={parcela.valorAPagarAReceber}
            valor={Number(form.values.valor)}
            desconto={form.values.desconto}
            juros={form.values.juros}
          />
        </StackApp>
      )}
      {parcela && pagamentoPendente && pagamentoPendente.id === id && (
        <ModalChildren
          open
          fullWidth
          maxWidth="xs"
          titulo="Confirmar baixa da parcela"
          close={pagar.loading ? undefined : cancelarConfirmacao}
          footerChildren={
            <>
              <ButtonApp
                disabled={pagar.loading}
                onClick={cancelarConfirmacao}
                variant={ButtonAppVariant.Outlined}
              >
                Cancelar
              </ButtonApp>
              <ButtonApp loading={pagar.loading} onClick={confirmarPagamento}>
                Confirmar baixa
              </ButtonApp>
            </>
          }
        >
          <ResumoPagamento
            valorParcela={parcela.valorAPagarAReceber}
            valor={pagamentoPendente.valor}
            desconto={pagamentoPendente.desconto}
            juros={pagamentoPendente.juros}
          />
        </ModalChildren>
      )}
    </FormRoot.Form>
  )
}
