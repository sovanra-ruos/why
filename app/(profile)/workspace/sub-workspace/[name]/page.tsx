"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronRight, Plus, FileText, MoreVertical, Sparkles, Code, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ERDDiagram from "@/components/profiledashboard/workspace/service/ERDDiagram"
import { SpringInitializer } from "@/components/profiledashboard/workspace/service/SpringInitializer"
import {
  useBuildSpringServiceMutation,
  useCreateExistingProjectMutation,
  useDeleteSpringProjectMutation,
  useGetBuildNumberInFolderQuery,
  useGetProjectsQuery,
} from "@/redux/api/projectApi"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AnimatePresence } from "framer-motion"
import { useGetMeQuery } from "@/redux/api/userApi"
import { useToast } from "@/hooks/use-toast"
import { GitCommandModal } from "@/components/profiledashboard/workspace/GitCommandModal"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type PropsParams = {
  params: Promise<{ name: string }>
}

type SpringProjectType = {
  uuid: string
  name: string
  folder: string
  group: string
  dependencies: string[]
  branch: string
  namespace: string
  git: string
}

export type SpringProjectResponse = {
  next: boolean
  previous: boolean
  total: number
  totalElements: number
  results: SpringProjectType[]
}

type BuildHistoryItem = {
  buildNumber: number
  status: "BUILDING" | "SUCCESS" | "FAILURE"
}

interface ErrorResponse {
  status?: string | number
  originalStatus?: number
  data?: {
    message?: string
  }
}

interface SortableItemProps {
  id: string
  children: React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
      <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-move">
        {children}
      </li>
  )
}

