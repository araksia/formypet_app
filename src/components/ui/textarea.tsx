import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      // Scroll textarea into view when keyboard opens
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-focus-visible",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
