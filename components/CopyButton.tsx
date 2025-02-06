"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CopyButtonProps {
    text: string
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setIsCopied(true)

            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.log("Failed to copy:", err)
        }
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-purple-400 hover:text-purple-300">
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
    )
}

