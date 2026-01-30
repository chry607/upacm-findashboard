import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ProjectFormData } from "../../../../interfaces/projectSchema";

interface ProjectStepProps {
  form: UseFormReturn<ProjectFormData>;
  isEdit?: boolean;
}

export default function ProjectStep({ form, isEdit = false }: ProjectStepProps) {
  // Convert Date objects to YYYY-MM-DD for input
  const formatDate = (d: Date | null | undefined) => {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) {
      return "";
    }
    return d.toISOString().split("T")[0];
  };

  // Watch the date values to make them reactive
  const implementationDate = form.watch("implementation_date");

  // For create mode, only show value if user has touched the field
  const implementationDateTouched = form.formState.dirtyFields.implementation_date;

  // Determine the value to show:
  // - Edit mode: always show the date
  // - Create mode: only show if user has selected a date
  const dateValue = isEdit || implementationDateTouched 
    ? formatDate(implementationDate) 
    : "";

  return (
    <div className="space-y-4">
      {/* Project Name + Implementation Date */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
            Project Name
          </label>
          <Input placeholder="Project Name" {...form.register("name")} />
        </div>

        <div className="w-full md:w-1/3">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
            Implementation Date
          </label>
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : new Date();
              form.setValue("implementation_date", date, { 
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
          Description
        </label>
        <Input placeholder="Description" {...form.register("desc")} />
      </div>

      {/* Status */}
      <input type="hidden" value="pending" {...form.register("status")} />
    </div>
  );
}
