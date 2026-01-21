"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChapterList({ chapters, courseId, subjectId }) {
  const router = useRouter();
  const [openChapter, setOpenChapter] = useState(null);

  const toggleChapter = (id) => {
    setOpenChapter(openChapter === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          className="border border-white/10 rounded-md overflow-hidden bg-white/5 backdrop-blur-md"
        >
          <button
            onClick={() => toggleChapter(chapter.id)}
            className="w-full text-left p-4 flex justify-between items-center hover:bg-white/5 transition-colors"
          >
            <span className="font-semibold text-lg text-white">
              {chapter.title}
            </span>
            <span
              className={`transform transition-transform ${openChapter === chapter.id ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {openChapter === chapter.id && (
            <div className="border-t border-white/10 bg-black/20">
              {chapter.parts.map((part) => (
                <div
                  key={part.id}
                  className="p-3 pl-8 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                  onClick={() =>
                    router.push(
                      `/learn/${courseId}/${subjectId}?chapter=${chapter.id}&part=${part.id}`,
                    )
                  }
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    ▶
                  </div>
                  <span className="text-gray-300 hover:text-white transition-colors">
                    {part.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
