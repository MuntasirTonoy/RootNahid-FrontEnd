"use client";

export default function SubjectCard({ subject, courseId, isSelected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`relative p-8 rounded-2xl border transition-all duration-200 cursor-pointer h-full flex flex-col justify-between
        ${isSelected 
          ? 'bg-primary/5 dark:bg-primary/10 border-primary ring-1 ring-primary' 
          : 'bg-card border-border hover:border-primary/30 hover:bg-surface hover:-translate-y-1'
        }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-2xl font-bold text-foreground">
           {/* Placeholder for actual icons based on subject.icon */}
           {subject.icon === 'pi' && '∑'}
           {subject.icon === 'calc' && '∫'}
           {subject.icon === 'grid' && '#'}
           {!subject.icon && '📚'}
        </div>
        
        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors
          ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-card-foreground mb-2">{subject.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {subject.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 border-t border-border pt-4">
        <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-primary">
            {subject.price} TK
            </span>
            <span className="text-sm text-muted-foreground/60 line-through">
            {subject.originalPrice} TK
            </span>
        </div>
        
        {/* <a 
            href={`/learn/${courseId}/${subject.id}`}
            onClick={(e) => { e.stopPropagation(); }} 
            className="text-xs font-bold text-primary hover:text-primary-hover hover:underline"
        >
            View Content →
        </a> */}
      </div>
    </div>
  );
}
