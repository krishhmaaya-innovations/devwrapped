"use client";

import { Suspense } from "react";
import { BattleForm } from "./battle-form";

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      }
    >
      <BattleForm />
    </Suspense>
  );
}

