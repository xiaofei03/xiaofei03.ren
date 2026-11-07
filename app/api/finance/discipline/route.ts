import { readJson } from "@/server/request-body";
import { financeError, financeJson, readDiscipline, saveDiscipline } from "@/server/finance";
import { requireSession } from "@/server/security";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { requireSession(request); return financeJson({ discipline: readDiscipline() }); }
  catch (error) { return financeError(error); }
}
export async function PUT(request: Request) {
  try { requireSession(request, true); return financeJson({ discipline: saveDiscipline(await readJson(request, 16_000)) }); }
  catch (error) { return financeError(error); }
}
