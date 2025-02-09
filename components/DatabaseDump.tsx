"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, Table } from "lucide-react"

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dbType, host, port, username, password, database }),
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dbType, host, port, username, password, database }),
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
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={handleDumpDatabase}
                    disabled={isDumpLoading}
                    className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center p-6 rounded-xl shadow-lg"
                >
                    {isDumpLoading ? (
                        <span className="flex items-center">
              <Database className="animate-pulse mr-2 h-6 w-6" />
              Backing up...
            </span>
                    ) : (
                        <>
                            <Database className="mr-2 h-6 w-6" />
                            <span className="text-lg font-semibold">Backup Database</span>
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleBackupData}
                    disabled={isBackupLoading}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center p-6 rounded-xl shadow-lg"
                >
                    {isBackupLoading ? (
                        <span className="flex items-center">
              <Table className="animate-pulse mr-2 h-6 w-6" />
              Backing up...
            </span>
                    ) : (
                        <>
                            <Table className="mr-2 h-6 w-6" />
                            <span className="text-lg font-semibold">Backup Data</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

