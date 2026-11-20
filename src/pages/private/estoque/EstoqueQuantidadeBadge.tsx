import { BadgeApp } from '../../../components/BadegApp/BadgeApp'
import { useThemeApp } from '../../../hook/useThemeApp'

type EstoqueQuantidadeBadgeProps = {
  value?: number | null
  compacto?: boolean
}

export function EstoqueQuantidadeBadge({ value, compacto }: EstoqueQuantidadeBadgeProps) {
  const { cores } = useThemeApp()

  if (value == null) return null

  return (
    <BadgeApp
      cor={value > 0 ? cores.success : cores.warning}
      fontSize={compacto ? '0.75rem' : undefined}
      padding={compacto ? '.1rem .35rem' : undefined}
      texto={String(value)}
      width={compacto ? undefined : '80px'}
    />
  )
}
