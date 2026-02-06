"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { projectSchema, ProjectFormData, ProjectFormInput } from "@/interfaces/projectSchema";
import { createFullProject } from "@/lib/db/create-project.server";

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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";

type AlertState = {
  type: "error" | "success" | null;
  message: string;
  visible: boolean;
};

interface CreateProjectDrawerProps {
  trigger?: React.ReactNode;
}

export default function CreateProjectDrawer({ trigger }: CreateProjectDrawerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ type: null, message: "", visible: false });

  // Use ProjectFormInput for the form type, cast the resolver to avoid type mismatch
  const form = useForm<ProjectFormInput>({
    resolver: zodResolver(projectSchema) as Resolver<ProjectFormInput>,
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

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        desc: "",
        implementation_date: new Date(),
        submission_date: new Date(),
        status: "pending",
        expenses: [],
        revenue: [],
      });
      setStep(0);
    }
  }, [open, form]);

  const handleNext = async () => {
    if (step === 0) {
      const projectFields = ["name", "desc", "implementation_date", "status"] as const;
      const isValid = await form.trigger(projectFields);

      const values = form.getValues();
      const implDate = values.implementation_date;
      const subDate = values.submission_date;

      const isImplDateValid = implDate instanceof Date && !isNaN(implDate.getTime());
      const isSubDateValid = subDate instanceof Date && !isNaN(subDate.getTime());

      // Check if implementation date was actually selected (dirty field)
      const isImplDateDirty = form.formState.dirtyFields.implementation_date;

      if (!isValid || !isImplDateDirty || !isImplDateValid || !isSubDateValid) {
        if (!isImplDateDirty || !isImplDateValid) {
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

  // Submit handler - use form.handleSubmit to get parsed data
  const onSubmit = async (data: ProjectFormInput) => {
    try {
      setLoading(true);
      // Cast to ProjectFormData since Zod will have parsed the dates
      const projectId = await createFullProject(data as unknown as ProjectFormData);

      showAlert("success", "Project created successfully!");

      setTimeout(() => {
        setOpen(false);
        router.push(`/project/${projectId}`);
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);

      let errorMessage = "Failed to create project. Please try again.";

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const stepComponents = [
    <ProjectStep key="project" form={form as any} isEdit={false} />,
    <ExpensesStep key="expenses" form={form as any} />,
    <RevenueStep key="revenue" form={form as any} />,
  ];

  const defaultTrigger = (
    <Button className="hover:cursor-pointer">
      <Plus className="h-4 w-4 mr-2" />
      New Project
    </Button>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || defaultTrigger}
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
            <DrawerTitle className="text-2xl">Create New Project</DrawerTitle>
            <DrawerDescription>
              Step {step + 1} of {steps.length}: {steps[step].title}
            </DrawerDescription>
          </DrawerHeader>

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
                // IMPORTANT: use form.handleSubmit so resolver runs and returns parsed ProjectFormData
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              )}
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}