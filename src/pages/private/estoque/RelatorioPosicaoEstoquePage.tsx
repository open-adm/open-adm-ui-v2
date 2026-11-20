import { useState } from 'react'
import { useApiEstoque } from '../../../api/useApiEstoque'
import { AccordionApp } from '../../../components/AccordionApp/AccordionApp'
import { BoxApp } from '../../../components/BoxApp/BoxApp'
import { ButtonApp, ButtonAppVariant } from '../../../components/ButtonApp/ButtonApp'
import { CategoriaMultiSelect } from '../../../components/DropDown/CategoriaMultiSelect'
import { PesoMultiSelect } from '../../../components/DropDown/PesoMultiSelect'
import { ProdutoMultiSelect } from '../../../components/DropDown/ProdutoMultiSelect'
import { TamanhoMultiSelect } from '../../../components/DropDown/TamanhoMultiSelect'
import { InputApp } from '../../../components/InputApp/InputApp'
import { InputAppType } from '../../../components/InputApp/inputAppTypes'
import { TabelaComDrag } from '../../../components/Tabela/TabelaComDrag'
import type { TypeColumns } from '../../../components/Tabela/tabelaComDragTypes'
import { FormRoot } from '../../../form'
import { useFormikAdapter } from '../../../hook/useFormikAdapter'
import { useMediaQueryApp } from '../../../hook/useMediaQueryApp'
import type { Categoria } from '../../../types/CategoriaTypes'
import type { Estoque } from '../../../types/EstoqueTypes'
import type { Peso } from '../../../types/PesoTypes'
import type { Produto } from '../../../types/ProdutoTypes'
import type { Tamanho } from '../../../types/TamanhoTypes'
import { formatarDataHoraUtcLocal } from '../../../utils/dateUtils'
import { criarColunasEstoqueMobile, estoqueMobileRowHeight } from './estoqueMobileColumns'
import { EstoqueQuantidadeBadge } from './EstoqueQuantidadeBadge'
import { imprimirRelatorioPosicaoEstoque } from './imprimirRelatorioPosicaoEstoque'

type Filtros = {
  categorias: Categoria[]
  pesos: Peso[]
  produtos: Produto[]
  tamanhos: Tamanho[]
  estoqueReservadoMaiorQue: string
  estoqueDisponivelMenorOuIgualA: string
}

const filtrosIniciais: Filtros = {
  categorias: [],
  pesos: [],
  produtos: [],
  tamanhos: [],
  estoqueReservadoMaiorQue: '',
  estoqueDisponivelMenorOuIgualA: '',
}

const filtrosQuantidade = [
  { campo: 'estoqueReservadoMaiorQue', label: 'Estoque reservado maior que' },
  { campo: 'estoqueDisponivelMenorOuIgualA', label: 'Estoque disponível menor ou igual a' },
] as const

const coluna = {
  Produto: 'produto',
  Peso: 'peso',
  Tamanho: 'tamanho',
  Quantidade: 'quantidade',
  Disponivel: 'quantidadeDisponivel',
  Reservada: 'quantidadeReservada',
  Atualizacao: 'dataDeAtualizacao',
} as const

