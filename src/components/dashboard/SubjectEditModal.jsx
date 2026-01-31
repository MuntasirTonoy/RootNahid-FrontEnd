import {
  Edit,
  Save,
  X,
  BookOpen,
  Layers,
  GraduationCap,
  DollarSign,
  Tag,
  Loader2,
} from "lucide-react";

export default function SubjectEditModal({
  isOpen,
  onClose,
  subject,
  setSubject,
  onSave,
  loading,
  courses,
}) {
  if (!isOpen || !subject) return null;

  // Extract unique departments from courses
  const departments = [...new Set(courses.map((c) => c.department))].filter(
    Boolean,
  );

  // Filter years based on selected department
  const availableYears = [
    ...new Set(
      courses
        .filter((c) => c.department === subject.department)
        .map((c) => c.yearLevel),
    ),
  ].filter(Boolean);

  // Filter courses based on selected department and year
  const availableCourses = courses.filter(
    (c) =>
      c.department === subject.department && c.yearLevel === subject.yearLevel,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Edit size={18} className="text-primary" />
            {subject._id ? "Edit Subject" : "Add Subject"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Context Selection (Dept -> Year -> Course) */}
            <div className="p-5 rounded-lg border border-border bg-muted/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-1 bg-primary rounded-full"></div>
                <label className="text-sm font-bold text-foreground">
                  Subject Context
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department Selection */}
                <div className="form-control">
                  <label className="label text-[10px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                    <Layers size={10} /> Department
                  </label>
                  <select
                    className="select select-bordered w-full rounded-md text-sm bg-background border-border focus:border-primary p-3"
                    value={subject.department || ""}
                    onChange={(e) => {
                      setSubject({
                        ...subject,
                        department: e.target.value,
                        yearLevel: "",
                        courseId: "",
                      });
                    }}
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Level Selection */}
                <div className="form-control">
                  <label className="label text-[10px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                    <GraduationCap size={10} /> Year Level
                  </label>
                  <select
                    className="select select-bordered w-full rounded-md text-sm bg-background border-border focus:border-primary p-3"
                    value={subject.yearLevel || ""}
                    disabled={!subject.department}
                    onChange={(e) => {
                      setSubject({
                        ...subject,
                        yearLevel: e.target.value,
                        courseId: "",
                      });
                    }}
                  >
                    <option value="" disabled>
                      Select Year
                    </option>
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course Selection */}
              <div className="form-control">
                <label className="label text-[10px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                  <BookOpen size={10} /> Course
                </label>
                <select
                  className="select select-bordered w-full rounded-md text-sm bg-background border-border focus:border-primary p-3"
                  value={subject.courseId || ""}
                  disabled={!subject.yearLevel}
                  onChange={(e) => {
                    setSubject({
                      ...subject,
                      courseId: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    Select Course
                  </option>
                  {availableCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-px bg-border w-full"></div>

            {/* Subject Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject Code */}
              <div className="form-control md:col-span-1">
                <label className="label text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <Tag size={12} /> Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSE-101"
                  className="input input-bordered w-full rounded-md bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary/20 p-3"
                  value={subject.code || ""}
                  onChange={(e) =>
                    setSubject({
                      ...subject,
                      code: e.target.value,
                    })
                  }
                />
              </div>

              {/* Subject Title */}
              <div className="form-control md:col-span-2">
                <label className="label text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <BookOpen size={12} /> Title
                </label>
                <input
                  type="text"
                  placeholder="Subject Name"
                  className="input input-bordered w-full rounded-md bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary/20 p-3"
                  value={subject.title || ""}
                  onChange={(e) =>
                    setSubject({
                      ...subject,
                      title: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <DollarSign size={12} /> Original Price
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full rounded-md bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary/20 p-3"
                  value={subject.originalPrice || ""}
                  onChange={(e) =>
                    setSubject({
                      ...subject,
                      originalPrice: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <DollarSign size={12} /> Offer Price
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered w-full rounded-md bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary/20 p-3"
                  value={subject.offerPrice || ""}
                  onChange={(e) =>
                    setSubject({
                      ...subject,
                      offerPrice: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-6 py-2 rounded-md text-sm font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save size={16} />
            )}
            Save Subject
          </button>
        </div>
      </div>
    </div>
  );
}
