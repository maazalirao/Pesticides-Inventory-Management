import * as React from "react";
import { cn } from "../../lib/utils";

// A responsive table component that supports both traditional table view and card view
const ResponsiveTable = React.forwardRef(({ className, children, ...props }, ref) => {
  // Use refs to identify the table headers
  const tableRef = React.useRef(null);
  const [headers, setHeaders] = React.useState([]);
  
  // Find all th elements in the thead when the component mounts
  React.useEffect(() => {
    if (tableRef.current) {
      const headerElements = tableRef.current.querySelectorAll('thead th');
      const headerTexts = Array.from(headerElements).map(th => th.textContent || '');
      setHeaders(headerTexts);
    }
  }, []);

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* The actual table - visible on all screen sizes, but styled differently on small screens */}
      <table ref={tableRef} className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  );
});
ResponsiveTable.displayName = "ResponsiveTable";

// Table header that's hidden on mobile
const ResponsiveTableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
ResponsiveTableHeader.displayName = "ResponsiveTableHeader";

// Table body that's used for creating card versions on mobile
const ResponsiveTableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
ResponsiveTableBody.displayName = "ResponsiveTableBody";

// Card layout container for mobile views
const ResponsiveTableCardContainer = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
));
ResponsiveTableCardContainer.displayName = "ResponsiveTableCardContainer";

// Individual card for mobile views
const ResponsiveTableCard = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden", className)}
    {...props}
  />
));
ResponsiveTableCard.displayName = "ResponsiveTableCard";

// Card row for data
const ResponsiveTableCardRow = React.forwardRef(({ className, label, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between border-b last:border-b-0 px-4 py-3", className)}
    {...props}
  >
    {label && <span className="font-medium text-muted-foreground text-sm">{label}:</span>}
    <div className="text-right">{props.children}</div>
  </div>
));
ResponsiveTableCardRow.displayName = "ResponsiveTableCardRow";

// Card actions row
const ResponsiveTableCardActions = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end gap-2 p-4 bg-muted/50", className)}
    {...props}
  />
));
ResponsiveTableCardActions.displayName = "ResponsiveTableCardActions";

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableCardContainer,
  ResponsiveTableCard,
  ResponsiveTableCardRow,
  ResponsiveTableCardActions
}; 