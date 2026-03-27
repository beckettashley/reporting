"use client"

import { useState } from "react"
import { CellContent } from "@/types/grid"
import { COMPONENT_LIBRARY, CATEGORIES, ComponentDefinition } from "./component-library"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface ComponentPickerProps {
  onSelect: (content: CellContent) => void
  trigger?: React.ReactNode
}

export function ComponentPicker({ onSelect, trigger }: ComponentPickerProps) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("typography")

  const handleSelect = (component: ComponentDefinition) => {
    onSelect(component.defaultContent as CellContent)
    setOpen(false)
  }

  const filteredComponents = COMPONENT_LIBRARY.filter(
    (c) => c.category === activeCategory
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Component
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Component Library</DialogTitle>
          <DialogDescription>
            Select a component to add to this cell
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 mt-4">
          {/* Categories sidebar */}
          <div className="w-32 shrink-0 space-y-1">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Components grid */}
          <div className="flex-1 grid grid-cols-2 gap-2 content-start max-h-[400px] overflow-y-auto">
            {filteredComponents.map((component) => (
              <button
                key={component.type}
                onClick={() => handleSelect(component)}
                className={cn(
                  "flex flex-col items-start gap-2 p-4 rounded-lg border border-border",
                  "bg-card hover:bg-muted hover:border-muted-foreground transition-all",
                  "text-left"
                )}
              >
                <div className="flex items-center gap-2 text-foreground">
                  {component.icon}
                  <span className="font-medium text-sm">{component.label}</span>
                </div>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {component.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
