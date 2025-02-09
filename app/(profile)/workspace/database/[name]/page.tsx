"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, User2, Server, Globe, Eye, EyeOff, ArrowLeft, Zap, Key, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useGetDatabaseServicesQuery } from "@/redux/api/projectApi"
import Lottie from "lottie-react"
import LoadingMissile from "@/public/LoadingMissile.json"
import Breadcrumbs from "@/components/Breadcrumb2"
import Loading from "@/components/Loading"
import type { DatabaseDeploymentResponse } from "@/components/profiledashboard/workspace/service/Service"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DatabaseDump } from "@/components/DatabaseDump"
import DatabaseInfoCard from "@/components/DatabaseInfoCard"
import { CopyButton } from "@/components/CopyButton"
import { QueryResultTable } from "@/components/QueryResultTable"
import { DatabaseFlow } from "@/components/database-flow"

interface DatabaseDetailProps {
    params: Promise<{
        name: string
    }>
}

interface RowData {
    [key: string]: string | number | boolean | object | null;
}


interface Column {
    column_name: string;
    data_type: string;
    is_foreign_key: boolean;
}

interface TableSchema {
    table_name: string;
    columns: Column[];
}

interface QueryResult {
    schema: TableSchema[];
    rows: RowData[];
}

export default function DatabaseDetail({ params }: DatabaseDetailProps) {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [queryType, setQueryType] = useState("select")
    const [tableName, setTableName] = useState("")
    const [columnDefinitions, setColumnDefinitions] = useState("")
    const [whereClause, setWhereClause] = useState("")
    const [insertValues, setInsertValues] = useState("")
    const [updateValues, setUpdateValues] = useState("")
    const [customQuery, setCustomQuery] = useState("")
    const [customQueryInput, setCustomQueryInput] = useState("")
    const [result, setResult] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [queryResult, setQueryResult] = useState<QueryResult | undefined>(undefined);
    const [isGenerating, setIsGenerating] = useState(false)
    const [hasError, setHasError] = useState(false)

    // Unwrap the params Promise using React.use()
    const { name } = React.use(params)

    // Get the workspace name from localStorage
    const selectedWorkspace = typeof window !== "undefined" ? localStorage.getItem("selectedWorkspace") || "" : ""

    const { data: databaseData, isLoading: isDatabaseLoading } = useGetDatabaseServicesQuery({
        workspaceName: selectedWorkspace,
        size: 50,
        page: 0,
    }) as unknown as { data: DatabaseDeploymentResponse; isLoading: boolean }

    if (isDatabaseLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Lottie animationData={LoadingMissile} loop={true} style={{ width: 64, height: 64 }} />
                    <Loading />
                </div>
            </div>
        )
    }

    console.log("queryResult", queryResult);

    const database = databaseData?.results.find((db: { dbName: string }) => db.dbName === name)

    if (!database) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Database not found</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The database &quot;{name}&quot; does not exist.</p>
                <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </Button>
            </div>
        )
    }

    const connectionString = `${database.subdomain}.database.cloudinator.cloud:${database.port}`

    const testConnection = async () => {
        setIsLoading(true)
        setResult("Testing connection...")
        setQueryResult(undefined)

        const requestData = {
            dbType: database.dbType,
            host: `${database.subdomain}.database.cloudinator.cloud`,
            port: database.port,
            username: database.name,
            password: database.password,
            database: database.dbName,
        }

        try {
            const res = await fetch("/api/test-connection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            })

            const data = await res.json()
            if (data.success) {
                setResult("Connection successful!")
                setQueryResult(data)
            } else {
                setResult(`Connection failed: ${data.message}`)
            }
        } catch (error) {
            if (error instanceof Error) {
                setResult(`Error: ${error.message}`)
            } else {
                setResult(`Error: ${String(error)}`)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const buildQuery = () => {
        if (database.dbType === "mongodb") {
            switch (queryType) {
                case "showTables":
                    return JSON.stringify({ operation: "listCollections" })
                case "select":
                    return JSON.stringify({
                        collection: tableName,
                        operation: "find",
                        filter: whereClause ? JSON.parse(whereClause) : {},
                    })
                case "create":
                    return JSON.stringify({
                        operation: "createCollection",
                        name: tableName,
                    })
                case "insert":
                    return JSON.stringify({
                        collection: tableName,
                        operation: "insertOne",
                        document: JSON.parse(insertValues),
                    })
                case "update":
                    return JSON.stringify({
                        collection: tableName,
                        operation: "updateMany",
                        filter: JSON.parse(whereClause),
                        update: { $set: JSON.parse(updateValues) },
                    })
                case "delete":
                    return JSON.stringify({
                        collection: tableName,
                        operation: "deleteMany",
                        filter: JSON.parse(whereClause),
                    })
                case "schema":
                    return JSON.stringify({
                        collection: tableName,
                        operation: "findOne",
                    })
                case "custom":
                    return customQuery
                default:
                    return ""
            }
        } else {
            switch (queryType) {
                case "showTables":
                    return "SHOW TABLES"
                case "select":
                    return `SELECT * FROM ${tableName}${whereClause ? ` WHERE ${whereClause}` : ""}`
                case "create":
                    return `CREATE TABLE ${tableName} (${columnDefinitions})`
                case "insert":
                    return `INSERT INTO ${tableName} VALUES (${insertValues})`
                case "update":
                    return `UPDATE ${tableName} SET ${updateValues}${whereClause ? ` WHERE ${whereClause}` : ""}`
                case "delete":
                    return `DELETE FROM ${tableName}${whereClause ? ` WHERE ${whereClause}` : ""}`
                case "schema":
                    return `DESCRIBE ${tableName}`
                case "custom":
                    return customQuery
                default:
                    return ""
            }
        }
    }

    const testQuery = async () => {
        setIsLoading(true)
        setResult("Running query...")
        setQueryResult(undefined)
        setHasError(false)

        const query = buildQuery()

        const requestData = {
            dbType: database.dbType,
            host: `${database.subdomain}.database.cloudinator.cloud`,
            port: database.port,
            username: database.name,
            password: database.password,
            database: database.dbName,
            query: database.dbType === "mongodb" ? JSON.parse(query) : query,
        }

        try {
            const res = await fetch("/api/test-query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            })

            const data = await res.json()
            setResult(JSON.stringify(data, null, 2))
            setQueryResult(data.result)
            if (data.error) {
                setHasError(true)
            }
        } catch (error) {
            if (error instanceof Error) {
                setResult(`Error: ${error.message}`)
            } else {
                setResult(`Error: ${String(error)}`)
            }
            setHasError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const generateCode = async (command: string, prompt: string) => {
        setIsGenerating(true)
        try {
            let fullPrompt = prompt
            if (command === "/fix") {
                fullPrompt = `The following query may be incorrect: ${customQuery}\nPlease provide a corrected version of the query. ${prompt}`
            }

            const response = await fetch("/api/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: fullPrompt }),
            })

            if (!response.ok) throw new Error("Failed to generate code")

            const data = await response.json()
            const formattedResponse = data.response.replace(/^```sql\n|\n```$/g, "").trim()
            setCustomQueryInput(formattedResponse)
            setCustomQuery(formattedResponse)

            if (command === "/fix") {
                setHasError(false)
            }
        } catch (error) {
            console.error("Error generating code:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            const value = customQueryInput.trim()
            if (value.startsWith("/generate") || value.startsWith("/fix")) {
                const command = value.split(" ")[0]
                const prompt = value.replace(command, "").trim()
                generateCode(command, prompt)
            } else {
                setCustomQuery(value)
            }
        }
    }

    const handleCustomQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setCustomQueryInput(value)
        setCustomQuery(value)
    }

    const renderQueryInputs = () => {
        switch (queryType) {
            case "showTables":
                return null
            case "select":
            case "delete":
            case "schema":
                return (
                    <>
                        <Input
                            placeholder="Table name"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="mb-2"
                        />
                        {queryType === "select" && (
                            <Input
                                placeholder="WHERE clause (optional)"
                                value={whereClause}
                                onChange={(e) => setWhereClause(e.target.value)}
                                className="mb-2"
                            />
                        )}
                    </>
                )
            case "create":
                return (
                    <>
                        <Input
                            placeholder="Table name"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="mb-2"
                        />
                        <Textarea
                            placeholder="Column definitions (e.g., id INT, name VARCHAR(255))"
                            value={columnDefinitions}
                            onChange={(e) => setColumnDefinitions(e.target.value)}
                            className="mb-2"
                        />
                    </>
                )
            case "insert":
                return (
                    <>
                        <Input
                            placeholder="Table name"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="mb-2"
                        />
                        <Textarea
                            placeholder="Values to insert (e.g., 1, 'John Doe')"
                            value={insertValues}
                            onChange={(e) => setInsertValues(e.target.value)}
                            className="mb-2"
                        />
                    </>
                )
            case "update":
                return (
                    <>
                        <Input
                            placeholder="Table name"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="mb-2"
                        />
                        <Input
                            placeholder="SET clause (e.g., name = 'Jane Doe')"
                            value={updateValues}
                            onChange={(e) => setUpdateValues(e.target.value)}
                            className="mb-2"
                        />
                        <Input
                            placeholder="WHERE clause (optional)"
                            value={whereClause}
                            onChange={(e) => setWhereClause(e.target.value)}
                            className="mb-2"
                        />
                    </>
                )
            default:
                return null
        }
    }

    return (
        <div className="px-8 py-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 min-h-screen">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Breadcrumbs />

                <Card className="bg-white/80 dark:bg-gray-800/80 shadow-lg mt-6 border border-gray-200 dark:border-gray-700 backdrop-blur-md">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Database className="w-10 h-10 text-purple-500" />
                                <div>
                                    <CardTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {database.dbName}
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{database.dbType} Database</p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className="bg-green-100 text-green-700 border-green-200 animate-pulse flex items-center gap-1"
                            >
                                <Zap className="w-4 h-4" />
                                Active
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="mt-6 space-y-6">
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="details">Database Details</TabsTrigger>
                                <TabsTrigger value="testing">Database Testing</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Database Information</h3>
                                        <DatabaseDump
                                            dbType={database.dbType}
                                            host={`${database.subdomain}.database.cloudinator.cloud`}
                                            port={database.port}
                                            username={database.name}
                                            password={database.password}
                                            database={database.dbName}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <DatabaseInfoCard icon={Database} title="Database Name" value={database.dbName} />
                                        <DatabaseInfoCard icon={User2} title="Database Username" value={database.name} />
                                        <DatabaseInfoCard icon={Server} title="Port" value={database.port.toString()} />
                                        <DatabaseInfoCard
                                            icon={Globe}
                                            title="Host"
                                            value={`${database.subdomain}.database.cloudinator.cloud`}
                                        />
                                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                            <Card className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Key className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">Password</p>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                                                        {showPassword ? database.password : "••••••••"}
                                                                    </p>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                        className="text-purple-400 hover:text-purple-300"
                                                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                                                    >
                                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <CopyButton text={database.password} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/30">
                                        <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
                                            Connection String
                                        </h3>
                                        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md p-4 rounded-lg border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow flex justify-between items-center">
                                            <code className="text-sm text-gray-800 dark:text-gray-200">{connectionString}</code>
                                            <CopyButton text={connectionString} />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="testing">
                                <div className="space-y-6">
                                    <Tabs defaultValue="connection" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 mb-4">
                                            <TabsTrigger value="connection">Test Connection</TabsTrigger>
                                            <TabsTrigger value="query">Test Query</TabsTrigger>
                                            <TabsTrigger value="customQuery">Custom Query</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="connection">
                                            <div className="space-y-4">
                                                <Button
                                                    onClick={testConnection}
                                                    className="w-full bg-purple-500 text-white hover:bg-purple-600"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Testing..." : "Test Connection"}
                                                </Button>
                                                {result && (
                                                    <div className="mt-4">
                                                        <p
                                                            className={`text-sm ${result.includes("successful") ? "text-green-600" : "text-red-600"}`}
                                                        >
                                                            {result}
                                                        </p>
                                                    </div>
                                                )}
                                                {queryResult?.schema && (
                                                    <div className="mt-6">
                                                        <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                                            Database Schema
                                                        </h4>
                                                        <DatabaseFlow tables={queryResult.schema} />
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="query">
                                            <div className="space-y-4">
                                                <Select onValueChange={(value) => setQueryType(value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select query type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="showTables">Show Tables</SelectItem>
                                                        <SelectItem value="select">Select</SelectItem>
                                                        <SelectItem value="create">Create Table</SelectItem>
                                                        <SelectItem value="insert">Insert</SelectItem>
                                                        <SelectItem value="update">Update</SelectItem>
                                                        <SelectItem value="delete">Delete</SelectItem>
                                                        <SelectItem value="schema">Show Schema</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {renderQueryInputs()}
                                                <Button
                                                    onClick={testQuery}
                                                    className="w-full bg-purple-500 text-white hover:bg-purple-600"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Running Query..." : "Run Query"}
                                                </Button>
                                                {hasError && (
                                                    <Button
                                                        onClick={() => setCustomQueryInput(`/fix ${customQuery}`)}
                                                        className="w-full bg-yellow-500 text-white hover:bg-yellow-600 mt-2"
                                                        disabled={isGenerating}
                                                    >
                                                        {isGenerating ? "Fixing Query..." : "Fix Query"}
                                                    </Button>
                                                )}
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="customQuery">
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Textarea
                                                        placeholder="Enter your custom SQL query or use /generate to create code, /fix to fix errors"
                                                        value={customQueryInput}
                                                        onChange={handleCustomQueryChange}
                                                        onKeyPress={handleKeyPress}
                                                        className="mb-2 min-h-[200px] pr-24"
                                                    />
                                                    {isGenerating && (
                                                        <div className="absolute right-2 top-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            {customQueryInput.startsWith("/fix") ? "Fixing..." : "Generating..."}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        setQueryType("custom")
                                                        testQuery()
                                                    }}
                                                    className="w-full bg-purple-500 text-white hover:bg-purple-600"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Running Query..." : "Run Custom Query"}
                                                </Button>
                                                {hasError && (
                                                    <Button
                                                        onClick={() => setCustomQueryInput(`/fix ${customQuery}`)}
                                                        className="w-full bg-yellow-500 text-white hover:bg-yellow-600 mt-2"
                                                        disabled={isGenerating}
                                                    >
                                                        {isGenerating ? "Fixing Query..." : "Fix Query"}
                                                    </Button>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                    {queryResult && (
                                        <div className="mt-6">
                                            <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">Query Result</h4>
                                            <QueryResultTable result={queryResult} />
                                        </div>
                                    )}
                                    {result && !queryResult && (
                                        <pre className="mt-3 bg-white/10 dark:bg-gray-800/20 backdrop-blur-md p-3 rounded overflow-x-auto text-sm border border-white/20 dark:border-gray-700/30">
                      {result}
                    </pre>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

