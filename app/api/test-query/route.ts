import { NextResponse } from "next/server"
import { Pool } from "pg"
import mysql from "mysql2/promise"
import { MongoClient } from "mongodb"


export async function POST(req: Request) {
    try {
        const { dbType, host, port, username, password, database, query } = await req.json()
        console.log("query",query)
        let result

        switch (dbType) {
            case "postgres":
                result = await executePostgreSQL(host, port, username, password, database, query)
                break
            case "mysql":
                result = await executeMySQL(host, port, username, password, database, query)
                break
            case "mongodb":
                result = await executeMongoDB(host, port, username, password, database, query)
                break
            default:
                return NextResponse.json({ success: false, message: "Unsupported database type" }, { status: 400 })
        }

        return NextResponse.json({ success: true, result })
    } catch (error) {
        return NextResponse.json({ success: false, message: `Database query failed: ${error.message}` }, { status: 500 })
    }
}

async function executePostgreSQL(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    query: string,
) {
    const pool = new Pool({ host, port, user, password, database })
    const client = await pool.connect()
    try {
        const result = await client.query(query)
        return {
            message: "Query executed successfully",
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields.map((field) => ({
                name: field.name,
                dataTypeID: field.dataTypeID,
            })),
        }
    } finally {
        client.release()
        await pool.end()
    }
}

async function executeMySQL(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    query: string,
) {
    const connection = await mysql.createConnection({ host, port, user, password, database })
    try {
        const [rows, fields] = await connection.execute(query)
        return {
            message: "Query executed successfully",
            rows: rows,
            fields: fields.map((field: any) => ({
                name: field.name,
                type: field.type,
            })),
        }
    } finally {
        await connection.end()
    }
}

async function executeMongoDB(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    query: string,
) {
    const uri = `mongodb://${user}:${password}@${host}:${port}/${database}`
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const db = client.db(database)
        const parsedQuery = JSON.parse(query)
        const { collection, operation, ...params } = parsedQuery
        const result = await db.collection(collection)[operation](params).toArray()
        return {
            message: "Query executed successfully",
            rows: result,
            rowCount: result.length,
            fields: result.length > 0 ? Object.keys(result[0]).map((key) => ({ name: key })) : [],
        }
    } finally {
        await client.close()
    }
}

