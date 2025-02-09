"use client"

import { useCallback, useState, useRef } from "react"
import ReactFlow, {
    type Node,
    type Edge,
    Background,
    Controls,
    type NodeProps,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    type ReactFlowInstance,
} from "reactflow"
import "reactflow/dist/style.css"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"
import {toPng} from "html-to-image";

interface ColumnInfo {
    column_name: string
    data_type: string
    is_foreign_key?: boolean
    references_table?: string
    references_column?: string
}

interface TableInfo {
    table_name: string
    columns: ColumnInfo[]
}

interface DatabaseFlowProps {
    tables: TableInfo[]
}

const TableNode = ({ data }: NodeProps) => {
    return (
        <div className="px-4 py-3 rounded-lg border bg-white shadow-lg min-w-[200px]">
            <Handle type="target" position={Position.Top} className="!bg-purple-500" />
            <div className="border-b pb-2 mb-2">
                <h3 className="font-medium text-sm">{data.table_name}</h3>
            </div>
            <div className="space-y-1">
                {data.columns.map((column: ColumnInfo, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">{column.column_name}</span>
                        <span className="text-gray-500 ml-4">{column.data_type}</span>
                    </div>
                ))}
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
        </div>
    )
}

const nodeTypes = {
    table: TableNode,
}

export function DatabaseFlow({ tables }: DatabaseFlowProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
    const reactFlowWrapper = useRef<HTMLDivElement>(null)

    // Create nodes from tables
    const initialNodes: Node[] = tables.map((table, index) => ({
        id: table.table_name,
        type: "table",
        data: table,
        position: { x: index * 300, y: index * 100 },
    }))

    // Create edges from foreign key relationships
    const initialEdges: Edge[] = tables.flatMap((table) =>
        table.columns
            .filter((column) => column.is_foreign_key && column.references_table)
            .map((column) => ({
                id: `${table.table_name}-${column.references_table}-${column.column_name}`,
                source: table.table_name,
                target: column.references_table!,
                animated: true,
                style: { stroke: "#a855f7" },
            })),
    )

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onLayout = useCallback(() => {
        if (reactFlowInstance) {
            const nodeWidth = 200
            const nodeHeight = 200
            const gapHorizontal = 100
            const gapVertical = 100

            const layoutedNodes = nodes.map((node, index) => {
                const columns = Math.ceil(Math.sqrt(nodes.length))
                const row = Math.floor(index / columns)
                const col = index % columns
                return {
                    ...node,
                    position: {
                        x: col * (nodeWidth + gapHorizontal),
                        y: row * (nodeHeight + gapVertical),
                    },
                }
            })

            setNodes(layoutedNodes)
            reactFlowInstance.fitView()
        }
    }, [nodes, setNodes, reactFlowInstance])

    const handleSearch = useCallback(() => {
        const filteredNodes = initialNodes.filter((node) =>
            node.data.table_name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setNodes(filteredNodes)
        // Adjust edges to only include those connected to visible nodes
        const filteredEdges = initialEdges.filter(
            (edge) =>
                filteredNodes.some((node) => node.id === edge.source) && filteredNodes.some((node) => node.id === edge.target),
        )
        setEdges(filteredEdges)
    }, [searchTerm, initialNodes, initialEdges, setNodes, setEdges])

    const exportImage = useCallback(() => {
        if (reactFlowWrapper.current) {
            toPng(reactFlowWrapper.current)
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = 'database-schema.png';
                    link.href = dataUrl;
                    link.click();
                })
                .catch((error) => {
                    console.error('Error exporting image:', error);
                });
        }
    }, [reactFlowWrapper]);

    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                <Input
                    type="text"
                    placeholder="Search tables..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Button onClick={handleSearch} className="bg-purple-500 hover:bg-purple-600 text-white">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                </Button>
                <Button onClick={onLayout} className="bg-blue-500 hover:bg-blue-600 text-white">
                    Auto Layout
                </Button>
                <Button onClick={exportImage} className="bg-green-500 hover:bg-green-600 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </div>
            <div ref={reactFlowWrapper} className="h-[600px] border rounded-lg bg-gray-50">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    onInit={setReactFlowInstance}
                    className="bg-gray-50"
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    )
}

