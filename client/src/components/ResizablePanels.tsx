import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

interface ResizablePanelProps extends React.ComponentProps<typeof ResizablePrimitive.Panel> {
  defaultSize?: number;
  minSize?: number;
  children?: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  collapsedSize?: number;
  onCollapse?: (collapsed: boolean) => void;
  isCollapsed?: boolean;
}

export function ResizablePanel({
  defaultSize = 20,
  minSize = 15,
  children,
  className,
  collapsible,
  collapsedSize = 4,
  onCollapse,
  isCollapsed,
  ...props
}: ResizablePanelProps) {
  return (
    <ResizablePrimitive.Panel
      defaultSize={defaultSize}
      minSize={collapsible ? collapsedSize : minSize}
      className={cn("transition-all duration-300 ease-in-out", className)}
      {...props}
    >
      {children}
    </ResizablePrimitive.Panel>
  );
}

export function ResizableHandle({ withHandle = false, className }: { withHandle?: boolean, className?: string }) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        className
      )}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <DragHandleDots2Icon className="h-2.5 w-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export function ResizablePanelGroup({
  children,
  direction = "horizontal",
  className,
}: {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <ResizablePrimitive.PanelGroup
      direction={direction}
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
    >
      {children}
    </ResizablePrimitive.PanelGroup>
  );
}