import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

const AVATAR_FILE_FIELD = 'avatarUrl';

function ensureAvatarDir() {
  const dir = join(process.cwd(), 'uploads', 'avatars');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export const avatarMulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, ensureAvatarDir());
    },
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname || '').toLowerCase() || '.png';
      const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)
        ? ext
        : '.png';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  }),
  fileFilter: (_req: unknown, file: { mimetype?: string }, cb: (error: Error | null, acceptFile: boolean) => void) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (file.mimetype && allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new BadRequestException('Arquivo inválido. Envie PNG, JPG/JPEG ou WEBP.'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};

// Versão tolerante: aceita qualquer campo de arquivo, mas só processa/salva o arquivo cujo fieldname seja "avatarUrl".
// Isso evita "Unexpected field" quando o cliente envia outros campos de arquivo por engano.
export const avatarUrlAnyFilesMulterOptions = {
  ...avatarMulterOptions,
  fileFilter: (
    req: unknown,
    file: { mimetype?: string; fieldname?: string },
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.fieldname && file.fieldname !== AVATAR_FILE_FIELD) return cb(null, false);
    return avatarMulterOptions.fileFilter(req, file, cb);
  },
};

// Back-compat (caso algum lugar ainda importe o nome antigo)
export const avatarAnyFilesMulterOptions = avatarUrlAnyFilesMulterOptions;
