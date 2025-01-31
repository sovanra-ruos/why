'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Layout, Server, Database, Share2 } from 'lucide-react'
import { FrontendForm } from "@/components/profiledashboard/workspace/FrontendForm"
import { BackendForm } from "@/components/profiledashboard/workspace/BackendForm"
import { DatabaseForm } from "@/components/profiledashboard/workspace/DatabaseForm"
import { SubworkspaceForm } from "@/components/profiledashboard/workspace/Subworkspaceform"
import GitlabImportForm from "@/components/profiledashboard/workspace/GitlabImportForm"
import { ZipUploadForm } from "@/components/profiledashboard/workspace/ZipUploadForm"

import { Progress } from "@/components/ui/progress"
import { FrontendOptions, FrontendOptionType } from "@/components/profiledashboard/workspace/FrontendOptions"
import { BackendOptions, BackendOptionType } from "@/components/profiledashboard/workspace/BackendOptions"
import { ProjectTypeCard } from "@/components/profiledashboard/workspace/ProjectTypeCard"

interface CreateProjectContentProps {
    onClose: () => void;
    selectedWorkspace: string;
    data1: () => void;
    data2: () => void;
}

const projectTypes = [
    {
        type: 'frontend',
        icon: Layout,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        label: 'Frontend',
        description: 'Create a new frontend project with modern web technologies.'
    },
    {
        type: 'backend',
        icon: Server,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        label: 'Backend',
        description: 'Set up a powerful backend to support your application.'
    },
    {
        type: 'database',
        icon: Database,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        label: 'Database',
        description: 'Configure a database to store and manage your data efficiently.'
    },
    {
        type: 'subworkspace',
        icon: Share2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'Microservice',
        description: 'Create a subworkspace to organize your projects better.'
    },
] as const

type ProjectType = typeof projectTypes[number]['type']

export default function CreateProjectContent({ onClose, selectedWorkspace, data1, data2 }: CreateProjectContentProps) {
    const [selectedType, setSelectedType] = useState<ProjectType | null>(null)
    const [selectedFrontendOption, setSelectedFrontendOption] = useState<FrontendOptionType | null>(null)
    const [selectedBackendOption, setSelectedBackendOption] = useState<BackendOptionType | null>(null)
    const [progress, setProgress] = useState(0)

    const handleProjectTypeSelect = useCallback((type: ProjectType) => {
        setSelectedType(type)
        setSelectedFrontendOption(null)
        setSelectedBackendOption(null)
        setProgress(33)
    }, [])

    const handleFrontendOptionSelect = useCallback((option: FrontendOptionType) => {
        setSelectedFrontendOption(option)
        setProgress(66)
    }, [])

    const handleBackendOptionSelect = useCallback((option: BackendOptionType) => {
        setSelectedBackendOption(option)
        setProgress(66)
    }, [])

    const renderProjectForm = useMemo(() => {
        if (selectedType === 'frontend') {
            switch (selectedFrontendOption) {
                case 'github':
                    return <FrontendForm onClose={onClose} selectedWorkspace={selectedWorkspace} data1={data1}/>;
                case 'gitlab':
                    return <GitlabImportForm onClose={onClose} selectedWorkspace={selectedWorkspace} data1={data1} />;
                case 'zipUpload':
                    return <ZipUploadForm onClose={onClose} selectedWorkspace={selectedWorkspace} data1={data1}/>;
                default:
                    return null;
            }
        }

        if (selectedType === 'backend') {
            switch (selectedBackendOption) {
                case 'github':
                    return <BackendForm onClose={onClose} selectedWorkspace={selectedWorkspace} data1={data1}/>;
                case 'gitlab':
                    return <GitlabImportForm onClose={onClose} selectedWorkspace={selectedWorkspace} data1={data1}/>;
                case 'zipUpload':
                    return <ZipUploadForm onClose={onClose} selectedWorkspace={selectedWorkspace} data1={data1} />;
                default:
                    return null;
            }
        }

        switch (selectedType) {
            case 'database':
                return <DatabaseForm onClose={onClose} selectedWorkspace={selectedWorkspace} />;
            case 'subworkspace':
                return <SubworkspaceForm onClose={onClose} selectedWorkspace={selectedWorkspace} data2={data2}/>;
            default:
                return null;
        }
    }, [selectedType, selectedFrontendOption, selectedBackendOption, onClose, selectedWorkspace, data1, data2])

    return (
        <div className="flex flex-col h-full max-h-[80vh]">
            <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Create New Project</DialogTitle>
                <DialogDescription className="text-lg dark:text-white">
                    Choose a project type and enter the required information
                </DialogDescription>
            </DialogHeader>

            <Progress value={progress} className="w-full" />

            <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        {!selectedType && (
                            <motion.div
                                key="project-types"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-semibold mb-4 text-purple-500">Select a project type:</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {projectTypes.map((projectType) => (
                                        <ProjectTypeCard
                                            key={projectType.type}
                                            {...projectType}
                                            isSelected={selectedType === projectType.type}
                                            onClick={() => handleProjectTypeSelect(projectType.type)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {selectedType === 'frontend' && !selectedFrontendOption && (
                            <FrontendOptions
                                selectedOption={selectedFrontendOption}
                                onOptionSelect={handleFrontendOptionSelect}
                            />
                        )}
                        {selectedType === 'backend' && !selectedBackendOption && (
                            <BackendOptions
                                selectedOption={selectedBackendOption}
                                onOptionSelect={handleBackendOptionSelect}
                            />
                        )}
                        {((selectedType !== 'frontend' && selectedType !== 'backend') || selectedFrontendOption || selectedBackendOption) && (
                            <motion.div
                                key={`${selectedType}-${selectedFrontendOption}-${selectedBackendOption}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderProjectForm}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    )
}

