import { forwardRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import type React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ImageUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onImageSelected: (file: File, prompt: string) => void
    isLoading?: boolean
    isUploading?: boolean
}

export const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
    ({ className, onImageSelected, isLoading, isUploading, ...props }, ref) => {
        const [prompt] = useState("")
        const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
        const [selectedFile, setSelectedFile] = useState<File | null>(null)
        const [previewUrl, setPreviewUrl] = useState<string | null>(null)
        const [isDragging, setIsDragging] = useState(false)

        const handleFileSelect = useCallback((file: File) => {
            setSelectedFile(file)
            setSelectedFileName(file.name)
            const imageUrl = URL.createObjectURL(file)
            setPreviewUrl(imageUrl)
        }, [])

        const handleSubmit = () => {
            if (selectedFile) {
                onImageSelected(selectedFile, prompt)
            }
        }

        const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(true)
        }

        const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
        }

        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
        }

        const handleDrop = useCallback(
            (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)
                const file = e.dataTransfer.files[0]
                if (file && file.type.startsWith("image/")) {
                    handleFileSelect(file)
                }
            },
            [handleFileSelect],
        )

        useEffect(() => {
            return () => {
                // Clean up the object URL when the component unmounts
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                }
            }
        }, [previewUrl])

        return (
            <div className="space-y-4">
                <div className="text-center">
                    <div className="space-y-2">
                        <AnimatePresence>
                            {isLoading || isUploading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360],
                                        }}
                                        transition={{
                                            duration: 2,
                                            ease: "easeInOut",
                                            times: [0, 0.5, 1],
                                            repeat: Number.POSITIVE_INFINITY,
                                        }}
                                    >
                                        <Icons.spinner className="h-12 w-12 text-purple-500" />
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative"
                                >
                                    <div
                                        className={cn(
                                            "rounded-lg border-2 border-dashed p-8 transition-colors",
                                            isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-500",
                                            "cursor-pointer",
                                        )}
                                        onClick={() => {
                                            const input = document.querySelector(`input[type="file"]`) as HTMLInputElement
                                            input?.click()
                                        }}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            {previewUrl ? (
                                                <motion.img
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="max-h-48 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <Icons.upload className="h-8 w-8 text-muted-foreground" />
                                            )}
                                            <div className="text-sm text-muted-foreground">
                                                {selectedFileName ? (
                                                    <span className="text-primary">{selectedFileName}</span>
                                                ) : (
                                                    "Drag and drop an image, or click to select"
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <input
                        ref={ref}
                        type="file"
                        accept="image/*"
                        className={cn("hidden", className)}
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                handleFileSelect(file)
                            }
                        }}
                        {...props}
                    />
                </div>

                <div className="space-y-2">
                    <Button
                        className="w-full bg-purple-500 hover:bg-purple-700 focus:ring-offset-2 focus:ring-2 focus:ring-purple-500 transition-all ease-in-out"
                        onClick={handleSubmit}
                        disabled={isLoading || isUploading || !selectedFile}
                    >
                        {isLoading || isUploading ? "Processing..." : "Analyze Image"}
                    </Button>
                </div>
            </div>
        )
    },
)

ImageUpload.displayName = "ImageUpload"