export function RelatorioPosicaoEstoquePage() {
  const { relatorioPosicao } = useApiEstoque()
  const { isCelular } = useMediaQueryApp()
  const [itens, setItens] = useState<Estoque[]>([])

  const form = useFormikAdapter<Filtros>({
    initialValues: filtrosIniciais,
    onSubmit: async ({
      categorias,
      pesos,
      produtos,
      tamanhos,
      estoqueReservadoMaiorQue,
      estoqueDisponivelMenorOuIgualA,
    }: Filtros) => {
      const resultado = await relatorioPosicao.fetch({
        categorias: categorias.map(({ id }) => id),
        pesos: pesos.map(({ id }) => id),
        produtos: produtos.map(({ id }) => id),
        tamanhos: tamanhos.map(({ id }) => id),
        estoqueReservadoMaiorQue:
          estoqueReservadoMaiorQue === '' ? undefined : Number(estoqueReservadoMaiorQue),
        estoqueDisponivelMenorOuIgualA:
          estoqueDisponivelMenorOuIgualA === ''
            ? undefined
            : Number(estoqueDisponivelMenorOuIgualA),
      })
      setItens(resultado?.itens ?? [])
    },
  })

  const columns: TypeColumns[] = [
    { field: coluna.Produto, headerName: 'Produto', flex: 1, minWidth: 200 },
    { field: coluna.Peso, headerName: 'Peso', width: 100 },
    { field: coluna.Tamanho, headerName: 'Tamanho', width: 100 },
    {
      field: coluna.Quantidade,
      headerName: 'Posição do estoque',
      width: 200,
      cellRenderer: EstoqueQuantidadeBadge,
    },
    {
      field: coluna.Disponivel,
      headerName: 'Qtd. disponível',
      width: 170,
      cellRenderer: EstoqueQuantidadeBadge,
    },
    {
      field: coluna.Reservada,
      headerName: 'Qtd. reservada',
      width: 170,
      cellRenderer: EstoqueQuantidadeBadge,
    },
    {
      field: coluna.Atualizacao,
      headerName: 'Última movimentação',
      width: 190,
      valueFormatter: ({ value }) => formatarDataHoraUtcLocal(value),
    },
  ]

  const filtrosVariacao = (
    <>
      <FormRoot.FormItemRow xs={12} sm={6} md={3}>
        <PesoMultiSelect
          values={form.values.pesos}
          onChange={(pesos) => form.setValue({ pesos })}
        />
      </FormRoot.FormItemRow>
      <FormRoot.FormItemRow xs={12} sm={6} md={3}>
        <TamanhoMultiSelect
          values={form.values.tamanhos}
          onChange={(tamanhos) => form.setValue({ tamanhos })}
        />
      </FormRoot.FormItemRow>
    </>
  )

  const filtrosSaldo = (
    <FormRoot.FormRow>
      {filtrosQuantidade.map(({ campo, label }) => (
        <FormRoot.FormItemRow key={campo} xs={12} sm={6} md={4}>
          <InputApp
            id={campo}
            label={label}
            name={campo}
            onChange={form.onChange}
            step="any"
            type={InputAppType.Number}
            value={form.values[campo]}
          />
        </FormRoot.FormItemRow>
      ))}
    </FormRoot.FormRow>
  )

  return (
    <FormRoot.Form
      footer={{
        children: (
          <ButtonApp
            disabled={itens.length === 0 || relatorioPosicao.loading}
            onClick={() => imprimirRelatorioPosicaoEstoque(itens)}
            variant={ButtonAppVariant.Outlined}
          >
            Imprimir
          </ButtonApp>
        ),
      }}
      fullHeight
      loading={relatorioPosicao.loading}
      responsiveMobileActions
      submit={form.onSubmit}
      textoButton="Consultar"
    >
      <FormRoot.FormRow>
        <FormRoot.FormItemRow xs={12} sm={6} md={3}>
          <ProdutoMultiSelect
            values={form.values.produtos}
            onChange={(produtos) => form.setValue({ produtos })}
          />
        </FormRoot.FormItemRow>
        <FormRoot.FormItemRow xs={12} sm={6} md={3}>
          <CategoriaMultiSelect
            values={form.values.categorias}
            onChange={(categorias) => form.setValue({ categorias })}
          />
        </FormRoot.FormItemRow>
        {!isCelular && filtrosVariacao}
      </FormRoot.FormRow>
      {isCelular ? (
        <AccordionApp label="Mais filtros">
          <FormRoot.FormRow>{filtrosVariacao}</FormRoot.FormRow>
          {filtrosSaldo}
        </AccordionApp>
      ) : (
        filtrosSaldo
      )}
      <BoxApp flex={1} minHeight={isCelular ? 160 : 0} minWidth={0}>
        <TabelaComDrag
          barraRolagemCompacta={isCelular}
          columns={isCelular ? criarColunasEstoqueMobile() : columns}
          loading={relatorioPosicao.loading}
          preencherLargura={isCelular}
          rowHeight={isCelular ? estoqueMobileRowHeight : undefined}
          rows={itens}
        />
      </BoxApp>
    </FormRoot.Form>
  )
}
