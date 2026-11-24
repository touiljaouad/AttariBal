import { queryProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const filters = Object.fromEntries(params.entries());
  const result = await queryProducts(filters);
  return Response.json(result);
}
