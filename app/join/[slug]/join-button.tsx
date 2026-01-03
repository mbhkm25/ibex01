"use client";

import { useActionState } from "react";
import { joinStore } from "@/app/actions/membership";
import { Button } from "@/components/ui/button";

export function JoinButton({ storeId }: { storeId: number }) {
  const [state, formAction, isPending] = useActionState(joinStore, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="storeId" value={storeId} />
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "جاري الانضمام..." : "انضم للمتجر الآن"}
      </Button>
      {state?.message && (
        <p className="text-sm text-red-500 mt-2">{state.message}</p>
      )}
    </form>
  );
}

