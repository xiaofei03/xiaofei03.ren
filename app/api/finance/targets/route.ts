import { readJson } from "@/server/request-body";
import { financeError, financeJson, saveTargets } from "@/server/finance";
import { requireSession } from "@/server/security";
export const dynamic = "force-dynamic";
export async function PUT(request: Request) {
  try { requireSession(request, true); return financeJson({ targets: saveTargets(await readJson(request, 4_000)) }); }
  catch (error) { return financeError(error); }
}
