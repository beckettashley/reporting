"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ArticleDetailsRenderer({ avatar, authorName, date, variant }: {
  avatar?: string
  authorName?: string
  date?: string
  variant?: string
}) {
  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {avatar && (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={avatar} alt={authorName || "Author"} />
            <AvatarFallback>{authorName?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        {authorName && <span className="font-medium text-gray-900">{authorName}</span>}
        {date && <><span>•</span><span>{date}</span></>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {avatar && (
        <Avatar className="shrink-0" style={{ width: 35, height: 35 }}>
          <AvatarImage src={avatar} alt={authorName || "Author"} />
          <AvatarFallback>{authorName?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div>
        {authorName && (
          <p className="text-gray-800" style={{ fontSize: 12, lineHeight: 1.5 }}>By <strong>{authorName}</strong></p>
        )}
        {date && (
          <p className="text-gray-500" style={{ fontSize: 12, lineHeight: 1.5 }}>Last Updated <span>{date}</span></p>
        )}
      </div>
    </div>
  )
}
