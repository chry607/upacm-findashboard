import Link from "next/link";

interface Project {
  id: string;
  name: string;
  total_expenses: number;
}

interface TopProjectsListProps {
  projects: Project[];
}

export function TopProjectsList({ projects }: TopProjectsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No projects found
      </div>
    );
  }

  const maxExpense = Math.max(...projects.map((p) => p.total_expenses));

  return (
    <div className="space-y-4">
      {projects.map((project, index) => {
        const percentage = (project.total_expenses / maxExpense) * 100;

        return (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="block group"
          >
            <div className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium truncate group-hover:underline">
                    {project.name}
                  </p>
                  <p className="text-sm font-bold text-red-600 shrink-0 ml-2">
                    {formatCurrency(project.total_expenses)}
                  </p>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}