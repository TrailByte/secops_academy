import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import * as Icons from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import {
  useLearningPaths,
  useCreateLearningPath,
  useUpdateLearningPath,
  type LearningPathFormInput,
} from "@/hooks/use-admin-learning-paths";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, ArrowLeft, AlertCircle } from "lucide-react";

const inputClass = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors";

function IconPreview({ name, className }: { name: string; className?: string }) {
  const Comp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!Comp) return <Icons.HelpCircle className={className} />;
  return <Comp className={className} />;
}

export default function AdminLearningPathForm() {
  const { user, isLoading: authLoading } = useAuth();
  const [, editParams] = useRoute("/admin/learning-paths/:slug/edit");
  const [, navigate] = useLocation();
  const isEdit = !!editParams?.slug;
  const editSlug = editParams?.slug;

  const { data: paths, isLoading: pathsLoading } = useLearningPaths();
  const existing = isEdit ? paths?.find((p) => p.slug === editSlug) : undefined;

  const createPath = useCreateLearningPath();
  const updatePath = useUpdateLearningPath(editSlug ?? "");
  const mutation = isEdit ? updatePath : createPath;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Shield");
  const [color, setColor] = useState("blue");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setSlug(existing.slug);
      setDescription(existing.description);
      setIcon(existing.icon);
      setColor(existing.color);
      setOrder(existing.order);
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updatePath.mutate(
        { title, description, icon, color, order },
        { onSuccess: () => navigate("/admin/learning-paths") }
      );
    } else {
      const payload: LearningPathFormInput = { title, slug, description, icon, color, order };
      createPath.mutate(payload, { onSuccess: () => navigate("/admin/learning-paths") });
    }
  };

  if (authLoading || (isEdit && pathsLoading)) {
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

  if (isEdit && !existing) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-4">Learning path not found</h2>
          <Link href="/admin/learning-paths" className="text-primary hover:underline">Back to Learning Paths</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto pb-20">
        <Link href="/admin/learning-paths">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Learning Paths
          </button>
        </Link>

        <h1 className="text-3xl font-display font-bold tracking-tight mb-8">
          {isEdit ? "Edit Learning Path" : "New Learning Path"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Malware Analysis" />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Slug {isEdit && <span className="normal-case text-muted-foreground/60">(locked — lessons & challenges reference this)</span>}
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={isEdit}
              placeholder="e.g. malware-analysis"
              className={isEdit ? "opacity-50 cursor-not-allowed font-mono" : "font-mono"}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Icon <span className="normal-case text-muted-foreground/60">(lucide name)</span>
              </label>
              <div className="flex items-center gap-2">
                <Input value={icon} onChange={(e) => setIcon(e.target.value)} required placeholder="Shield" />
                <div className="w-9 h-9 rounded-md bg-muted/30 border border-border flex items-center justify-center flex-shrink-0">
                  <IconPreview name={icon} className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1.5">
                Browse names at <span className="underline">lucide.dev/icons</span>
              </p>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Order <span className="normal-case text-muted-foreground/60">(display position)</span>
              </label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Color <span className="normal-case text-muted-foreground/60">(theme key — not yet wired to page visuals, reserved for future use)</span>
            </label>
            <Input value={color} onChange={(e) => setColor(e.target.value)} required placeholder="e.g. blue" />
          </div>

          {mutation.isError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {mutation.error instanceof Error ? mutation.error.message : "Something went wrong"}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Learning Path"}
            </Button>
            <Link href="/admin/learning-paths">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
