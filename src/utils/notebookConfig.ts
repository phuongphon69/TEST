// Centralized NotebookLM & Gemini Notebook Integration Configuration
// Manages Modes: DISABLED | PERSONAL_NOTEBOOK_LINK | GEMINI_NOTEBOOK_ENTERPRISE | INTERNAL_RAG

export type NotebookIntegrationMode =
  | "DISABLED"
  | "PERSONAL_NOTEBOOK_LINK"
  | "GEMINI_NOTEBOOK_ENTERPRISE"
  | "INTERNAL_RAG";

export interface NotebookConfig {
  mode: NotebookIntegrationMode;
  personalNotebookUrl: string;
  googleClientId: string;
  enterpriseProjectId: string;
  enterpriseDatasetId: string;
  isEnterpriseReady: boolean;
  adminNote: string;
  updatedAt: string;
  connectedGoogleAccount?: {
    email: string;
    name: string;
    picture?: string;
    connectedAt: string;
  } | null;
}

const STORAGE_KEY = 'qlrpbm_notebook_integration_config_v1';

export const DEFAULT_NOTEBOOK_CONFIG: NotebookConfig = {
  mode: "PERSONAL_NOTEBOOK_LINK",
  personalNotebookUrl: "https://notebooklm.google.com/",
  googleClientId: "",
  enterpriseProjectId: "",
  enterpriseDatasetId: "",
  isEnterpriseReady: false,
  adminNote: "Đang sử dụng liên kết NotebookLM cá nhân và Trợ lý RAG AI nội bộ.",
  updatedAt: new Date().toISOString(),
  connectedGoogleAccount: null
};

export function getNotebookConfig(): NotebookConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTEBOOK_CONFIG));
      return DEFAULT_NOTEBOOK_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_NOTEBOOK_CONFIG, ...parsed };
  } catch (err) {
    console.error('Error reading notebook config:', err);
    return DEFAULT_NOTEBOOK_CONFIG;
  }
}

export function saveNotebookConfig(config: Partial<NotebookConfig>): NotebookConfig {
  try {
    const current = getNotebookConfig();
    const updated: NotebookConfig = {
      ...current,
      ...config,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving notebook config:', err);
    return getNotebookConfig();
  }
}

/**
 * Determine effective operational mode with automatic Enterprise readiness fallback
 */
export function getEffectiveNotebookMode(config: NotebookConfig): {
  effectiveMode: NotebookIntegrationMode;
  fallbackReason?: string;
} {
  if (config.mode === 'DISABLED') {
    return { effectiveMode: 'DISABLED' };
  }

  if (config.mode === 'GEMINI_NOTEBOOK_ENTERPRISE') {
    if (!config.enterpriseProjectId || !config.isEnterpriseReady) {
      return {
        effectiveMode: 'PERSONAL_NOTEBOOK_LINK',
        fallbackReason: 'Chưa cấu hình dịch vụ Gemini Notebook Enterprise trên Google Cloud. Tự động chuyển sang chế độ Liên kết NotebookLM cá nhân & RAG Nội bộ.'
      };
    }
    return { effectiveMode: 'GEMINI_NOTEBOOK_ENTERPRISE' };
  }

  if (config.mode === 'PERSONAL_NOTEBOOK_LINK') {
    return { effectiveMode: 'PERSONAL_NOTEBOOK_LINK' };
  }

  return { effectiveMode: 'INTERNAL_RAG' };
}

/**
 * Connect Google account simulation/OAuth store
 */
export function saveConnectedGoogleAccount(account: { email: string; name: string; picture?: string } | null): NotebookConfig {
  const current = getNotebookConfig();
  const updatedAccount = account ? {
    ...account,
    connectedAt: new Date().toLocaleString('vi-VN')
  } : null;

  return saveNotebookConfig({
    connectedGoogleAccount: updatedAccount
  });
}
