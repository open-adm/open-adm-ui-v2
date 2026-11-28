import type { ParcelaPaginacao } from '../../types/FaturaTypes'

export function calcularJurosParcela(parcela: ParcelaPaginacao) {
  const { valor, valorPagoRecebido, descontoConcedido, valorAPagarAReceber } = parcela
  // O saldo da API é o valor da parcela menos o valor abatido, que exclui os juros.
  const juros = valorPagoRecebido + descontoConcedido + valorAPagarAReceber - valor
  const centavos = Math.round(juros * 100)
  return centavos === 0 ? 0 : centavos / 100
}
