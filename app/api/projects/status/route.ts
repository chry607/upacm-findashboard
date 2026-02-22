import { auth } from "@/lib/auth/server";
import { batchUpdateProjectStatus } from "@/lib/db/change-projectStatus.server";
import { revalidatePath } from "next/cache";

interface StatusUpdate {
  projectId: string;
  status: string;
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return Response.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { updates?: StatusUpdate[] };
    const updates = Array.isArray(body?.updates) ? body.updates : [];

    if (updates.length === 0) {
      return Response.json({ error: "No updates provided" }, { status: 400 });
    }

    await batchUpdateProjectStatus(updates);

    // Revalidate affected pages on Vercel
    revalidatePath("/status");
    revalidatePath("/project");
    revalidatePath("/");

    return Response.json({ updated: updates.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
