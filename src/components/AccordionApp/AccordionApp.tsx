import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { useId, type ReactNode } from 'react'
import { IconApp } from '../Icon/IconApp'

type AccordionAppProps = {
  label: string
  children: ReactNode
}

export function AccordionApp({ label, children }: AccordionAppProps) {
  const id = useId()

  return (
    <Accordion disableGutters elevation={0} sx={{ flexShrink: 0, mb: 1 }}>
      <AccordionSummary
        id={`${id}-summary`}
        aria-controls={`${id}-content`}
        expandIcon={<IconApp icon="solar:alt-arrow-down-linear" />}
      >
        {label}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}
