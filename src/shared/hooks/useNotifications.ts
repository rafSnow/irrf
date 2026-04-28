import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { checklistRepository } from '../../db/repositories/checklistRepository'
import { documentRepository } from '../../db/repositories/documentRepository'
import { settingsRepository } from '../../db/repositories/settingsRepository'

export interface AppNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  category: 'checklist' | 'seasonal' | 'inactivity'
}

export function useNotifications() {
  const checklistItems = useLiveQuery(() => checklistRepository.getAll())
  const documents = useLiveQuery(() => documentRepository.getAll())
  const alertPreferences = useLiveQuery(async () => {
    const prefs = await settingsRepository.get('alert_preferences')
    return (
      (prefs as Record<string, boolean>) || {
        checklist: true,
        seasonal: true,
        inactivity: true,
      }
    )
  })

  const notifications = useMemo(() => {
    const list: AppNotification[] = []
    if (!alertPreferences) return list

    // 1. Checklist completion < 50%
    if (alertPreferences.checklist && checklistItems && checklistItems.length > 0) {
      const done = checklistItems.filter((i) => i.status === 'done').length
      const percent = (done / checklistItems.length) * 100
      if (percent < 50) {
        list.push({
          id: 'checklist-low',
          type: 'warning',
          title: 'Checklist pendente',
          message: `Você concluiu apenas ${Math.round(percent)}% da sua coleta de documentos.`,
          category: 'checklist',
        })
      }
    }

    // 2. Seasonal Alerts
    if (alertPreferences.seasonal) {
      const now = new Date()
      const month = now.getMonth() // 0-11

      if (month === 0 || month === 1) {
        // Jan or Feb
        list.push({
          id: 'seasonal-income',
          type: 'info',
          title: 'Informes de Rendimento',
          message: 'Lembre-se de solicitar seus informes de rendimento aos bancos e empregadores.',
          category: 'seasonal',
        })
      } else if (month === 2 || month === 3 || month === 4) {
        // Mar, Apr, May
        list.push({
          id: 'seasonal-deadline',
          type: 'warning',
          title: 'Prazo da Declaração',
          message:
            'O prazo para entrega da declaração do IRPF está aberto. Organize seus documentos!',
          category: 'seasonal',
        })
      }
    }

    // 3. Inactivity Alert (Month without documents after the 15th)
    if (alertPreferences.inactivity && documents) {
      const now = new Date()
      const day = now.getDate()
      const month = now.getMonth()
      const year = now.getFullYear()

      if (day > 15) {
        const hasDocInCurrentMonth = documents.some((doc) => {
          const d = new Date(doc.documentDate + 'T12:00:00')
          return d.getMonth() === month && d.getFullYear() === year
        })

        if (!hasDocInCurrentMonth) {
          list.push({
            id: 'inactivity-month',
            type: 'info',
            title: 'Mês sem registros',
            message:
              'Você ainda não cadastrou nenhum documento este mês. Não deixe para a última hora!',
            category: 'inactivity',
          })
        }
      }
    }

    return list
  }, [checklistItems, documents, alertPreferences])

  return { notifications }
}
