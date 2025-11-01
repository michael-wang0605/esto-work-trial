"use client";

import type { Property } from "@/lib/types";
import { Trash2, MessageSquare, Bot, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  property?: Property;
  p?: Property;
  onOpen?: (p: Property) => void;
  onRequestDelete?: (p: Property) => void;
  onDelete?: (p: Property) => void;
}

export default function PropertyCard({
  property,
  p,
  onOpen,
  onRequestDelete,
  onDelete,
}: PropertyCardProps) {
  const router = useRouter();
  const prop = property || p;
  
  if (!prop) return null;

  const handleClick = () => {
    if (onOpen) {
      onOpen(prop);
    } else {
      router.push(`/properties/${prop.id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequestDelete) {
      onRequestDelete(prop);
    } else if (onDelete) {
      onDelete(prop);
    }
  };

  return (
    <div className="group glass-strong rounded-xl overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] relative">
      {/* Clickable area */}
      <button onClick={handleClick} className="w-full text-left">
        <div className="aspect-[16/10] w-full overflow-hidden">
          <img
            src={prop.photo}
            alt={prop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <div className="font-semibold text-foreground line-clamp-1 mb-1">{prop.name}</div>
          <div className="text-xs text-foreground/60 mb-3">{prop.address}</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center justify-center gap-1 text-[11px] px-2 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <MessageSquare className="w-3 h-3" />
              <span>SMS</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] px-2 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Bot className="w-3 h-3" />
              <span>AI</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] px-2 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <ClipboardList className="w-3 h-3" />
              <span>Tickets</span>
            </div>
          </div>
        </div>
      </button>

      {/* Delete button */}
      {(onRequestDelete || onDelete) && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 rounded-full glass-strong hover:bg-destructive/20 transition group/delete"
          aria-label="Delete property"
          title="Delete Property"
        >
          <Trash2 className="h-4 w-4 text-foreground/60 group-hover/delete:text-destructive transition" />
        </button>
      )}
    </div>
  );
}