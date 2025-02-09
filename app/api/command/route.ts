import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
    try {
        const { prompt, dbType } = await req.json()

        if (!["postgres", "mysql"].includes(dbType)) {
            return new Response(JSON.stringify({ error: "Unsupported database type" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        const codePrompt = `Generate a ${dbType.toUpperCase()} query for the following request. Respond with ONLY the raw SQL command, no formatting, no explanations, no backticks: ${prompt}`

        const result = await model.generateContent(codePrompt)
        const response = await result.response
        const query = response.text().trim()

        // Remove any potential backticks or language tags that might have been generated
        const cleanQuery = query.replace(/^```[\w]*\n?|\n?```$/g, "").trim()

        return new Response(JSON.stringify({ query: cleanQuery }), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error:", error)
        return new Response(JSON.stringify({ error: "Failed to generate query" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

