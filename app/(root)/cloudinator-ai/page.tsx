"use client"

import {useState, useRef, useCallback} from "react"
import {Button} from "@/components/ui/button"
import {Card} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Textarea} from "@/components/ui/textarea"
import {useToast} from "@/hooks/use-toast"
import {CodePreview} from "@/components/code-preview"
import {ImageUpload} from "@/components/image-upload"
import {Code, FileText, Loader2, ImageIcon, Zap} from "lucide-react"
import {Alert, AlertDescription} from "@/components/ui/alert"
import FileTree from "@/components/file-tree"
import {
    useCreateRepositoryMutation,
    useCreateServiceDeploymentMutation,
    useGetWorkspacesQuery
} from "@/redux/api/projectApi";

// export interface ProjectResponse {
//     projectId: string
//     files: GeneratedFile[]
// }

interface GeneratedFile {
    name: string
    path: string
    content: string
}

export default function Page() {
    const [files, setFiles] = useState<GeneratedFile[]>([])
    const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeTab, setActiveTab] = useState("preview")
    const [inputMode, setInputMode] = useState<"text" | "image">("text")
    const [prompt, setPrompt] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {toast} = useToast()
    const [createRepository] = useCreateRepositoryMutation();
    const [createServiceDeployment] =
        useCreateServiceDeploymentMutation();

    const { data: workspacesData } = useGetWorkspacesQuery();

    console.log("workspacesData:", workspacesData);

    const handleImageAnalysis = useCallback(
        async (file: File, imagePrompt: string) => {
            setIsProcessing(true)
            try {
                const formData = new FormData()
                formData.append("image", file)
                formData.append("prompt", imagePrompt || prompt)

                const response = await fetch("/api/analyze-image", {
                    method: "POST",
                    body: formData,
                })

                const data = await response.json()

                // if (!response.ok) {
                //     throw new Error(
                //         data.error || (data.details ? `${data.error}: ${JSON.stringify(data.details)}` : "Failed to analyze image"),
                //     )
                // }

                // if (!data.files || !Array.isArray(data.files)) {
                //     throw new Error("Invalid response format: missing files array")
                // }

                const newFiles = data.files.map((file: { name: string; path: string; content: string }) => ({
                    name: file.name,
                    path: file.path,
                    content: file.content,
                }))

                setFiles(newFiles)
                if (newFiles.length > 0) {
                    setSelectedFile(newFiles[0])
                }

                toast({
                    title: "Success",
                    description: "Files generated successfully",
                    variant: "success",
                })
            } catch (error) {
                console.log("Error analyzing image:", error)
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to analyze image",
                    variant: "error",
                })
            } finally {
                setIsProcessing(false)
            }
        },
        [prompt, toast],
    )

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return
        setIsProcessing(true)

        try {
            localStorage.removeItem("projectId")

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({prompt}),
            })

            const data = await response.json()
            // if (!response.ok) {
            //     throw new Error(data.error || "Failed to generate code")
            // }

            localStorage.setItem("projectId", data.projectId)

            // if (!data.files || !Array.isArray(data.files)) {
            //     throw new Error("Invalid response format: missing files array")
            // }

            const newFiles = data.files.map((file: { name: string; path: string; content: string }) => ({
                name: file.name,
                path: file.path,
                content: file.content,
            }))

            setFiles(newFiles)
            if (newFiles.length > 0) {
                setSelectedFile(newFiles[0])
            }

            setActiveTab("code")

            toast({
                title: "Success",
                description: "Code generated successfully",
                variant: "success",
            })
        } catch (error) {
            console.error("Error generating code:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to generate code",
                variant: "error",
            })
        } finally {
            setIsProcessing(false)
        }
    }, [prompt, toast])

    const handleDeploy = useCallback(async () => {
        try {
            const projectId = localStorage.getItem("projectId");

            const gitUrl = `https://git.cloudinator.cloud/cloudinator-ai/${projectId}.git`;

            const branch = "main";

            // Generate a random 6-digit number
            const randomSixLetterString = Array.from({ length: 6 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

            const workspaceName = `${workspacesData?.[0]?.name}`;

            const response = await createServiceDeployment({
                name: randomSixLetterString,
                gitUrl: gitUrl,
                branch: branch,
                subdomain: randomSixLetterString,
                workspaceName: workspaceName,
                type: "frontend",
                token:''
            });

            console.log("Deploy response:", response);

            toast({
                title: "Success",
                description: "Files deployed successfully",
                variant: "success",
            });
        } catch (error) {
            console.log("Error deploying files:", error);
            toast({
                title: "Error",
                description: "Failed to deploy files",
                variant: "error",
            });
        }
    }, [toast, workspacesData]);

    const handlePushCode = useCallback(async () => {
        try {
            const projectId = localStorage.getItem("projectId");

            if (!projectId) {
                throw new Error("No projectId found in localStorage");
            }

            await createRepository({name: projectId});

            const response = await fetch("/api/git-push", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({projectId}),
            });

            console.log("Push code response:", response);

            if (!response.ok) {
                throw new Error("Failed to make the project public");
            }

            toast({
                title: "Success",
                description: "Project made public successfully",
                variant: "success",
            });
        } catch (error) {
            console.error("Error making project public:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to make project public",
                variant: "error",
            });
        }
    }, [toast]);

    return (
        <div
            className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-purple-900">
            <div className="flex-1 flex flex-col">
                <header className="border-b py-2 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                    <div className="container flex items-center justify-between h-14 px-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                                Cloudinator AI
                            </h1>
                            <p className="text-purple-600 dark:text-purple-400">Code Generator</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={handlePushCode} variant="outline"
                                    className="bg-white/50 dark:bg-gray-800/50">
                                Publish
                            </Button>
                            <Button onClick={handleDeploy}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                Deploy
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg dark:bg-gray-800/80">
                            <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as "text" | "image")}>
                                <TabsList className="mb-4 w-full grid grid-cols-2">
                                    <TabsTrigger
                                        value="text"
                                        className="data-[state=active]:bg-gradient-to-r from-purple-600 to-indigo-600 data-[state=active]:text-white"
                                    >
                                        <FileText className="w-4 h-4 mr-2"/>
                                        Input Text
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="image"
                                        className="data-[state=active]:bg-gradient-to-r from-purple-600 to-indigo-600 data-[state=active]:text-white"
                                    >
                                        <ImageIcon className="w-4 h-4 mr-2"/>
                                        Add Image
                                    </TabsTrigger>
                                </TabsList>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div
                                            className="absolute rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative">
                                            <Textarea
                                                placeholder={
                                                    inputMode === "text"
                                                        ? "Describe what code you want to generate..."
                                                        : "Add any specific instructions for the image analysis (optional)..."
                                                }
                                                value={prompt}
                                                onChange={(e) => {
                                                    setPrompt(e.target.value)
                                                    e.target.style.height = "auto"
                                                    e.target.style.height = `${e.target.scrollHeight}px`
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey && !isProcessing && prompt.trim()) {
                                                        e.preventDefault()
                                                        handleGenerate()
                                                    }
                                                }}
                                                className="min-h-[100px] w-full bg-white/80  border-2 border-purple-500/20 rounded-lg p-4 font-mono text-sm transition-all duration-300  resize-none overflow-hidden shadow-lg "
                                            />
                                            <div
                                                className="absolute bottom-2 right-2 text-xs text-purple-400 opacity-70">
                                                {prompt.length > 0 && `${prompt.length} characters`}
                                            </div>
                                            {prompt.length > 0 && (
                                                <div
                                                    className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                                                    style={{width: `${Math.min((prompt.length / 500) * 100, 100)}%`}}
                                                ></div>
                                            )}
                                        </div>
                                    </div>

                                    {inputMode === "image" && (
                                        <ImageUpload ref={fileInputRef} onImageSelected={handleImageAnalysis}
                                                     isLoading={isProcessing}/>
                                    )}

                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isProcessing || !prompt.trim()}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                                <span>Generating...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Zap className="h-4 w-4"/>
                                                <span>Generate Code</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </Tabs>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg dark:bg-gray-800/80">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="w-full">
                                    <TabsTrigger
                                        value="preview"
                                        className="flex-1 data-[state=active]:bg-gradient-to-r from-purple-600 to-indigo-600 data-[state=active]:text-white"
                                    >
                                        <FileText className="w-4 h-4 mr-2"/>
                                        Preview
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="code"
                                        className="flex-1 data-[state=active]:bg-gradient-to-r from-purple-600 to-indigo-600 data-[state=active]:text-white"
                                    >
                                        <Code className="w-4 h-4 mr-2"/>
                                        Code
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="preview" className="p-4">
                                    {selectedFile ? (
                                        selectedFile.name.endsWith(".html") ? (
                                            <iframe
                                                srcDoc={selectedFile.content}
                                                className="w-full h-[400px] border rounded"
                                                title="Code Preview"
                                            />
                                        ) : (
                                            <CodePreview
                                                file={selectedFile}
                                                onSave={async (filename, content) => {
                                                    setFiles(files.map((f) => (f.name === filename ? {
                                                        ...f,
                                                        content
                                                    } : f)))
                                                }}
                                            />
                                        )
                                    ) : (
                                        <p className="text-center text-gray-500 dark:text-gray-400">No file selected for
                                            preview.</p>
                                    )}
                                </TabsContent>
                                <TabsContent value="code" className="p-4">
                                    {selectedFile ? (
                                        <CodePreview
                                            file={selectedFile}
                                            onSave={async (filename, content) => {
                                                setFiles(files.map((f) => (f.name === filename ? {...f, content} : f)))
                                            }}
                                        />
                                    ) : (
                                        <p className="text-center text-gray-500 dark:text-gray-400">No file selected to
                                            display code.</p>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </Card>
                        <Alert className="bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800">
                            <AlertDescription className="text-sm text-purple-800 dark:text-purple-200">
                                <p>
                                    <strong>Note:</strong> This AI is a prototype version and can generate HTML code.
                                </p>
                                <p>To deploy the generated code, please click &#34;Publish&#34; first,
                                    then &#34;Deploy&#34;.</p>
                                <p>after Deploy it you can check it in your workspace.</p>
                            </AlertDescription>
                        </Alert>
                    </div>
                </main>
            </div>
            <div className="w-72 border-l py-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <div className="p-4 border-b flex items-center space-x-2">
                    <Code className="text-purple-600 dark:text-purple-400" size={20}/>
                    <h2 className="font-semibold text-lg text-purple-600 dark:text-purple-400">Project Files</h2>
                </div>
                <div className="p-4">
                    <FileTree files={files} selectedFile={selectedFile} onSelect={setSelectedFile}/>
                </div>
            </div>
        </div>
    )
}

