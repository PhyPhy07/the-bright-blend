import { NextRequest, NextResponse } from "next/server";
import { geocode } from "@/lib/utils/geocode";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q?.trim()) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const result = await geocode(q);
  if (!result) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
