import { requireOriginOrFail } from "@/lib/api";
import { destroySession } from "@/lib/auth";

export async function POST(request: Request) {
  const error = requireOriginOrFail(request);
  if (error) return error;
  await destroySession();
  return Response.json({ ok: true });
}
