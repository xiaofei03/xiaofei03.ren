import { readJson } from "@/server/request-body";
import { financeError, financeJson, setHoldingCategory } from "@/server/finance";
import { requireSession } from "@/server/security";
export const dynamic = "force-dynamic";
export async function PUT(request: Request) {
  try { requireSession(request, true); setHoldingCategory(await readJson(request, 4_000)); return financeJson({ ok: true }); }
  catch (error) { return financeError(error); }
}
