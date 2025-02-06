import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CopyButton } from "./CopyButton"
import type { LucideIcon } from "lucide-react"

interface DatabaseInfoCardProps {
    icon: LucideIcon
    title: string
    value: string
}

export const DatabaseInfoCard: React.FC<DatabaseInfoCardProps> = ({ icon: Icon, title, value }) => {
    return (
        <Card className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
                            <p className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                {value}
                            </p>
                        </div>
                    </div>
                    <CopyButton text={value} />
                </div>
            </CardContent>
        </Card>
    )
}

export default DatabaseInfoCard