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
    const [isDumpLoading, setIsDumpLoading] = useState(false)
    const [isBackupLoading, setIsBackupLoading] = useState(false)

    const handleDumpDatabase = async () => {
        setIsDumpLoading(true)
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
            setIsDumpLoading(false)
        }
    }

    const handleBackupData = async () => {
        setIsBackupLoading(true)
        try {
            const response = await fetch("/api/data-dump", {
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
                throw new Error(errorData.error || "Failed to backup data")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.style.display = "none"
            a.href = url
            a.download = `${database}_backup.sql`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error("Error backing up data:", error)
        } finally {
            setIsBackupLoading(false)
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
                    disabled={isDumpLoading}
                    className="w-full bg-purple-500 text-white hover:bg-purple-600 flex items-center justify-center mb-2"
                >
                    {isDumpLoading ? (
                        "Creating Backup..."
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Backup Database
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleBackupData}
                    disabled={isBackupLoading}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
                >
                    {isBackupLoading ? (
                        "Backing up Data..."
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Backup Data
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
