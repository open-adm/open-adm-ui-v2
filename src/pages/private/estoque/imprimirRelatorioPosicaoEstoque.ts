import type { Estoque } from '../../../types/EstoqueTypes'

export const tituloRelatorioPosicaoEstoque = 'Relatório de Posição de Estoque'

function escaparTexto(value?: string | null) {
  return (value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function gerarDocumento(itens: Estoque[]) {
  const total = itens.reduce((soma, item) => soma + (item.quantidade || 0), 0)
  const linhas = itens.map((item) => `
    <tr>
      <td>${escaparTexto(item.produto)}</td>
      <td>${escaparTexto(item.categoria)}</td>
      <td>${escaparTexto(item.peso)}</td>
      <td>${escaparTexto(item.tamanho)}</td>
      <td>${item.quantidade.toFixed(2)}</td>
      <td>${item.quantidadeDisponivel.toFixed(2)}</td>
      <td>${item.quantidadeReservada.toFixed(2)}</td>
    </tr>`).join('')

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${tituloRelatorioPosicaoEstoque}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font: 11px Arial, sans-serif; }
    h1 { font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    tr { break-inside: avoid; }
    th, td { padding: 3px 4px; text-align: left; }
    th { border-bottom: 1px solid currentColor; }
    footer { margin-top: 20px; text-align: right; }
  </style>
</head>
<body>
  <h1>${tituloRelatorioPosicaoEstoque}</h1>
  <table>
    <thead>
      <tr>
        <th>Produto</th><th>Categoria</th><th>Peso</th><th>Tamanho</th>
        <th>Quantidade</th><th>Disponível</th><th>Reservada</th>
      </tr>
    </thead>
    <tbody>${linhas}</tbody>
  </table>
  <p><strong>Total produtos: ${total.toFixed(2)}</strong></p>
  <footer>${itens.length === 1 ? '1/1' : `${itens.length} itens`}</footer>
</body>
</html>`
}

export function imprimirRelatorioPosicaoEstoque(itens: Estoque[]) {
  const frame = document.createElement('iframe')
  frame.title = tituloRelatorioPosicaoEstoque
  frame.setAttribute('aria-hidden', 'true')
  Object.assign(frame.style, { position: 'fixed', left: '-10000px', width: '1px', height: '1px', border: '0' })
  frame.addEventListener('load', () => {
    const janela = frame.contentWindow
    if (!janela) {
      frame.remove()
      return
    }

    janela.addEventListener('afterprint', () => frame.remove(), { once: true })
    janela.print()
  }, { once: true })
  frame.srcdoc = gerarDocumento(itens)
  document.body.appendChild(frame)
}
