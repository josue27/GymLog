import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { prisma } from './prisma';
import { encrypt, decrypt } from './encryption';
import type { DriveTokens, WorkoutSession, ExerciseTemplate } from '@/types';

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/drive/callback';

function getOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
}

export async function exchangeCode(code: string): Promise<DriveTokens> {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens as DriveTokens;
}

export async function saveTokens(userId: string, tokens: DriveTokens): Promise<void> {
  const encrypted = encrypt(JSON.stringify(tokens));
  await prisma.user.update({
    where: { id: userId },
    data: { googleTokens: encrypted },
  });
}

export async function getTokens(userId: string): Promise<DriveTokens | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.googleTokens) return null;
  return JSON.parse(decrypt(user.googleTokens));
}

export async function getAuthClient(userId: string): Promise<OAuth2Client> {
  const tokens = await getTokens(userId);
  if (!tokens) throw new Error('Google Drive no conectado');

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  // Refresh if expired
  if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await saveTokens(userId, credentials as DriveTokens);
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

const GYMLOG_FOLDER_NAME = 'GymLog';

async function getOrCreateFolder(auth: OAuth2Client): Promise<string> {
  const drive = google.drive({ version: 'v3', auth });

  // Search for existing GymLog folder
  const search = await drive.files.list({
    q: `name='${GYMLOG_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    pageSize: 1,
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  // Create folder
  const folder = await drive.files.create({
    requestBody: {
      name: GYMLOG_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return folder.data.id!;
}

export async function saveSession(
  userId: string,
  date: string,
  session: WorkoutSession
): Promise<string> {
  const auth = await getAuthClient(userId);
  const drive = google.drive({ version: 'v3', auth });
  const folderId = await getOrCreateFolder(auth);

  const fileName = `gymlog_${date}.json`;
  const fileContent = JSON.stringify(session, null, 2);

  // Check if file already exists
  const existing = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });

  if (existing.data.files && existing.data.files.length > 0) {
    await drive.files.update({
      fileId: existing.data.files[0].id!,
      media: {
        mimeType: 'application/json',
        body: fileContent,
      },
    });
    return existing.data.files[0].id!;
  }

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: 'application/json',
      body: fileContent,
    },
    fields: 'id',
  });

  return file.data.id!;
}

export async function listSessions(userId: string): Promise<{ id: string; name: string; createdTime: string }[]> {
  const auth = await getAuthClient(userId);
  const drive = google.drive({ version: 'v3', auth });
  const folderId = await getOrCreateFolder(auth);

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });

  return (res.data.files || []).map(f => ({
    id: f.id!,
    name: f.name!,
    createdTime: f.createdTime!,
  }));
}

export async function loadSession(
  userId: string,
  fileId: string
): Promise<WorkoutSession> {
  const auth = await getAuthClient(userId);
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'json' }
  );

  return res.data as unknown as WorkoutSession;
}

async function saveConfigFile(auth: OAuth2Client, folderId: string, fileName: string, content: string): Promise<void> {
  const drive = google.drive({ version: 'v3', auth });

  const existing = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });

  if (existing.data.files && existing.data.files.length > 0) {
    await drive.files.update({
      fileId: existing.data.files[0].id!,
      media: { mimeType: 'application/json', body: content },
    });
  } else {
    await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: { mimeType: 'application/json', body: content },
    });
  }
}

async function loadConfigFile(auth: OAuth2Client, folderId: string, fileName: string): Promise<string | null> {
  const drive = google.drive({ version: 'v3', auth });

  const existing = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });

  if (!existing.data.files || existing.data.files.length === 0) {
    return null;
  }

  const res = await drive.files.get(
    { fileId: existing.data.files[0].id!, alt: 'media' },
    { responseType: 'json' }
  );

  return JSON.stringify(res.data);
}

export async function saveDaysList(userId: string, days: string[]): Promise<void> {
  const auth = await getAuthClient(userId);
  const folderId = await getOrCreateFolder(auth);
  await saveConfigFile(auth, folderId, 'gymlog_config_days.json', JSON.stringify(days));
}

export async function loadDaysList(userId: string): Promise<string[]> {
  const auth = await getAuthClient(userId);
  const folderId = await getOrCreateFolder(auth);
  const data = await loadConfigFile(auth, folderId, 'gymlog_config_days.json');
  return data ? JSON.parse(data) : [];
}

export async function saveTemplates(
  userId: string,
  templates: Record<string, ExerciseTemplate[]>
): Promise<void> {
  const auth = await getAuthClient(userId);
  const folderId = await getOrCreateFolder(auth);
  await saveConfigFile(auth, folderId, 'gymlog_config_templates.json', JSON.stringify(templates));
}

export async function loadTemplates(
  userId: string
): Promise<Record<string, ExerciseTemplate[]>> {
  const auth = await getAuthClient(userId);
  const folderId = await getOrCreateFolder(auth);
  const data = await loadConfigFile(auth, folderId, 'gymlog_config_templates.json');
  return data ? JSON.parse(data) : {};
}
