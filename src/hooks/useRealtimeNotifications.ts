import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusLabel = (status: string) => status.replace(/_/g, " ");

export function useRealtimeNotifications() {
  useEffect(() => {
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const setup = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      userId = data.session?.user.id ?? null;

      channel = supabase
        .channel("realtime-notifications")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "reports" },
          (payload) => {
            const next = payload.new as any;
            const prev = payload.old as any;
            if (!next || prev?.status === next.status) return;
            if (userId && next.user_id !== userId) return;

            if (next.status === "verified") {
              toast.success("Report approved", {
                description: `"${next.title}" has been verified.`,
              });
            } else if (next.status === "rejected") {
              toast.error("Report rejected", {
                description: `"${next.title}" was not approved.`,
              });
            } else {
              toast("Report updated", {
                description: `"${next.title}" is now ${statusLabel(next.status)}.`,
              });
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "projects" },
          (payload) => {
            const next = payload.new as any;
            const prev = payload.old as any;
            if (!next || prev?.status === next.status) return;
            toast("Project status changed", {
              description: `"${next.title}" is now ${statusLabel(next.status)}.`,
            });
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "projects" },
          (payload) => {
            const next = payload.new as any;
            if (!next) return;
            toast("New project started", { description: next.title });
          }
        )
        .subscribe();
    };

    setup();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      userId = session?.user.id ?? null;
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);
}
