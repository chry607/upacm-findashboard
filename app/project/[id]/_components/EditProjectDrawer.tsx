"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { projectSchema, ProjectFormData } from "@/interfaces/projectSchema";
import { getProjectForEdit, updateFullProject } from "@/lib/db/edit-project.server";
import { deleteProject } from "@/lib/db/delete-project.server";

import ExpensesStep from "@/app/project/_components/steps/ExpensesStep";
import RevenueStep from "@/app/project/_components/steps/RevenueStep";
import ProjectStep from "@/app/project/_components/steps/ProjectStep";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Pencil, Trash2 } from "lucide-react";

type AlertState = {
  type: "error" | "success" | null;
  message: string;
  visible: boolean;
};

interface EditProjectDrawerProps {
  projectId: string;
}

export default function EditProjectDrawer({ projectId }: EditProjectDrawerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "", visible: false });

  const form = useForm<ProjectFormData, ProjectFormData, ProjectFormData>({
    resolver: zodResolver(projectSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      desc: "",
      implementation_date: new Date(),
      submission_date: new Date(),
      status: "pending",
      expenses: [],
      revenue: [],
    },
  });

  const steps = [
    { title: "Project", fields: ["name", "desc", "implementation_date", "status"] },
    { title: "Expenses", fields: ["expenses"] },
    { title: "Revenue", fields: ["revenue"] },
  ];

  const clearAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }));
    setTimeout(() => {
      setAlert({ type: null, message: "", visible: false });
    }, 300);
  }, []);

  const showAlert = useCallback((type: "error" | "success", message: string) => {
    setAlert({ type, message, visible: false });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAlert({ type, message, visible: true });
      });
    });
  }, []);

  // Auto-dismiss alerts after 3 seconds
  useEffect(() => {
    if (alert.type && alert.visible) {
      const timer = setTimeout(() => {
        clearAlert();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.type, alert.visible, clearAlert]);

  // Load project data when drawer opens
  useEffect(() => {
    if (open) {
      const loadProject = async () => {
        setInitialLoading(true);
        try {
          const projectData = await getProjectForEdit(projectId);
          if (projectData) {
            const implDate = projectData.implementation_date instanceof Date 
              ? projectData.implementation_date 
              : new Date(projectData.implementation_date);
            
            const subDate = projectData.submission_date instanceof Date 
              ? projectData.submission_date 
              : new Date(projectData.submission_date);

            form.reset({
              name: projectData.name,
              desc: projectData.desc ?? "",
              implementation_date: isNaN(implDate.getTime()) ? new Date() : implDate,
              submission_date: isNaN(subDate.getTime()) ? new Date() : subDate,
              status: projectData.status,
              expenses: projectData.expenses.map((expense: any) => ({
                ...expense,
                date: expense.date instanceof Date ? expense.date : new Date(expense.date),
              })),
              revenue: projectData.revenue.map((rev: any) => ({
                ...rev,
                date: rev.date instanceof Date ? rev.date : new Date(rev.date),
              })),
            });

            setTimeout(() => {
              form.setValue("implementation_date", isNaN(implDate.getTime()) ? new Date() : implDate);
              form.setValue("submission_date", isNaN(subDate.getTime()) ? new Date() : subDate);
            }, 0);
          }
        } catch (error) {
          console.error("Failed to load project:", error);
          showAlert("error", "Failed to load project data.");
        } finally {
          setInitialLoading(false);
        }
      };
      loadProject();
      setStep(0);
    }
  }, [open, projectId, form, showAlert]);

  const handleNext = async () => {
    if (step === 0) {
      const projectFields = ["name", "desc", "implementation_date", "status"] as (keyof ProjectFormData)[];
      const isValid = await form.trigger(projectFields);

      const values = form.getValues();
      const implDate = values.implementation_date;
      const subDate = values.submission_date;

      const isImplDateValid = implDate instanceof Date && !isNaN(implDate.getTime());
      const isSubDateValid = subDate instanceof Date && !isNaN(subDate.getTime());

      if (!isValid || !isImplDateValid || !isSubDateValid) {
        if (!isImplDateValid || !isSubDateValid) {
          form.setError("implementation_date", {
            type: "manual",
            message: "Please select a valid date",
          });
        }
        showAlert("error", "Please fill in all required project fields before proceeding.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    const projectFields = ["name", "desc", "implementation_date", "status"] as (keyof ProjectFormData)[];
    const isValid = await form.trigger(projectFields);
    if (!isValid) {
      showAlert("error", "Please fill in all required project fields.");
      setStep(0);
      return;
    }

    try {
      setLoading(true);
      const data = form.getValues();
      await updateFullProject(projectId, data);

      showAlert("success", "Project updated successfully!");

      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);

      let errorMessage = "Failed to update project. Please try again.";

      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();

        if (errorMsg.includes("fetch failed") || errorMsg.includes("network") || errorMsg.includes("connecting to database")) {
          errorMessage = "Unable to connect to the database. Please check your internet connection.";
        } else if (errorMsg.includes("timeout")) {
          errorMessage = "Connection timed out. Please try again later.";
        } else if (errorMsg.includes("unauthorized") || errorMsg.includes("authentication")) {
          errorMessage = "Database authentication failed. Please contact support.";
        } else if (errorMsg.includes("duplicate") || errorMsg.includes("unique")) {
          errorMessage = "A project with this name already exists.";
        } else if (errorMsg.includes("validation")) {
          errorMessage = "Invalid data provided. Please check your inputs.";
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }

      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteProject(projectId);

      showAlert("success", "Project deleted successfully!");

      setTimeout(() => {
        setOpen(false);
        router.push("/project");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);

      let errorMessage = "Failed to delete project. Please try again.";

      if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      }

      showAlert("error", errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const stepComponents = [
    <ProjectStep key="project" form={form} isEdit={true} />,
    <ExpensesStep key="expenses" form={form} />,
    <RevenueStep key="revenue" form={form} />,
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="hover:cursor-pointer">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Project
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        {/* Fixed Alert at Top Right */}
        {alert.type && (
          <div
            onClick={clearAlert}
            className={`fixed top-4 right-4 z-[100] w-80 cursor-pointer transition-all duration-300 ease-in-out ${
              alert.visible
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            <Alert
              variant={alert.type === "error" ? "destructive" : "default"}
              className={`shadow-lg [&>svg]:static [&>svg~*]:pl-0 grid-cols-[auto_1fr] items-start ${
                alert.type === "success"
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : ""
              }`}
            >
              {alert.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <div>
                <AlertTitle>
                  {alert.type === "error" ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        <div className="mx-auto w-full max-w-5xl">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-2xl">Edit Project</DrawerTitle>
                <DrawerDescription>
                  Step {step + 1} of {steps.length}: {steps[step].title}
                </DrawerDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={deleting || loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      project and all associated expenses and revenue records.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete Project"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DrawerHeader>

          {initialLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading project data...</div>
            </div>
          ) : (
            <form onKeyDown={handleKeyDown} onSubmit={(e) => e.preventDefault()}>
              <div className="px-4 pb-4 max-h-[50vh] overflow-y-auto">
                {stepComponents[step]}
              </div>

              <DrawerFooter className="flex flex-row justify-between pt-4">
                <div className="flex gap-2">
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        clearAlert();
                        setStep(step - 1);
                      }}
                    >
                      Back
                    </Button>
                  )}
                </div>
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </DrawerFooter>
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}