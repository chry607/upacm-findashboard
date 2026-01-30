"use client";

import { type ProjectTicket } from "@/lib/db/view-general.server";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TicketHistoryProps {
  tickets: ProjectTicket[];
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "approved":
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

export function TicketHistory({ tickets }: TicketHistoryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  if (tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[120px] text-muted-foreground text-sm">
        No projects yet
      </div>
    );
  }

  return (
    <div className="mt-auto">
      <ScrollArea className="h-[140px] h-full">
        <div className="space-y-2 pr-4">
          {tickets.slice(0, 5).map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between py-1.5 border-b last:border-0"
            >
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-medium truncate">{ticket.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ticket.submission_date)}
                </p>
              </div>
              <Badge variant={getStatusVariant(ticket.status)} className="text-xs">
                {ticket.status}
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}