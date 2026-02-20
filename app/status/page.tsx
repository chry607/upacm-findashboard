
import { redirect } from "next/navigation";
import { getAllProjects } from "@/lib/db/change-projectStatus.server";
import { auth } from "@/lib/auth/server";
import { StatusTable } from "./_components/status-table";

export const dynamic = "force-dynamic";

export default async function Status() {
  const { data: session } = await auth.getSession();
  const isAnonymous = Boolean(
    session?.user && "isAnonymous" in session.user && session.user.isAnonymous
  );

  if (!session?.user || isAnonymous) {
    redirect("/auth/sign-in");
  }

  const projects = await getAllProjects();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Status Management</h1>
      </div>
      <StatusTable initialProjects={projects} />
    </div>
  );
}
