import { getApiDocs } from "@/src/lib/swagger";

export async function GET() {
  const spec = getApiDocs();

  return Response.json(spec);
}