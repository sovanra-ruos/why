import { NextResponse } from "next/server"
import { Pool } from "pg"
import mysql, { FieldPacket } from "mysql2/promise"
import { MongoClient } from "mongodb"



export async function POST(req: Request) {
    try {
        const { dbType, host, port, username, password, database, query } = await req.json()
        console.log("request",req)
        console.log("query",query)
        let result;
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
        const errorMessage = (error as Error).message;
        return NextResponse.json({ success: false, message: `Database query failed: ${errorMessage}` }, { status: 500 });
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
    const connection = await mysql.createConnection({ host, port, user, password, database });
    try {
        const [rows, fields] = await connection.execute(query);
        return {
            message: "Query executed successfully",
            rows: rows,
            fields: fields.map((field: FieldPacket) => ({
                name: field.name,
                type: field.type,
            })),
        };
    } finally {
        await connection.end();
    }
}

type MongoOperation = 'find' | 'insertOne' | 'updateOne' | 'deleteOne' | 'createCollection';
type MongoParams = {
    filter?: Record<string, unknown>;
    update?: Record<string, unknown>;
    [key: string]: unknown;
};

async function executeMongoDB(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    query: string,
) {
    const uri = `mongodb://${user}:${password}@${host}:${port}/${database}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(database);
        const parsedQuery = JSON.parse(query);
        const { collection, operation, ...params } = parsedQuery as { collection: string, operation: MongoOperation };
        console.log("parsedQuery", parsedQuery);
        let result;

        switch (operation) {
            case 'find':
                result = await db.collection(collection).find(params).toArray();
                break;
            case 'insertOne':
                result = await db.collection(collection).insertOne(params);
                break;
            case 'updateOne':
                const { filter, update } = params as MongoParams;
                result = await db.collection(collection).updateOne(filter || {}, update || {});
                break;
            case 'deleteOne':
                result = await db.collection(collection).deleteOne(params);
                break;
            case 'createCollection':
                result = await db.createCollection(collection);
                break;
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }

        return {
            message: "Query executed successfully",
            rows: result,
            rowCount: Array.isArray(result) ? result.length : 1,
            fields: Array.isArray(result) && result.length > 0 ? Object.keys(result[0]).map((key) => ({ name: key })) : [],
        };
    } finally {
        await client.close();
    }
}
