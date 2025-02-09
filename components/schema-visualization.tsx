"use client"

import { motion } from "framer-motion"

interface ColumnInfo {
    column_name: string
    data_type: string
}

interface TableInfo {
    table_name: string
    columns: ColumnInfo[]
}

interface SchemaVisualizationProps {
    tables: TableInfo[]
}

export function SchemaVisualization({ tables }: SchemaVisualizationProps) {
    return (
        <div className="flex flex-wrap gap-4 p-4">
            {tables.map((table) => (
                <motion.div
                    key={table.table_name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg shadow-sm bg-white dark:bg-gray-800"
                >
                    <div className="border-b p-3">
                        <h3 className="font-medium text-sm">{table.table_name}</h3>
                    </div>
                    <div className="p-3">
                        <div className="space-y-2">
                            {table.columns.map((column) => (
                                <div key={column.column_name} className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">{column.column_name}</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-8">{column.data_type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

