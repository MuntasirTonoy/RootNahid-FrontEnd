"use client";

export default function SubjectCard({
  subject,
  courseId,
  isSelected,
  onClick,
  isPurchased,
}) {
  return (
    <div
      onClick={isPurchased ? null : onClick}
      className={`relative p-4 md:p-6 rounded-md border transition-all duration-200 flex flex-col justify-between h-full
        ${
          isPurchased
            ? "bg-muted/10 border-border opacity-70 cursor-not-allowed"
            : `cursor-pointer ${
                isSelected
                  ? "bg-primary/5 dark:bg-primary/10 border-primary ring-1 ring-primary"
                  : "bg-card border-border hover:border-primary/30 hover:bg-surface hover:-translate-y-1"
              }`
        }`}
    >
      {isPurchased && (
        <div className="absolute top-2 right-2 bg-green-500 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-md z-10">
          Purchased
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        {!isPurchased && (
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
          ${isSelected ? "bg-primary border-primary" : "border-border"}`}
          >
            {isSelected && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-base md:text-lg font-bold text-card-foreground mb-1 line-clamp-1">
          {subject.title}
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {subject.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto border-t border-border pt-4">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <span className="text-sm md:text-base font-bold text-primary">
            {subject.price} TK
          </span>
          {subject.originalPrice && (
            <span className="text-[10px] md:text-xs text-muted-foreground/60 line-through">
              {subject.originalPrice} TK
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
