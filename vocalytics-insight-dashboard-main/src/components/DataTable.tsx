import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataColumn = {
  key: string;
  header: string;
  render?: (row: Record<string, any>) => React.ReactNode;
  style?: React.CSSProperties;       // ✅ Optional inline style (e.g., width)
  className?: string;                // ✅ Optional Tailwind or CSS class
};

interface DataTableProps {
  title: string;
  columns: DataColumn[];
  data: Record<string, any>[];
  className?: string;
}

export function DataTable({ title, columns, data, className }: DataTableProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    style={column.style}
                    className={column.className}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        style={column.style}
                        className={column.className}
                      >
                        {column.render ? column.render(row) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
