import { Chip, CircularProgress } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useApiOrdenacaoDaLoja } from '../../../api/useApiOrdenacaoDaLoja'
import { BoxApp } from '../../../components/BoxApp/BoxApp'
import {
  BoxAppAlignItems,
  BoxAppDisplay,
  BoxAppFlexDirection,
  BoxAppJustifyContent,
  BoxAppTextAlign,
} from '../../../components/BoxApp/boxAppTypes'
import { DropDownApp } from '../../../components/DropDown/DropDownApp'
import { IconApp } from '../../../components/Icon/IconApp'
import { IconButtonComTolltip } from '../../../components/IconButtonComTolltip/IconButtonComTolltip'
import { InputApp } from '../../../components/InputApp/InputApp'
import { InputAppType } from '../../../components/InputApp/inputAppTypes'
import { PaperApp } from '../../../components/PaperApp/PaperApp'
import { SkeletonApp } from '../../../components/SkeletonApp/SkeletonApp'
import { TextApp, TextAppColor, TextAppWeight } from '../../../components/TextApp/TextApp'
import { useThemeApp } from '../../../hook/useThemeApp'
import { TipoOrdenacaoLoja, type ItemOrdenacaoDaLoja } from '../../../types/OrdenacaoDaLojaTypes'

const tiposOrdenacaoLoja: { id: TipoOrdenacaoLoja; label: string; value: TipoOrdenacaoLoja }[] = [
  { id: TipoOrdenacaoLoja.Categoria, label: 'Categoria', value: TipoOrdenacaoLoja.Categoria },
  { id: TipoOrdenacaoLoja.Produto, label: 'Produto', value: TipoOrdenacaoLoja.Produto },
  { id: TipoOrdenacaoLoja.Peso, label: 'Peso', value: TipoOrdenacaoLoja.Peso },
  { id: TipoOrdenacaoLoja.Tamanho, label: 'Tamanho', value: TipoOrdenacaoLoja.Tamanho },
]

function ordenarItens(itens: ItemOrdenacaoDaLoja[]) {
  return [...itens].sort((a, b) => a.ordemExibicao - b.ordemExibicao)
}

