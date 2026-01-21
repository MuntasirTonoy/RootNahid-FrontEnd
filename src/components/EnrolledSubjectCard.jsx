import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function EnrolledSubjectCard({ subject, courseId }) {
  return (
    <div className="group bg-card border border-border rounded-md p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon & Title */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            {/* Placeholder Icon */}
            <span className="font-bold text-lg">{subject.title.charAt(0)}</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground/50">
            <span className="material-icons text-sm"></span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {subject.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
          {subject.description}
        </p>

        <div className="mt-6 pt-4 border-t border-border flex gap-3">
          <Link
            href={`/learn/${courseId}/${subject.id || subject._id}`}
            className="flex-1 py-3 rounded-md bg-surface hover:bg-primary-hover hover:text-white text-foreground font-bold text-center text-sm hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group/btn"
          >
            Start Learning
            <span className="material-icons text-sm group-hover/btn:translate-x-1 transition-transform">
              <MoveRight />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
