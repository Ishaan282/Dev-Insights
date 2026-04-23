'use client'
import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink, GitCommitHorizontal } from 'lucide-react'

const CommitLog = () => {
    const { projectId, project } = useProject()
    const { data: commits } = api.project.getCommits.useQuery({ projectId })

    return (
        <ul className="space-y-1">
            {commits?.map((commit, commitIdx) => (
                <li key={commit.id} className="relative flex gap-x-3">

                    {/* ── Timeline rail ───────────────────────────── */}
                    <div className={cn(
                        'absolute left-[27px] top-0 w-px bg-border',
                        commitIdx === commits.length - 1 ? 'h-10' : 'h-full'
                    )} />

                    {/* ── Avatar column ───────────────────────────── */}
                    <div className="relative z-10 mt-4 flex flex-col items-center gap-1">
                        <GitCommitHorizontal className="size-4 text-muted-foreground" />
                        <img
                            src={commit.commitAutherAvatar || '/default-avatar.png'}
                            alt={commit.commitAuthorName}
                            className="size-7 rounded-full bg-muted object-cover ring-1 ring-border"
                        />
                    </div>

                    {/* ── Commit card ─────────────────────────────── */}
                    <div className="mb-3 flex-auto overflow-hidden rounded-md border border-border bg-card px-4 py-3 dark:border-border/60">

                        {/* Header row */}
                        <div className="flex items-center justify-between gap-x-4">
                            <Link
                                target="_blank"
                                href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                                className="group flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <span className="font-medium text-foreground/80">
                                    {commit.commitAuthorName}
                                </span>
                                <span>committed</span>
                                <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>

                            {commit.commitDate && (
                                <time className="shrink-0 text-[11px] tabular-nums text-muted-foreground/60">
                                    {new Date(commit.commitDate).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                </time>
                            )}
                        </div>

                        {/* Commit message — monospace, primary hierarchy */}
                        <p className="mt-1.5 font-mono text-sm font-medium leading-snug text-foreground">
                            {commit.commitMessage}
                        </p>

                        {/* AI summary block — VS Code output-panel style */}
                        {commit.summary && (
                            <div className="mt-3 rounded-r-md border-l-2 border-primary/50 bg-muted/60 py-2.5 pl-3 pr-2 dark:border-primary/40 dark:bg-muted/30">
                                <p className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                                    AI Summary
                                </p>
                                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                                    {commit.summary}
                                </pre>
                            </div>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default CommitLog
