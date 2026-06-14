import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment } from "@/lib/types";
import { initials, smartDateTime } from "@/lib/format";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

function CommentRow({ comment }: { comment: Comment }) {
  const isHost = comment.author === "You";
  return (
    <div className="flex gap-3">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isHost
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground",
        )}
      >
        {initials(comment.author)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author}
          </span>
          <span className="text-xs text-muted-foreground">
            {smartDateTime(comment.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {comment.body}
        </p>
      </div>
    </div>
  );
}

export function CommentsSection({
  issueId,
  comments,
}: {
  issueId: string;
  comments: Comment[];
}) {
  const addComment = useStore((s) => s.addComment);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    addComment(issueId, body, "You");
    setDraft("");
  };

  return (
    <section className="rounded-xl border border-border bg-card shadow-xs">
      <header className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <MessageSquare className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Internal Comments</h2>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {comments.length}
        </span>
      </header>

      <div className="space-y-5 px-5 py-4">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No comments yet. Start the conversation below.
          </p>
        ) : (
          comments.map((c) => <CommentRow key={c.id} comment={c} />)
        )}
      </div>

      <div className="border-t border-border p-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
          placeholder="Add an internal note for your team…"
          rows={2}
          className="resize-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Visible to your team only · ⌘/Ctrl + Enter to post
          </span>
          <Button size="sm" onClick={submit} disabled={!draft.trim()}>
            <Send className="size-3.5" />
            Comment
          </Button>
        </div>
      </div>
    </section>
  );
}
