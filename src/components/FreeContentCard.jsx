import Link from "next/link";
import { Play } from "lucide-react";

export default function FreeContentCard({ video }) {
  const videoId =
    video.videoUrl?.match(/[\?&]v=([^&#]*)/)?.[1] ||
    video.videoUrl?.split("/").pop();
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  return (
    <Link
      href={
        video.subjectId
          ? `/learn/${video.subjectId.courseId}/${video.subjectId._id}?chapter=${encodeURIComponent(video.chapterName)}&part=${video._id}`
          : "#"
      }
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <Play className="w-12 h-12 text-primary/20" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play size={24} fill="currentColor" />
          </div>
        </div>

        {/* Free Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-md border border-primary/10">
            FREE
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="space-y-1">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {video.chapterName}
          </span>
          <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {video.subjectId?.title || "General"}
          </p>
        </div>
      </div>
    </Link>
  );
}
