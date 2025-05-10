import { ColumnDef } from "@tanstack/react-table"

export function generateColumns<T>(fields: string[]): ColumnDef<T>[] {
  return fields.map((field) => ({
    accessorKey: field,
    header: field.charAt(0).toUpperCase() + field.slice(1),
  }))
}