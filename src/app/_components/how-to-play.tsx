"use client";

import { useState } from "react";
import { HelpCircleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export function HowToPlay() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
          <HelpCircleIcon className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">how to play</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-5 text-xs sm:text-sm">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="font-medium text-sm">making picks</p>
            <p className="text-muted-foreground leading-relaxed">
              predict the scoreline for each match before it kicks off. once a match starts, your pick locks and you cannot change it.
            </p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <p className="font-medium text-sm">scoring</p>
            <p className="text-muted-foreground">you <span className="text-foreground font-medium">must get the result right</span> (W/D/L) to score anything. if you do, you can earn up to 3 bonus pts on top:</p>
            <div className="rounded-md border divide-y">
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2">
                <span className="text-muted-foreground">correct result (W/D/L)</span>
                <span className="font-medium tabular-nums">1 pt</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2 bg-muted/40">
                <span className="text-muted-foreground">exact home score</span>
                <span className="font-medium tabular-nums">+1 pt</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2 bg-muted/40">
                <span className="text-muted-foreground">exact away score</span>
                <span className="font-medium tabular-nums">+1 pt</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2 bg-muted/40">
                <span className="text-muted-foreground">exact goal difference</span>
                <span className="font-medium tabular-nums">+1 pt</span>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">wrong result = 0 pts, no matter how close the scores are.</p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <p className="font-medium text-sm">multipliers</p>
            <p className="text-muted-foreground">multipliers change based on the round, with harder and more unpredictable rounds weighing more.</p>
            <div className="rounded-md border divide-y">
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2">
                <span className="text-muted-foreground">group stage</span>
                <span className="font-medium tabular-nums">×0.5</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2">
                <span className="text-muted-foreground">round of 32</span>
                <span className="font-medium tabular-nums">×1.0</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2">
                <span className="text-muted-foreground">round of 16</span>
                <span className="font-medium tabular-nums">×2.0</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2">
                <span className="text-muted-foreground">quarterfinals</span>
                <span className="font-medium tabular-nums">×2.5</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2">
                <span className="text-muted-foreground">semifinals</span>
                <span className="font-medium tabular-nums">×3.5</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 sm:py-2">
                <span className="text-muted-foreground">final</span>
                <span className="font-medium tabular-nums">×4.0</span>
              </div>
            </div>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <p className="font-medium text-sm">seeing other picks</p>
            <p className="text-muted-foreground leading-relaxed">
              you cannot see what anyone else picked until the match kicks off. once it starts, everyone&apos;s picks are visible.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
