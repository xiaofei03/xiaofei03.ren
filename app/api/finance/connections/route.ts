import { readJson } from "@/server/request-body";
import { financeError, financeJson, saveConnection } from "@/server/finance";
import { requireSession } from "@/server/security";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try { requireSession(request, true); saveConnection(await readJson(request, 16_000)); return financeJson({ ok: true }); }
  catch (error) { return financeError(error); }
}
