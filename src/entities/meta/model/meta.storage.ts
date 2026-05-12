import { STORAGE_KEYS } from "../../../shared/constants/storage";
import type { MetaProgress } from "../../../shared/types/game";
import {
  readStorageJson,
  removeStorageItem,
  writeStorageJson,
} from "../../../shared/utils/storage";
import type { DaycareEnvironment } from "../../request/model/request.types";

export interface StoredMetaProgress {
  environment?: DaycareEnvironment;
  progress?: MetaProgress;
}

export function readMetaStorage(): StoredMetaProgress | null {
  return readStorageJson<StoredMetaProgress>(STORAGE_KEYS.metaProgress);
}

export function writeMetaStorage(
  environment: DaycareEnvironment,
  progress: MetaProgress,
): void {
  writeStorageJson<StoredMetaProgress>(STORAGE_KEYS.metaProgress, {
    environment,
    progress,
  });
}

export function clearMetaStorage(): void {
  removeStorageItem(STORAGE_KEYS.metaProgress);
}
