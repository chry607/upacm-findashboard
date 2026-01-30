import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectFormData } from "../../../../interfaces/projectSchema";

export default function ExpensesStep({
  form,
}: {
  form: UseFormReturn<ProjectFormData>;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "expenses",
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-gray-700 dark:text-gray-200 font-semibold">
            <th>Name</th>
            <th>Description</th>
            <th>Store Name</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Mode of Payment</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => (
            <tr key={field.id} className="border-b border-gray-200 dark:border-gray-700">
              <td className="p-2">
                <Input {...form.register(`expenses.${i}.name`)} placeholder="Name" />
              </td>
              <td className="p-2">
                <Input {...form.register(`expenses.${i}.desc`)} placeholder="Description" />
              </td>
              <td className="p-2">
                <Input {...form.register(`expenses.${i}.store_name`)} placeholder="Store Name" />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  {...form.register(`expenses.${i}.unit_price`, { valueAsNumber: true })}
                  placeholder="Unit Price"
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  {...form.register(`expenses.${i}.quantity`, { valueAsNumber: true })}
                  placeholder="Quantity"
                />
              </td>
              <td className="p-2">
                <Input {...form.register(`expenses.${i}.mode_of_payment`)} placeholder="Mode of Payment" />
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
              store_name: "",
              unit_price: 0,
              quantity: 0,
              mode_of_payment: "",
            })
          }
        >
          Add Expense
        </Button>
      </div>
    </div>
  );
}
