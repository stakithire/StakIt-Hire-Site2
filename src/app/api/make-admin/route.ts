import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  const uid = "TdlmOovYUcMes6j6bjuP4Crpz8Y2";

  await adminAuth.setCustomUserClaims(uid, { admin: true });

  return new Response("Admin set");
}