export function OrdenacaoDaLojaPage() {
  const { cores } = useThemeApp()
  const api = useApiOrdenacaoDaLoja()
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoOrdenacaoLoja>(
    TipoOrdenacaoLoja.Categoria,
  )
  const [itens, setItens] = useState<ItemOrdenacaoDaLoja[]>([])
  const [indiceEmMovimento, setIndiceEmMovimento] = useState<number | null>(null)
  const [pesquisa, setPesquisa] = useState('')
  const itensOrdenados = useMemo(() => ordenarItens(itens), [itens])
  const itensFiltrados = useMemo(
    () =>
      itensOrdenados.filter((item) =>
        item.descricao.toLowerCase().includes(pesquisa.toLowerCase()),
      ),
    [itensOrdenados, pesquisa],
  )

  useEffect(() => {
    let ativo = true

    async function carregarItens() {
      const response = await api.listar.fetch(tipoSelecionado)
      if (ativo) setItens(ordenarItens(response ?? []))
    }

    carregarItens()

    return () => {
      ativo = false
    }
    // A troca do tipo é a única condição que deve disparar uma nova listagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoSelecionado])

  async function trocarOrdem(indice: number, deslocamento: -1 | 1) {
    const destino = indice + deslocamento
    if (destino < 0 || destino >= itensOrdenados.length || api.atualizar.loading) return

    const origem = itensOrdenados[indice]
    const itemDestino = itensOrdenados[destino]
    setIndiceEmMovimento(indice)
    try {
      const atualizacao = await api.atualizar.fetch(tipoSelecionado, {
        idOrigem: origem.id,
        posicaoOrigem: origem.ordemExibicao,
        idDestino: itemDestino.id,
        posicaoDestino: itemDestino.ordemExibicao,
      })
      if (!atualizacao) return

      setItens((current) =>
        ordenarItens(
          current.map((item) => {
            if (item.id === origem.id) {
              return { ...item, ordemExibicao: itemDestino.ordemExibicao }
            }
            if (item.id === itemDestino.id) {
              return { ...item, ordemExibicao: origem.ordemExibicao }
            }
            return item
          }),
        ),
      )
    } finally {
      setIndiceEmMovimento(null)
    }
  }

  return (
    <PaperApp fullHeight padding={{ xs: 2, sm: 3 }} sx={{ overflow: 'hidden', width: '100%' }}>
      <BoxApp
        alignItems={BoxAppAlignItems.Center}
        display={BoxAppDisplay.Flex}
        flexDirection={BoxAppFlexDirection.Column}
        flex={1}
        gap={2.5}
        minHeight={0}
        width="100%"
      >
        <BoxApp width="100%">
          <BoxApp mb={2}>
            <TextApp variant="h6" weight={TextAppWeight.SemiBold}>
              Ordenação da loja
            </TextApp>
            <TextApp color={TextAppColor.Secondary}>
              Defina a sequência de exibição dos itens.
            </TextApp>
          </BoxApp>
          <BoxApp
            display={BoxAppDisplay.Grid}
            gap={1}
            sx={{ gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, maxWidth: 760, mx: 'auto' }}
          >
            <BoxApp>
              <DropDownApp
                id="tipoOrdenacaoLoja"
                keyLabel="label"
                label="Tipo"
                onChange={(_, value: TipoOrdenacaoLoja) => setTipoSelecionado(value)}
                value={tiposOrdenacaoLoja.find((tipo) => tipo.id === tipoSelecionado)}
                values={tiposOrdenacaoLoja}
              />
            </BoxApp>
            <BoxApp>
              <InputApp
                id="pesquisaOrdenacao"
                label=""
                onChange={(_, value) => setPesquisa(String(value ?? ''))}
                placeholder="Buscar item..."
                type={InputAppType.Search}
                value={pesquisa}
              />
            </BoxApp>
          </BoxApp>
        </BoxApp>

        <BoxApp
          display={BoxAppDisplay.Flex}
          flex={1}
          flexDirection={BoxAppFlexDirection.Column}
          minHeight={0}
          sx={{ maxWidth: 760, width: '100%' }}
        >
          <BoxApp
            mb={1}
            display={BoxAppDisplay.Flex}
            justifyContent={BoxAppJustifyContent.SpaceBetween}
          >
            <TextApp color={TextAppColor.Secondary}>
              {itensFiltrados.length} itens na ordenação
            </TextApp>
            <TextApp color={TextAppColor.Secondary}>Ordem</TextApp>
          </BoxApp>

          <BoxApp flex={1} minHeight={0} sx={{ overflowY: 'auto', overflowX: 'hidden' }}>
            {api.listar.loading && itensOrdenados.length === 0 ? (
              <SkeletonApp height={220} variant="rounded" width="100%" />
            ) : (
              <BoxApp
                display={BoxAppDisplay.Flex}
                flexDirection={BoxAppFlexDirection.Column}
                gap={1}
              >
                {itensFiltrados.map((item) => {
                  const indice = itensOrdenados.findIndex((ordenado) => ordenado.id === item.id)
                  return (
                    <BoxApp
                      alignItems={BoxAppAlignItems.Center}
                      display={BoxAppDisplay.Flex}
                      key={item.id}
                      sx={{
                        backgroundColor: cores.dividerSoft,
                        border: '1px solid',
                        borderColor: cores.divider,
                        borderRadius: 1,
                        gap: 1,
                        minHeight: 54,
                        px: 1.5,
                        mx: 'auto',
                        maxWidth: 640,
                        width: '100%',
                        transition: 'transform 220ms ease, background-color 160ms ease',
                      }}
                    >
                      {item.foto ? (
                        <BoxApp
                          alt={item.descricao}
                          component="img"
                          height={36}
                          objectFit="cover"
                          src={item.foto}
                          sx={{ borderRadius: 1, width: 36 }}
                        />
                      ) : (
                        <IconApp color={cores.text.secondary} icon="solar:list-arrow-down-linear" />
                      )}
                      <BoxApp flex={1} minWidth={0} textAlign={BoxAppTextAlign.Left}>
                        <TextApp noWrap weight={TextAppWeight.Medium}>
                          {item.descricao}
                        </TextApp>
                      </BoxApp>
                      <Chip
                        label={item.ordemExibicao}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ minWidth: 44, borderRadius: 5 }}
                      />
                      <BoxApp
                        alignItems={BoxAppAlignItems.Center}
                        display={BoxAppDisplay.Flex}
                        justifyContent={BoxAppJustifyContent.End}
                      >
                        <IconButtonComTolltip
                          aria-label={`Mover ${item.descricao} para cima`}
                          disabled={indice === 0 || api.atualizar.loading}
                          onClick={() => void trocarOrdem(indice, -1)}
                          tooltip="Mover para cima"
                        >
                          {api.atualizar.loading && indice === indiceEmMovimento ? (
                            <CircularProgress size={18} />
                          ) : (
                            <IconApp icon="solar:alt-arrow-up-linear" />
                          )}
                        </IconButtonComTolltip>
                        <IconButtonComTolltip
                          aria-label={`Mover ${item.descricao} para baixo`}
                          disabled={indice === itensOrdenados.length - 1 || api.atualizar.loading}
                          onClick={() => void trocarOrdem(indice, 1)}
                          tooltip="Mover para baixo"
                        >
                          {api.atualizar.loading && indice === indiceEmMovimento ? (
                            <CircularProgress size={18} />
                          ) : (
                            <IconApp icon="solar:alt-arrow-down-linear" />
                          )}
                        </IconButtonComTolltip>
                      </BoxApp>
                    </BoxApp>
                  )
                })}
              </BoxApp>
            )}
          </BoxApp>
        </BoxApp>
      </BoxApp>
    </PaperApp>
  )
}
