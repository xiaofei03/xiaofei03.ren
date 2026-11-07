import { readJson } from "@/server/request-body";
import { financeError, financeJson, syncAccounts } from "@/server/finance";
import { requireSession } from "@/server/security";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    requireSession(request, true);
    const body = await readJson(request, 4_000);
    const provider = typeof body.provider === "string" ? body.provider : undefined;
    return financeJson(syncAccounts(provider));
  } catch (error) { return financeError(error); }
}
