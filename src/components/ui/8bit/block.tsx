import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Block({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("block", className)} {...props} />;
}
