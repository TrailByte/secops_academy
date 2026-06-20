import { useState } from "react";
import { Link } from "wouter";
import * as Icons from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useLearningPaths, useDeleteLearningPath } from "@/hooks/use-admin-learning-paths";
import { Loader2, Plus, Pencil, Trash2, ShieldAlert } from "lucide-react";

function IconPreview({ name, className }: { name: string; className?: string }) {
  const Comp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!Comp) return <Icons.HelpCircle className={className} />;
  return <Comp className={className} />;
}

export default function AdminLearningPaths() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: paths, isLoading: pathsLoading } = useLearningPaths();
  const deletePath = useDeleteLearningPath();
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-20">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold mb-2">Admin access required</h1>
          <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  const handleDelete = (slug: string) => {
    setDeleteError(null);
    if (pendingDeleteSlug !== slug) {
      setPendingDeleteSlug(slug);
      return;
    }
    deletePath.mutate(slug, {
      onError: (err) => setDeleteError(err instanceof Error ? err.message : "Failed to delete"),
      onSettled: () => setPendingDeleteSlug(null),
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6 text-sm">
          <Link href="/admin/challenges">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer">Challenges</span>
          </Link>
          <span className="text-foreground font-medium">Learning Paths</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">// Admin</span>
            <h1 className="text-3xl font-display font-bold tracking-tight">Learning Paths</h1>
          </div>
          <Link href="/admin/learning-paths/new">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 cursor-pointer transition-opacity">
              <Plus className="w-4 h-4" />
              New Learning Path
            </span>
          </Link>
        </div>

        {deleteError && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {deleteError}
          </div>
        )}

        {pathsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !paths || paths.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No learning paths yet. Create your first one.
          </div>
        ) : (
          <div className="space-y-3">
            {paths.map((p) => (
              <div
                key={p.slug}
                className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-muted/30 border border-border flex items-center justify-center flex-shrink-0">
                    <IconPreview name={p.icon} className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold truncate">{p.title}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground/60">#{p.order}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">/{p.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/learning-paths/${p.slug}/edit`}>
                    <span className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 cursor-pointer transition-colors inline-flex">
                      <Pencil className="w-4 h-4" />
                    </span>
                  </Link>
                  <button
                    onClick={() => handleDelete(p.slug)}
                    disabled={deletePath.isPending}
                    className={`p-2 rounded-lg border text-sm transition-colors inline-flex items-center gap-1.5 ${
                      pendingDeleteSlug === p.slug
                        ? "border-red-500/50 bg-red-500/10 text-red-400 px-3"
                        : "border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {pendingDeleteSlug === p.slug && (deletePath.isPending ? "Deleting..." : "Confirm?")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
