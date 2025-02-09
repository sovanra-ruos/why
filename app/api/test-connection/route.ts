import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { Pool } from "pg"
import mysql from "mysql2/promise"

export async function POST(req: Request) {
    try {
        const { dbType, host, port, username, password, database } = await req.json()

        console.log({ dbType, host, port, username, password, database })

        let schema
        switch (dbType) {
            case "mongodb":
                schema = await testMongoDB(host, port, username, password, database)
                break
            case "postgres":
                schema = await testPostgreSQL(host, port, username, password, database)
                break
            case "mysql":
                schema = await testMySQL(host, port, username, password, database)
                break
            default:
                return NextResponse.json({ success: false, message: "Unsupported database type" }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: `${dbType} connection successful!`,
            schema,
        })
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: `Database connection failed: ${error}`,
            },
            { status: 500 },
        )
    }
}

async function testMongoDB(host: string, port: number, username: string, password: string, database: string) {
    const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 })
    await client.connect()

    const collections = await client.db(database).listCollections().toArray()
    const schema = await Promise.all(
        collections.map(async (collection) => {
            const sample = await client.db(database).collection(collection.name).findOne()
            const columns = sample
                ? Object.keys(sample).map((key) => ({
                    column_name: key,
                    data_type: typeof sample[key],
                }))
                : []

            return {
                table_name: collection.name,
                columns,
            }
        }),
    )

    await client.close()
    return schema
}

async function testPostgreSQL(host: string, port: number, user: string, password: string, database: string) {
    const pool = new Pool({ host, port, user, password, database })
    const client = await pool.connect()

    const tablesResult = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    `)

    const foreignKeysQuery = `
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS references_table,
            ccu.column_name AS references_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
    `
    const foreignKeysResult = await client.query(foreignKeysQuery)
    const foreignKeys = foreignKeysResult.rows

    const schema = await Promise.all(
        tablesResult.rows.map(async (table) => {
            const columnsResult = await client.query(
                `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = $1
        `,
                [table.table_name],
            )

            const columns = columnsResult.rows.map((col) => {
                const foreignKey = foreignKeys.find(
                    (fk) => fk.table_name === table.table_name && fk.column_name === col.column_name,
                )
                return {
                    column_name: col.column_name,
                    data_type: col.data_type,
                    is_foreign_key: !!foreignKey,
                    references_table: foreignKey?.references_table,
                    references_column: foreignKey?.references_column,
                }
            })

            return {
                table_name: table.table_name,
                columns,
            }
        }),
    )

    client.release()
    await pool.end()
    return schema
}

interface Table {
    TABLE_NAME: string;
}

interface Column {
    COLUMN_NAME: string;
    DATA_TYPE: string;
}

interface ForeignKey {
    TABLE_NAME: string;
    COLUMN_NAME: string;
    REFERENCED_TABLE_NAME: string;
    REFERENCED_COLUMN_NAME: string;
}

async function testMySQL(host: string, port: number, user: string, password: string, database: string) {
    const connection = await mysql.createConnection({ host, port, user, password, database })

    const [tables] = await connection.query(
        `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = ?
        `,
        [database],
    )

    const [foreignKeys] = await connection.query(
        `
        SELECT
            TABLE_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_SCHEMA = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `,
        [database],
    )

    const schema = await Promise.all(
        (tables as Table[]).map(async (table) => {
            const [columns] = await connection.query(
                `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = ?
            AND table_name = ?
        `,
                [database, table.TABLE_NAME],
            )

            const tableColumns = (columns as Column[]).map((col) => {
                const foreignKey = (foreignKeys as ForeignKey[]).find(
                    (fk) => fk.TABLE_NAME === table.TABLE_NAME && fk.COLUMN_NAME === col.COLUMN_NAME,
                )
                return {
                    column_name: col.COLUMN_NAME,
                    data_type: col.DATA_TYPE,
                    is_foreign_key: !!foreignKey,
                    references_table: foreignKey?.REFERENCED_TABLE_NAME,
                    references_column: foreignKey?.REFERENCED_COLUMN_NAME,
                }
            })

            return {
                table_name: table.TABLE_NAME,
                columns: tableColumns,
            }
        }),
    )

    await connection.end()
    return schema
}

