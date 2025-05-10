import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "/@/components/ui/checkbox"

export function generateColumns<T extends object>(fields: string[]): ColumnDef<T>[] {
  const selectionColumn: ColumnDef<T> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const fieldColumns: ColumnDef<T>[] = fields.map((field) => ({
    accessorKey: field,
    header: field.charAt(0).toUpperCase() + field.slice(1),
  }));

  return [selectionColumn, ...fieldColumns];
}