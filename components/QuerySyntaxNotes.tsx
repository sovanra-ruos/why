import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface QuerySyntaxNotesProps {
    queryType: string
    dbType: string
}

export const QuerySyntaxNotes: React.FC<QuerySyntaxNotesProps> = ({ queryType, dbType }) => {
    const getNotes = () => {
        switch (queryType) {
            case "showTables":
                return dbType === "mongodb" ? "MongoDB: db.getCollectionNames()" : "SQL: SHOW TABLES;"
            case "select":
                return dbType === "mongodb"
                    ? "MongoDB: db.collection.find(query, projection)"
                    : "SQL: SELECT column1, column2 FROM table WHERE condition;"
            case "create":
                return dbType === "mongodb"
                    ? "MongoDB: db.createCollection(name, options)"
                    : "SQL: CREATE TABLE table_name (column1 datatype, column2 datatype, ...);"
            case "insert":
                return dbType === "mongodb"
                    ? "MongoDB: db.collection.insertOne(document) or db.collection.insertMany([documents])"
                    : "SQL: INSERT INTO table_name (column1, column2) VALUES (value1, value2);"
            case "update":
                return dbType === "mongodb"
                    ? "MongoDB: db.collection.updateOne(filter, update) or db.collection.updateMany(filter, update)"
                    : "SQL: UPDATE table_name SET column1 = value1 WHERE condition;"
            case "delete":
                return dbType === "mongodb"
                    ? "MongoDB: db.collection.deleteOne(filter) or db.collection.deleteMany(filter)"
                    : "SQL: DELETE FROM table_name WHERE condition;"
            case "schema":
                return dbType === "mongodb"
                    ? "MongoDB: db.collection.findOne() to see document structure"
                    : "SQL: DESCRIBE table_name; or SHOW CREATE TABLE table_name;"
            default:
                return "Enter your custom query based on your database type."
        }
    }

    return (
        <Card className="mt-4 bg-blue-50 dark:bg-blue-900">
            <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-2">Query Syntax Note:</h4>
                <p className="text-xs">{getNotes()}</p>
            </CardContent>
        </Card>
    )
}

