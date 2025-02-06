"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

interface DatabaseDumpProps {
    dbType: string
    host: string
    port: string
    username: string
    password: string
    database: string
}

export const DatabaseDump: React.FC<DatabaseDumpProps> = ({ dbType, host, port, username, password, database }) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleDumpDatabase = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/database-dump", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dbType,
                    host,
                    port,
                    username,
                    password,
                    database,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to dump database")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.style.display = "none"
            a.href = url
            a.download = `${database}_dump.sql`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error("Error dumping database:", error)

        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-purple-600 dark:text-purple-400">Database Backup</CardTitle>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={handleDumpDatabase}
                    disabled={isLoading}
                    className="w-full bg-purple-500 text-white hover:bg-purple-600 flex items-center justify-center"
                >
                    {isLoading ? (
                        "Creating Backup..."
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Database Dump
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

