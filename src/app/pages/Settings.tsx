import React, { useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { useTheme } from '../providers/ThemeProvider'
import { useStorage } from '../../shared/hooks'
import { settingsRepository } from '../../db/repositories/settingsRepository'
import { backupService } from '../../features/backup/services/backupService'
import { db } from '../../db/database'
import { Card, Button, Modal, Input } from '../../shared/components'
import {
  Fingerprint,
  HardDrive,
  LogOut,
  ShieldCheck,
  AlertCircle,
  Bell,
  CheckCircle,
  Calendar,
  ZapOff,
  Database,
  Download,
  Upload,
  Moon,
  Sun,
  Trash2,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

export const Settings: React.FC = () => {
  const { isBiometryEnabled, enableBiometry, disableBiometry, logout, encryptionKey } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { usage } = useStorage()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

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

  const lastBackupDate = useLiveQuery(async () => {
    return (await settingsRepository.get('last_backup_date')) as string
  })

  const togglePreference = async (key: string) => {
    const newPrefs = { ...alertPreferences, [key]: !alertPreferences?.[key] }
    await settingsRepository.set('alert_preferences', newPrefs)
  }

  const handleExportBackup = async () => {
    try {
      const blob = await backupService.exportBackup(encryptionKey)
      const url = URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = `guardiao-fiscal-backup-${new Date().toISOString().split('T')[0]}.zip`
      link.click()
    } catch (err) {
      console.error(err)
      alert('Erro ao exportar backup.')
    }
  }

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const count = await backupService.importBackup(file, encryptionKey)
        alert(`Backup restaurado com sucesso! ${count} documentos importados.`)
      } catch (err) {
        console.error(err)
        alert('Erro ao restaurar backup. Verifique se a senha/PIN atual é a mesma do backup.')
      }
    }
  }

  const handleDeleteAllData = async () => {
    if (deleteConfirmText === 'EXCLUIR') {
      await db.delete()
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie sua segurança e armazenamento.</p>
      </header>

      <div className="space-y-4">
        {/* Appearance */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sun size={20} className="text-indigo-600" />
            Aparência
          </h2>
          <Card className="p-0 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div>
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-xs text-gray-500">Alterne entre tema claro e escuro</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    theme === 'dark' ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </Card>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-600" />
            Segurança
          </h2>
          <Card className="divide-y divide-gray-50 p-0 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Fingerprint size={24} />
                </div>
                <div>
                  <p className="font-medium">Biometria</p>
                  <p className="text-xs text-gray-500">Use TouchID/FaceID para desbloquear</p>
                </div>
              </div>
              <button
                onClick={() => (isBiometryEnabled ? disableBiometry() : enableBiometry())}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isBiometryEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    isBiometryEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </Card>
        </section>

        {/* Backup */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Database size={20} className="text-indigo-600" />
            Backup e Restauração
          </h2>
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Exportar Dados</p>
                <p className="text-xs text-gray-500">Gera um arquivo ZIP com seus dados</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleExportBackup}>
                <Download size={16} className="mr-2" /> Exportar
              </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div>
                <p className="font-medium text-sm">Importar Backup</p>
                <p className="text-xs text-gray-500">Restaura dados de um arquivo ZIP</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleImportBackup}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button size="sm" variant="outline">
                  <Upload size={16} className="mr-2" /> Importar
                </Button>
              </div>
            </div>
            {lastBackupDate && (
              <div className="pt-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold">
                  Último backup: {new Date(lastBackupDate).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Bell size={20} className="text-indigo-600" />
            Notificações e Alertas
          </h2>
          <Card className="divide-y divide-gray-50 p-0 overflow-hidden">
            <PreferenceItem
              icon={<CheckCircle size={20} />}
              title="Progresso do Checklist"
              description="Avisar quando houver muitos itens pendentes"
              isActive={!!alertPreferences?.checklist}
              onToggle={() => togglePreference('checklist')}
            />
            <PreferenceItem
              icon={<Calendar size={20} />}
              title="Alertas Sazonais"
              description="Lembretes de prazos e informes de rendimento"
              isActive={!!alertPreferences?.seasonal}
              onToggle={() => togglePreference('seasonal')}
            />
            <PreferenceItem
              icon={<ZapOff size={20} />}
              title="Avisos de Inatividade"
              description="Notificar meses sem registros após o dia 15"
              isActive={!!alertPreferences?.inactivity}
              onToggle={() => togglePreference('inactivity')}
            />
          </Card>
        </section>

        {/* Storage */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <HardDrive size={20} className="text-indigo-600" />
            Armazenamento
          </h2>
          <Card>
            {usage ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Espaço utilizado</span>
                  <span className="font-medium">
                    {formatBytes(usage.used)} de {formatBytes(usage.total)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      usage.percent > 80 ? 'bg-red-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${usage.percent}%` }}
                  />
                </div>
                {usage.percent > 80 && (
                  <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>Atenção: Armazenamento acima de 80%. Considere fazer um backup.</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Calculando armazenamento...</p>
            )}
          </Card>
        </section>

        {/* Logout */}
        <section className="pt-4 space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            onClick={logout}
          >
            <LogOut size={20} />
            <span>Sair do Aplicativo</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full flex items-center justify-center space-x-2 text-red-500 hover:bg-red-50"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 size={20} />
            <span>Apagar todos os dados</span>
          </Button>

          <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
            Guardião Fiscal v1.0.0
          </p>
        </section>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Zona de Perigo"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>
              Esta ação apagará permanentemente todos os seus documentos, fotos e configurações.
              <strong> Não há como desfazer.</strong>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700">Digite "EXCLUIR" para confirmar:</p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Digite aqui..."
              className="border-red-200 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={deleteConfirmText !== 'EXCLUIR'}
              onClick={handleDeleteAllData}
            >
              Apagar Tudo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const PreferenceItem: React.FC<{
  icon: React.ReactNode
  title: string
  description: string
  isActive: boolean
  onToggle: () => void
}> = ({ icon, title, description, isActive, onToggle }) => (
  <div className="p-4 flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`w-10 h-5 rounded-full transition-colors relative ${
        isActive ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
          isActive ? 'left-5.5' : 'left-0.5'
        }`}
      />
    </button>
  </div>
)
