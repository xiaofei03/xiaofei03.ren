import { readOverview, financeError, financeJson } from "@/server/finance";
import { requireSession } from "@/server/security";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { requireSession(request); return financeJson(readOverview()); }
  catch (error) { return financeError(error); }
}
