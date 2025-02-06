import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { Pool } from "pg"
import mysql from "mysql2/promise"

export async function POST(req: Request) {
    try {
        const { dbType, host, port, username, password, database } = await req.json()

        console.log({ dbType, host, port, username, password, database })

        switch (dbType) {
            case "mongodb":
                await testMongoDB(host, port)
                break
            case "postgres":
                await testPostgreSQL(host, port, username, password, database)
                break
            case "mysql":
                await testMySQL(host, port, username, password, database)
                break
            default:
                return NextResponse.json({ success: false, message: "Unsupported database type" }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: `${dbType} connection successful!` })
    } catch (error) {
        return NextResponse.json({ success: false, message: `Database connection failed: ${error}` }, { status: 500 })
    }
}

// MongoDB Connection Test
async function testMongoDB(host: string, port: number) {
    const uri = `mongodb://${host}:${port}`
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 })
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    await client.close()
}

// PostgreSQL Connection Test
async function testPostgreSQL(host: string, port: number, user: string, password: string, database: string) {
    const pool = new Pool({ host, port, user, password, database })
    const client = await pool.connect()
    await client.query("SELECT 1")
    client.release()
    await pool.end()
}

// MySQL Connection Test
async function testMySQL(host: string, port: number, user: string, password: string, database: string) {
    const connection = await mysql.createConnection({ host, port, user, password, database })
    await connection.query("SELECT 1")
    await connection.end()
}

