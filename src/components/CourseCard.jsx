import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <div className="group relative bg-card rounded-3xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full overflow-hidden w-full max-w-[400px]">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100 duration-500"></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Thumbnail - Added as requested */}
        <div className="mb-4 rounded-2xl overflow-hidden aspect-video relative bg-muted">
          <img
            src={course.coverImage || course.thumbnail}
            alt={course.title}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-1">
              {course.shortDescription}
            </p>
          </div>
        </div>

        {/* Features (optional, keeping if useful, but user focused on thumbnail/price removal) */}
        <div className="space-y-2 mb-6 flex-grow">
          {course.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md mr-2"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action - Direct Link - No Modal */}
        <Link
          href={`/course/${course.id}`}
          className="relative w-full py-4 bg-foreground text-background font-bold rounded-md hover:bg-primary hover:text-white transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-primary/30 mt-auto flex items-center justify-center gap-2 group/btn overflow-hidden"
        >
          <span className="relative z-10">Enroll Now</span>
          <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
