import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { X, GripVertical } from "lucide-react"
import { motion } from "framer-motion"

interface SortableItemProps {
    id: string
    onRemove: (id: string) => void
}

export function SortableItem({ id, onRemove }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <motion.li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex justify-between items-center mb-2 cursor-move"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
        >
      <span className="flex items-center">
        <GripVertical className="mr-2 h-4 w-4" />
          {id}
      </span>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                className="text-primary-foreground hover:text-primary-foreground/80"
            >
                <X className="h-4 w-4" />
            </Button>
        </motion.li>
    )
}

