"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { batchUpdateProjectStatus } from "@/lib/db/change-projectStatus.server";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Project {
  id: string;
  name: string;
  implementation_date: Date;
  submission_date: Date;
  status: string;
}

interface StatusTableProps {
  initialProjects: Project[];
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function StatusTable({ initialProjects }: StatusTableProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [changedProjects, setChangedProjects] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, status: newStatus } : project
      )
    );
    setChangedProjects((prev) => new Set(prev).add(projectId));
    setSaveMessage(null);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const updates = projects
          .filter((project) => changedProjects.has(project.id))
          .map((project) => ({ projectId: project.id, status: project.status }));

        await batchUpdateProjectStatus(updates);
        
        setChangedProjects(new Set());
        setSaveMessage({ type: "success", message: `Successfully updated ${updates.length} project(s)` });
        
        setTimeout(() => setSaveMessage(null), 5000);
      } catch {
        setSaveMessage({ type: "error", message: "Failed to save changes. Please try again." });
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {saveMessage && (
        <Alert variant={saveMessage.type === "error" ? "destructive" : "default"}>
          {saveMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{saveMessage.message}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Implementation Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{formatDate(project.submission_date)}</TableCell>
                  <TableCell>{formatDate(project.implementation_date)}</TableCell>
                  <TableCell>
                    <Select
                      value={project.status}
                      onValueChange={(value) => handleStatusChange(project.id, value)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-3 items-center">
        {changedProjects.size > 0 && (
          <span className="text-sm text-muted-foreground">
            {changedProjects.size} change{changedProjects.size !== 1 ? "s" : ""} pending
          </span>
        )}
        <Button
          onClick={handleSave}
          disabled={changedProjects.size === 0 || isPending}
          size="lg"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
