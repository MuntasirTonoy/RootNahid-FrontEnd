"use client";
import { Play } from "lucide-react";
import { useState, useEffect } from "react";

export default function LessonSidebar({
  chapters,
  currentChapterId,
  currentPartId,
  onSelect,
  onClose,
}) {
  const [openChapters, setOpenChapters] = useState([currentChapterId]);

  useEffect(() => {
    if (currentChapterId && !openChapters.includes(currentChapterId)) {
      setOpenChapters((prev) => [...prev, currentChapterId]);
    }
  }, [currentChapterId]);

  const toggleChapter = (id) => {
    if (openChapters.includes(id)) {
      setOpenChapters(openChapters.filter((c) => c !== id));
    } else {
      setOpenChapters([...openChapters, id]);
    }
  };

  return (
    <div className="h-full bg-background border-r border-border flex flex-col transition-colors duration-300">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="font-bold text-foreground text-lg">Course Content</h2>
          <div className="flex items-center gap-2 mt-2"></div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-surface rounded-lg text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="rounded-md overflow-hidden border border-border"
          >
            <button
              onClick={() => toggleChapter(chapter.id)}
              className={`w-full p-4 flex justify-between items-center text-left font-bold transition-colors
                     ${openChapters.includes(chapter.id) ? "bg-primary/10 text-foreground" : "bg-card text-muted-foreground hover:bg-surface"}`}
            >
              <span>{chapter.title}</span>
              <span
                className={`transform transition-transform ${openChapters.includes(chapter.id) ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {openChapters.includes(chapter.id) && (
              <div className="bg-card">
                {chapter.parts.map((part) => {
                  const isActive =
                    part.id === currentPartId &&
                    chapter.id === currentChapterId;
                  return (
                    <button
                      key={part.id}
                      onClick={() => onSelect(chapter.id, part.id)}
                      className={`w-full p-3 pl-6 flex items-center gap-3 text-left transition-colors border-l-4
                                 ${
                                   isActive
                                     ? "border-primary bg-primary/5"
                                     : "border-transparent hover:bg-surface"
                                 }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex-none flex items-center justify-center text-xs font-bold
                                 ${isActive ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"}`}
                      >
                        {part.partNumber}
                      </div>
                      <span
                        className={`text-sm font-medium ${isActive ? "text-foreground font-bold" : "text-muted-foreground"}`}
                      >
                        <span className="opacity-70 mr-1">
                          Part {part.partNumber}:
                        </span>
                        {part.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
