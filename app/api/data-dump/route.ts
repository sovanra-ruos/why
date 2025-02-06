import { NextResponse } from "next/server"
import { Client } from "pg"
import mysql, { RowDataPacket } from "mysql2/promise"
import { MongoClient } from "mongodb"

export async function POST(req: Request) {
    try {
        const { dbType, host, port, username, password, database } = await req.json()

        let dumpContent = ""

        switch (dbType) {
            case "postgres":
                dumpContent = await dumpPostgres(host, port, username, password, database)
                break
            case "mysql":
                dumpContent = await dumpMySQL(host, port, username, password, database)
                break
            case "mongodb":
                dumpContent = await dumpMongoDB(host, port, username, password, database)
                break
            default:
                return NextResponse.json({ error: "Unsupported database type" }, { status: 400 })
        }

        return new NextResponse(dumpContent, {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename=${database}_data.sql`,
            },
        })
    } catch (error) {
        console.error("Error dumping database:", error as Error)
        return NextResponse.json({ error: "Failed to dump database", details: (error as Error).message }, { status: 500 })
    }
}

async function dumpPostgres(host:string, port:number, user:string, password:string, database:string) {
    const client = new Client({ host, port, user, password, database })
    await client.connect()

    try {
        let dumpContent = ""
        const tableQuery = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
        const tables = tableQuery.rows.map(row => row.table_name)

        for (const table of tables) {
            const dataQuery = await client.query(`SELECT * FROM "${table}"`)
            for (const row of dataQuery.rows) {
                const columns = Object.keys(row).join(", ")
                const values = Object.values(row)
                    .map(value => (value === null ? "NULL" : `'${String(value).replace(/'/g, "''")}'`))
                    .join(", ")
                dumpContent += `INSERT INTO "${table}" (${columns}) VALUES (${values});\n`
            }
            dumpContent += "\n"
        }
        return dumpContent
    } finally {
        await client.end()
    }
}

async function dumpMySQL(host:string, port:number, user:string, password:string, database:string) {
    const connection = await mysql.createConnection({ host, port, user, password, database })
    try {
        const [tables] = await connection.query<RowDataPacket[]>("SHOW TABLES")
        let dumpContent = ""

        for (const tableRow of tables) {
            const tableName = tableRow[`Tables_in_${database}`]
            const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM ${tableName}`)
            for (const row of rows) {
                const columns = Object.keys(row).join(", ")
                const values = Object.values(row)
                    .map(value => (typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : value))
                    .join(", ")
                dumpContent += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`
            }
            dumpContent += "\n"
        }
        return dumpContent
    } finally {
        await connection.end()
    }
}

async function dumpMongoDB(host:string, port:number, username:string, password:string, database:string) {
    const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const db = client.db(database)
        const collections = await db.listCollections().toArray()
        let dumpContent = ""

        for (const collection of collections) {
            const collectionName = collection.name
            const documents = await db.collection(collectionName).find({}).toArray()
            for (const doc of documents) {
                dumpContent += `db.${collectionName}.insertOne(${JSON.stringify(doc, null, 2)});\n`
            }
            dumpContent += "\n"
        }
        return dumpContent
    } finally {
        await client.close()
    }
}
