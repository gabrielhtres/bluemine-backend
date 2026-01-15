declare module 'multer' {
  export class MulterError extends Error {
    code: string;
    field?: string;
  }

  export interface StorageEngine {
    _handleFile: (
      req: unknown,
      file: unknown,
      cb: (error?: unknown, info?: unknown) => void,
    ) => void;
    _removeFile: (
      req: unknown,
      file: unknown,
      cb: (error: Error | null) => void,
    ) => void;
  }

  export function diskStorage(opts: unknown): StorageEngine;
}
