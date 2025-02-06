"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "./Pagination"
import { Input } from "@/components/ui/input"

interface QueryResultTableProps {
    result: any
}

export const QueryResultTable: React.FC<QueryResultTableProps> = ({ result }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    if (!result || !result.rows || result.rows.length === 0) {
        return <p className="text-sm text-gray-500">No data to display</p>
    }

    const columns = Object.keys(result.rows[0])
    const totalPages = Math.ceil(result.rows.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentRows = result.rows.slice(startIndex, endIndex)

    return (
        <div>
            <div className="mb-4 flex items-center">
                <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600 dark:text-gray-300">
                    Items per page:
                </label>
                <Input
                    id="itemsPerPage"
                    type="number"
                    min="1"
                    max={result.rows.length}
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="w-20"
                />
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column}>{column}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentRows.map((row: any, index: number) => (
                            <TableRow key={index}>
                                {columns.map((column) => (
                                    <TableCell key={`${index}-${column}`}>
                                        {typeof row[column] === "object" ? JSON.stringify(row[column]) : row[column]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    )
}

