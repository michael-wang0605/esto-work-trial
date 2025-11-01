"use client";

import { Plus } from "lucide-react";

export default function AddPropertyCard({ 
  onClick, 
  showBetaPrompt = false 
}: { 
  onClick: () => void;
  showBetaPrompt?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-xl border-2 border-dashed border-border/50 glass h-[280px] hover:border-primary/50 hover:bg-card/60 transition-all group"
      aria-label="Add Property"
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <div className="font-semibold text-foreground mb-1">Add Property</div>
        {showBetaPrompt ? (
          <div className="text-xs text-primary font-medium">Request Beta Access</div>
        ) : (
          <div className="text-xs text-foreground/60">Create a new property</div>
        )}
      </div>
    </button>
  );
}
