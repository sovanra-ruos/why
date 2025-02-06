import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json()
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        // Add specific instructions for code generation
        const codePrompt = `You are a code generator. Please generate code for the following request. Only respond with the code, no explanations: ${prompt}`

        const result = await model.generateContent(codePrompt)
        const response = await result.response
        const text = response.text()

        return new Response(JSON.stringify({ response: text }), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error:", error)
        return new Response(JSON.stringify({ error: "Failed to process request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

