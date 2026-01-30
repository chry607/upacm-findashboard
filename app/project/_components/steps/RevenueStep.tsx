import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectFormData } from "../../../../interfaces/projectSchema";

export default function RevenueStep({
  form,
}: {
  form: UseFormReturn<ProjectFormData>;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "revenue",
  });

  const formatDate = (d: Date | string) =>
    new Date(d).toISOString().split("T")[0];

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-gray-700 dark:text-gray-200 font-semibold">
            <th>Name</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Mode of Payment</th>
            <th>Received Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => (
            <tr key={field.id} className="border-b border-gray-200 dark:border-gray-700">
              <td className="p-2">
                <Input {...form.register(`revenue.${i}.name`)} placeholder="Name" />
              </td>
              <td className="p-2">
                <Input {...form.register(`revenue.${i}.desc`)} placeholder="Description" />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  {...form.register(`revenue.${i}.amount`, { valueAsNumber: true })}
                  placeholder="Amount"
                />
              </td>
              <td className="p-2">
                <Input {...form.register(`revenue.${i}.mode_of_payment`)} placeholder="Mode of Payment" />
              </td>
              <td className="p-2">
                <Input
                  type="date"
                  {...form.register(`revenue.${i}.date`, {
                    valueAsDate: true,
                    setValueAs: (v) => new Date(v),
                  })}
                  defaultValue={formatDate(form.getValues(`revenue.${i}.date`) || new Date())}
                />
              </td>
              <td className="p-2 text-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-8 h-8 p-0 text-lg flex items-center justify-center bg-black"
                  onClick={() => remove(i)}
                >
                  ×
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <Button
          type="button"
          onClick={() =>
            append({
              name: "",
              desc: "",
              amount: 0,
              mode_of_payment: "",
              date: new Date(),
            })
          }
        >
          Add Revenue
        </Button>
      </div>
    </div>
  );
}
