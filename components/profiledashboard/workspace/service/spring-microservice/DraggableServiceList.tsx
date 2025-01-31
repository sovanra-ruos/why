import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { AnimatePresence } from "framer-motion"
import { SortableItem } from "./SortableItem"

interface DraggableServiceListProps {
    services: string[]
    onServicesChange: (newServices: string[]) => void
}

export function DraggableServiceList({ services, onServicesChange }: DraggableServiceListProps) {
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = services.indexOf(active.id.toString())
            const newIndex = services.indexOf(over.id.toString())
            const newServices = arrayMove(services, oldIndex, newIndex)
            onServicesChange(newServices)
        }
    }

    const handleRemoveService = (id: string) => {
        const newServices = services.filter((service) => service !== id)
        onServicesChange(newServices)
    }

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={services} strategy={verticalListSortingStrategy}>
                <AnimatePresence>
                    {services.map((service) => (
                        <SortableItem key={service} id={service} onRemove={handleRemoveService} />
                    ))}
                </AnimatePresence>
            </SortableContext>
        </DndContext>
    )
}

