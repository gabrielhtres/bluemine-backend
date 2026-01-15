import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import type { StorageEngine } from 'multer';
import { BadRequestException } from '@nestjs/common';

const AVATAR_FILE_FIELD = 'avatarUrl';

type MulterCallback = (error: Error | null, acceptFile: boolean) => void;
type DestinationCallback = (error: Error | null, destination: string) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;
type MulterFileLike = {
  originalname?: string;
  mimetype?: string;
  fieldname?: string;
};

function ensureAvatarDir() {
  const dir = join(process.cwd(), 'uploads', 'avatars');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export const avatarMulterOptions = {
  storage: (
    diskStorage as unknown as (opts: {
      destination: (
        req: unknown,
        file: MulterFileLike,
        cb: DestinationCallback,
      ) => void;
      filename: (
        req: unknown,
        file: MulterFileLike,
        cb: FilenameCallback,
      ) => void;
    }) => StorageEngine
  )({
    destination: (
      _req: unknown,
      _file: MulterFileLike,
      cb: DestinationCallback,
    ) => {
      cb(null, ensureAvatarDir());
    },
    filename: (_req: unknown, file: MulterFileLike, cb: FilenameCallback) => {
      const ext = extname(file.originalname || '').toLowerCase() || '.png';
      const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)
        ? ext
        : '.png';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  }),
  fileFilter: (_req: unknown, file: MulterFileLike, cb: MulterCallback) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (file.mimetype && allowed.includes(file.mimetype)) return cb(null, true);
    return cb(
      new BadRequestException('Arquivo inválido. Envie PNG, JPG/JPEG ou WEBP.'),
      false,
    );
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};

// Versão tolerante: aceita qualquer campo de arquivo, mas só processa/salva o arquivo cujo fieldname seja "avatarUrl".
// Isso evita "Unexpected field" quando o cliente envia outros campos de arquivo por engano.
export const avatarUrlAnyFilesMulterOptions = {
  ...avatarMulterOptions,
  fileFilter: (req: unknown, file: MulterFileLike, cb: MulterCallback) => {
    if (file.fieldname && file.fieldname !== AVATAR_FILE_FIELD)
      return cb(null, false);
    return avatarMulterOptions.fileFilter(req, file, cb);
  },
};

// Back-compat (caso algum lugar ainda importe o nome antigo)
export const avatarAnyFilesMulterOptions = avatarUrlAnyFilesMulterOptions;
