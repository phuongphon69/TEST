import {
  ExecutionArea,
  GridBlock,
  UXODailyExecutionLog,
  UXOSignalRecord,
  UXODiscoveryDossier,
  UXOQualityRecord,
  UXOSafetyRecord
} from '../types';

import {
  INITIAL_EXECUTION_AREAS,
  INITIAL_GRID_BLOCKS,
  INITIAL_DAILY_LOGS,
  INITIAL_SIGNAL_RECORDS,
  INITIAL_DISCOVERY_DOSSIERS,
  INITIAL_QUALITY_RECORDS,
  INITIAL_SAFETY_RECORDS
} from '../data/initialUXOOpsData';

const UXO_STORAGE_KEYS = {
  EXECUTION_AREAS: 'qlrpbm_execution_areas',
  GRID_BLOCKS: 'qlrpbm_grid_blocks',
  DAILY_LOGS: 'qlrpbm_daily_logs',
  SIGNAL_RECORDS: 'qlrpbm_signal_records',
  DISCOVERY_DOSSIERS: 'qlrpbm_discovery_dossiers',
  QUALITY_RECORDS: 'qlrpbm_quality_records',
  SAFETY_RECORDS: 'qlrpbm_safety_records'
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// 8.1 Execution Areas
export function getExecutionAreas(): ExecutionArea[] {
  return getStored<ExecutionArea[]>(UXO_STORAGE_KEYS.EXECUTION_AREAS, INITIAL_EXECUTION_AREAS);
}
export function saveExecutionAreas(items: ExecutionArea[]): void {
  setStored(UXO_STORAGE_KEYS.EXECUTION_AREAS, items);
}

// 8.2 Grid Blocks
export function getGridBlocks(): GridBlock[] {
  return getStored<GridBlock[]>(UXO_STORAGE_KEYS.GRID_BLOCKS, INITIAL_GRID_BLOCKS);
}
export function saveGridBlocks(items: GridBlock[]): void {
  setStored(UXO_STORAGE_KEYS.GRID_BLOCKS, items);
}

// 8.3 Daily Logs
export function getUXODailyLogs(): UXODailyExecutionLog[] {
  return getStored<UXODailyExecutionLog[]>(UXO_STORAGE_KEYS.DAILY_LOGS, INITIAL_DAILY_LOGS);
}
export function saveUXODailyLogs(items: UXODailyExecutionLog[]): void {
  setStored(UXO_STORAGE_KEYS.DAILY_LOGS, items);
}

// 8.4 Signal Records
export function getSignalRecords(): UXOSignalRecord[] {
  return getStored<UXOSignalRecord[]>(UXO_STORAGE_KEYS.SIGNAL_RECORDS, INITIAL_SIGNAL_RECORDS);
}
export function saveSignalRecords(items: UXOSignalRecord[]): void {
  setStored(UXO_STORAGE_KEYS.SIGNAL_RECORDS, items);
}

// 8.5 Discovery Dossiers
export function getDiscoveryDossiers(): UXODiscoveryDossier[] {
  return getStored<UXODiscoveryDossier[]>(UXO_STORAGE_KEYS.DISCOVERY_DOSSIERS, INITIAL_DISCOVERY_DOSSIERS);
}
export function saveDiscoveryDossiers(items: UXODiscoveryDossier[]): void {
  setStored(UXO_STORAGE_KEYS.DISCOVERY_DOSSIERS, items);
}

// 8.6 Quality Records
export function getQualityRecords(): UXOQualityRecord[] {
  return getStored<UXOQualityRecord[]>(UXO_STORAGE_KEYS.QUALITY_RECORDS, INITIAL_QUALITY_RECORDS);
}
export function saveQualityRecords(items: UXOQualityRecord[]): void {
  setStored(UXO_STORAGE_KEYS.QUALITY_RECORDS, items);
}

// 8.7 Safety Records
export function getSafetyRecords(): UXOSafetyRecord[] {
  return getStored<UXOSafetyRecord[]>(UXO_STORAGE_KEYS.SAFETY_RECORDS, INITIAL_SAFETY_RECORDS);
}
export function saveSafetyRecords(items: UXOSafetyRecord[]): void {
  setStored(UXO_STORAGE_KEYS.SAFETY_RECORDS, items);
}

// Reset function for Section 8
export function resetUXOOpsData(): void {
  setStored(UXO_STORAGE_KEYS.EXECUTION_AREAS, INITIAL_EXECUTION_AREAS);
  setStored(UXO_STORAGE_KEYS.GRID_BLOCKS, INITIAL_GRID_BLOCKS);
  setStored(UXO_STORAGE_KEYS.DAILY_LOGS, INITIAL_DAILY_LOGS);
  setStored(UXO_STORAGE_KEYS.SIGNAL_RECORDS, INITIAL_SIGNAL_RECORDS);
  setStored(UXO_STORAGE_KEYS.DISCOVERY_DOSSIERS, INITIAL_DISCOVERY_DOSSIERS);
  setStored(UXO_STORAGE_KEYS.QUALITY_RECORDS, INITIAL_QUALITY_RECORDS);
  setStored(UXO_STORAGE_KEYS.SAFETY_RECORDS, INITIAL_SAFETY_RECORDS);
}