export default function SubWorkspacePage(props: PropsParams) {
  const [params, setParams] = useState<{ name: string } | null>(null)
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false)
  const [isSpringInitializerOpen, setIsSpringInitializerOpen] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<SpringProjectType[]>([])
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false)
  const [buildSpringService] = useBuildSpringServiceMutation()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<SpringProjectType | null>(null)
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("")
  const [deleteConfirmationError, setDeleteConfirmationError] = useState("")
  const [existingProjectName, setExistingProjectName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [gitName, setGitName] = useState<string | null>(null)

  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [createExistingProject] = useCreateExistingProjectMutation()

  const [deleteSpringProject] = useDeleteSpringProjectMutation()
  const [isGitCommandModalOpen, setIsGitCommandModalOpen] = useState(false)

  const { toast } = useToast()

  const { data: profile } = useGetMeQuery()

  console.log(profile)

  useEffect(() => {
    props.params.then(setParams)
  }, [props.params])

  useEffect(() => {
    if (params) {
      console.log(params.name)
    }
  }, [params])

  const { data, refetch } = useGetProjectsQuery({
    subWorkspace: params?.name ?? "",
    page: 0,
    size: 10,
  }) as unknown as { data: SpringProjectResponse; refetch: () => void }

  const springProjects = data?.results ?? []

  const { data: buildNumber, refetch: build } = useGetBuildNumberInFolderQuery({
    folder: params?.name ?? "",
    name: params?.name ?? "",
  })

  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setSelectedProjects((items) => {
        const oldIndex = items.findIndex((item) => item.uuid === active.id)
        const newIndex = items.findIndex((item) => item.uuid === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const handleProjectSelect = useCallback(
      (projectUuid: string) => {
        const project = springProjects.find((p) => p.uuid === projectUuid)
        if (project && !selectedProjects.some((p) => p.uuid === projectUuid)) {
          setSelectedProjects((prevProjects) => [...prevProjects, project])
        }
      },
      [selectedProjects, springProjects],
  )

  const removeProject = useCallback((projectUuid: string) => {
    setSelectedProjects((prevProjects) => prevProjects.filter((p) => p.uuid !== projectUuid))
  }, [])

  const handleBuildProject = useCallback(async () => {
    const selectedProjectNames = selectedProjects.map((project) => project.name)
    console.log("Building project with selected services:", selectedProjectNames)
    setIsLoading(true)
    setIsSuccess(false)
    try {
      const result = await buildSpringService({
        folder: params?.name ?? "",
        name: params?.name ?? "",
        serviceName: selectedProjectNames,
      })
      console.log(result)
      setIsSuccess(true)
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to build the project. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      toast({
        title: "Build Initiated",
        description: "Your project build has been initiated.",
        duration: 3000,
      })
      build()
      setIsLoading(false)
      setIsDeployDialogOpen(false)
    }
  }, [selectedProjects, params?.name, buildSpringService])

  const handleDeleteSpringProject = async (project: SpringProjectType) => {
    try {
      const result = await deleteSpringProject({
        folder: params?.name ?? "",
        name: project.name,
      })

      console.log(result)
    } catch (error) {
      console.log(error)
    } finally {
      refetch()
      setIsDeleteDialogOpen(false)
    }
  }

  const handleDeleteProject = (project: SpringProjectType) => {
    setProjectToDelete(project)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirmationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmationName(e.target.value)
    setDeleteConfirmationError("")
  }

  const confirmDeleteProject = () => {
    if (projectToDelete && projectToDelete.name === deleteConfirmationName) {
      handleDeleteSpringProject(projectToDelete)
      setProjectToDelete(null)
      setDeleteConfirmationName("")
      setDeleteConfirmationError("")
    } else if (projectToDelete && projectToDelete.name !== deleteConfirmationName) {
      setDeleteConfirmationError("Project name does not match")
    }
  }

  const handleCreateProject = (option: "new" | "existing") => {
    if (option === "new") {
      setIsSpringInitializerOpen(true)
      setIsCreateProjectDialogOpen(false)
    } else if (option === "existing") {
      setExistingProjectName("") // Reset the name
    }
  }

  const handleCreateExistingProject = async (name: string) => {
    if (!name || error) {
      setError("Please enter a valid project name")
      return
    }

    const existingProjectName = name + Math.floor(Math.random() * 1000)

    setGitName(existingProjectName)

    try {
      const result = await createExistingProject({
        folder: params?.name ?? "",
        name: existingProjectName,
        servicesNames: selectedServices,
      }).unwrap()

      console.log(result)
    } catch (err) {
      const error = err as ErrorResponse

      if (error?.status === "PARSING_ERROR" && error?.originalStatus === 200) {
        toast({
          title: "Success",
          description: error?.data?.message || `ProjectName "${name}" created successfully!`,
          variant: "success",
          duration: 3000,
        })
        setIsCreateProjectDialogOpen(false)
        setSelectedServices([])
        setIsGitCommandModalOpen(true)
        refetch()
      } else {
        toast({
          title: "Error",
          description: error?.data?.message || "Failed to create project. Please try again.",
          variant: "error",
          duration: 5000,
        })
      }

      console.log(error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setExistingProjectName(value)
    if (!value) {
      setError("Project name cannot be empty")
    } else if (value.length < 3) {
      setError("Project name must be at least 3 characters long")
    } else if (value.length > 50) {
      setError("Project name must not exceed 50 characters")
    } else if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      setError("Project name can only contain letters, numbers, hyphens, and underscores")
    } else {
      setError(null)
    }
  }

  if (!profile) {
    return null
  }

  const gitCommands = [
    "git init --initial-branch=main",
    `git remote add origin https://git.cloudinator.cloud/group-${profile.username}/${gitName}.git`,
    "git add .",
    'git commit -m "message"',
    "git push --set-upstream origin main",
  ]

  return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href={"/workspace"}>workspace</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{params?.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-500">Spring Microservices</h1>
            <p className="text-lg text-muted-foreground">Manage Spring microservice projects and their relationships</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-500 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Deploy/Build
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-purple-500">Select and Order Services</DialogTitle>
                  <DialogDescription>Choose and order the services for deployment</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <Select onValueChange={handleProjectSelect} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {springProjects.map((project) => (
                          <SelectItem key={project.uuid} value={project.uuid}>
                            {project.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-red-500">Select services order(Service run first must be on top) </h3>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={selectedProjects.map((p) => p.uuid)} strategy={verticalListSortingStrategy}>
                        <ul className="space-y-2">
                          {selectedProjects.map((project) => (
                              <SortableItem key={project.uuid} id={project.uuid}>
                                <div className="flex items-center justify-between space-x-2 p-3 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="flex items-center space-x-2">
                                    <GripVertical className="h-5 w-5 text-gray-500" />
                                    <span className="font-medium text-gray-700">{project.name}</span>
                                  </div>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeProject(project.uuid)}
                                      className="text-red-500 hover:text-red-700"
                                      disabled={isLoading}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </SortableItem>
                          ))}
                        </ul>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
                <DialogFooter className="mt-6 space-x-2">
                  <Button
                      onClick={handleBuildProject}
                      className={`${isSuccess ? "bg-green-500" : "bg-purple-500"} hover:bg-opacity-90`}
                      disabled={isLoading || isSuccess}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSuccess && <CheckCircle className="mr-2 h-4 w-4" />}
                    {isLoading ? "Building..." : isSuccess ? "Built!" : "Build"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-500 hover:bg-purple-700" onClick={() => setIsCreateProjectDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Spring Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center text-purple-500">
                    Create Your Spring Project
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Choose your preferred method to kickstart your Spring project
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card
                        className="cursor-pointer transition-all duration-300 hover:border-purple-500 hover:shadow-md"
                        onClick={() => handleCreateProject("new")}
                    >
                      <CardHeader className="flex flex-col items-center">
                        <Sparkles className="h-12 w-12 text-purple-500 mb-2" />
                        <CardTitle className="text-purple-500">Create New Project</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center text-sm text-muted-foreground">
                          Start fresh with a new Spring project using our initializer
                        </p>
                      </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer transition-all duration-300 hover:border-purple-500 hover:shadow-md"
                        onClick={() => handleCreateProject("existing")}
                    >
                      <CardHeader className="flex flex-col items-center">
                        <Code className="h-12 w-12 text-purple-500 mb-2" />
                        <CardTitle className="text-purple-500">Use Existing Code</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center text-sm text-muted-foreground">
                          Import your existing Spring project code
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  {existingProjectName !== null && (
                      <div className="space-y-4 p-6 bg-muted rounded-lg">
                        <Label htmlFor="existing-project-name" className="text-lg font-semibold">
                          Project Name
                        </Label>
                        <Input
                            id="existing-project-name"
                            value={existingProjectName}
                            onChange={handleInputChange}
                            placeholder="Enter your project name"
                            className="w-full"
                            required
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        <div className="space-y-2">
                          <Label htmlFor="service-select" className="text-lg font-semibold">
                            Select the services your microservice needs (e.g., Eureka for service discovery)
                          </Label>
                          <div className="flex space-x-2 flex-wrap">
                            {springProjects.map((project) => (
                                <Button
                                    key={project.uuid}
                                    variant={selectedServices.includes(project.name) ? "secondary" : "outline"}
                                    className="mb-2"
                                    onClick={() => {
                                      setSelectedServices((prevSelected) =>
                                          prevSelected.includes(project.name)
                                              ? prevSelected.filter((item) => item !== project.name)
                                              : [...prevSelected, project.name],
                                      )
                                    }}
                                >
                                  {project.name}
                                </Button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label className="text-lg font-semibold mb-2 block">Selected Services (Drag to reorder)</Label>
                          <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) => {
                                const { active, over } = event
                                if (active.id !== over?.id) {
                                  setSelectedServices((items) => {
                                    const oldIndex = items.indexOf(active.id as string)
                                    const newIndex = items.indexOf(over?.id as string)
                                    return arrayMove(items, oldIndex, newIndex)
                                  })
                                }
                              }}
                          >
                            <SortableContext items={selectedServices} strategy={verticalListSortingStrategy}>
                              <ul className="space-y-2">
                                <AnimatePresence>
                                  {selectedServices.map((service) => (
                                      <SortableItem key={service} id={service}>
                                        <div className="flex items-center justify-between space-x-2 p-3 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                          <div className="flex items-center space-x-2">
                                            <GripVertical className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium text-gray-700">{service}</span>
                                          </div>
                                          <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setSelectedServices(selectedServices.filter((s) => s !== service))}
                                              className="text-red-500 hover:text-red-700"
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </SortableItem>
                                  ))}
                                </AnimatePresence>
                              </ul>
                            </SortableContext>
                          </DndContext>
                        </div>
                        <Button
                            onClick={() => handleCreateExistingProject(existingProjectName)}
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={!existingProjectName || !!error}
                        >
                          Create Project
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="spring-projects" className="space-y-4 w-full">
          <TabsList className="w-full flex">
            <TabsTrigger
                value="spring-projects"
                className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              Spring Projects
            </TabsTrigger>
            <TabsTrigger value="erd" className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Project Relationships
            </TabsTrigger>
            <TabsTrigger
                value="build-history"
                className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              Build History
            </TabsTrigger>
          </TabsList>

          {/* Spring Projects Tab */}
          <TabsContent value="spring-projects" className="space-y-4">
            {springProjects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {springProjects.map((project) => (
                      <Card key={project.uuid}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link href={`/workspace/sub-workspace/${params?.name}/${project.name}`}>Go to Detail</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDeleteProject(project)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Branch:</span>
                              <span>{project.branch}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Namespace:</span>
                              <span>{project.namespace}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Git:</span>
                              <span className="truncate max-w-[150px]">{project.git}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
            ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">No Spring Projects available.</p>
                </div>
            )}
          </TabsContent>

          {/* Project Relationships Tab */}
          <TabsContent value="erd" className="space-y-4">
            {springProjects.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Microservices Relationship Diagram</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[600px] border rounded-md">
                      <ERDDiagram projects={springProjects} />
                    </div>
                  </CardContent>
                </Card>
            ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">No projects available to show relationships.</p>
                </div>
            )}
          </TabsContent>

          {/* Build History Tab */}
          <TabsContent value="build-history" className="space-y-4">
            {Array.isArray(buildNumber) && buildNumber.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Build History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project Name</TableHead>
                          <TableHead>Build #</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buildNumber.map((build: BuildHistoryItem) => (
                            <TableRow key={build.buildNumber}>
                              <TableCell>{params?.name}</TableCell>
                              <TableCell>{build.buildNumber}</TableCell>
                              <TableCell>
                                <Badge
                                    variant={
                                      build.status === "SUCCESS"
                                          ? "default"
                                          : build.status === "FAILURE"
                                              ? "destructive"
                                              : "secondary"
                                    }
                                >
                                  {build.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-2" />
                                  <Link
                                      href={`/workspace/sub-workspace/${params?.name}/${params?.name}/${build?.buildNumber}`}
                                  >
                                    View Log
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">No build history available.</p>
                </div>
            )}
          </TabsContent>
        </Tabs>

        <SpringInitializer
            isOpen={isSpringInitializerOpen}
            onClose={() => {
              setIsSpringInitializerOpen(false)
              setExistingProjectName("")
            }}
            folder={params?.name ?? ""}
            springProjects={springProjects}
            refetch={refetch}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project &#34;{projectToDelete?.name}&#34;
                and remove all of its data. To confirm, please enter the project name below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <input
                  type="text"
                  value={deleteConfirmationName}
                  onChange={handleDeleteConfirmationNameChange}
                  placeholder="Enter project name to confirm"
                  className="w-full p-2 border rounded"
              />
              {deleteConfirmationError && <p className="text-red-500 text-sm mt-1">{deleteConfirmationError}</p>}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                  onClick={() => {
                    setDeleteConfirmationName("")
                    setDeleteConfirmationError("")
                  }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProject}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <GitCommandModal
            isOpen={isGitCommandModalOpen}
            onClose={() => setIsGitCommandModalOpen(false)}
            commands={gitCommands}
            clear={() => setExistingProjectName(null)}
        />
      </div>
  )
}

