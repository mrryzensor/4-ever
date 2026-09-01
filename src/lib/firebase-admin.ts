import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let app: App | null = null;
let auth: Auth | null = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  let projectId = 'gen-lang-client-0458948879';
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.projectId) {
      projectId = parsed.projectId;
    }
  }

  if (!getApps().length) {
    app = initializeApp({
      projectId,
    });
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
} catch (err) {
  console.warn('Firebase Admin safe initialization warning:', err);
}

export const adminAuth = auth;

