import {
  Edit,
  Save,
  X,
  BookOpen,
  ImageIcon,
  Calendar,
  Plus,
  Trash,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "@/lib/firebase";
import Swal from "sweetalert2";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

export default function CourseEditModal({
  isOpen,
  onClose,
  isEditing,
  formData,
  setFormData,
  onSubmit,
  loading,
}) {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Subject Addition State
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectPrice, setSubjectPrice] = useState("");
  const [subjectOfferPrice, setSubjectOfferPrice] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchSubjects = async () => {
        try {
          setLoadingSubjects(true);
          const token = await auth.currentUser.getIdToken();
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subjects?limit=1000`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          // Handle paginated response structure
          setAvailableSubjects(res.data.data || res.data || []);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchSubjects();
    }
  }, [isOpen]);

  // Derived Options
  const departmentOptions = [
    ...new Set(availableSubjects.map((s) => s.department)),
  ]
    .filter(Boolean)
    .map((d) => ({ label: d, value: d }));

  const yearOptions = formData.department
    ? [
        ...new Set(
          availableSubjects
            .filter((s) => s.department === formData.department)
            .map((s) => s.yearLevel),
        ),
      ]
        .filter(Boolean)
        .map((y) => ({ label: y, value: y }))
    : [];

  // Filter subjects based on selected Dept/Year AND exclude already added subjects
  // Note: formData.subjects is where we store added subjects
  const currentSubjects = formData.subjects || [];

  const subjectOptions =
    formData.department && formData.yearLevel
      ? availableSubjects
          .filter(
            (s) =>
              s.department === formData.department &&
              s.yearLevel === formData.yearLevel &&
              !currentSubjects.find((curr) => curr.subjectId === s._id),
          )
          .map((s) => {
            const idVal = s._id; // Mongoose _id
            if (!idVal) return null;
            return {
              label: `[${s.code || "N/A"}] ${s.title}`,
              value: idVal,
              originalPrice: s.originalPrice,
              offerPrice: s.offerPrice,
            };
          })
          .filter(Boolean)
      : [];

  // REMOVED useEffect for auto-fill to allow manual edit override

  const handleSubjectChange = (e) => {
    const newId = e.target.value;
    setSelectedSubjectId(newId);

    // Auto-fill from DB when selecting from dropdown
    if (newId) {
      const subj = availableSubjects.find((s) => s._id === newId);
      if (subj) {
        setSubjectPrice(
          subj.originalPrice !== undefined && subj.originalPrice !== null
            ? subj.originalPrice
            : "",
        );
        setSubjectOfferPrice(
          subj.offerPrice !== undefined && subj.offerPrice !== null
            ? subj.offerPrice
            : "",
        );
      }
    } else {
      setSubjectPrice("");
      setSubjectOfferPrice("");
    }
  };

  const handleAddSubject = () => {
    if (!selectedSubjectId) return;
    if (
      subjectPrice === "" ||
      subjectPrice === null ||
      subjectOfferPrice === "" ||
      subjectOfferPrice === null
    ) {
      toast.warning("Please set both Price and Offer Price");
      return;
    }

    const subj = availableSubjects.find((s) => s._id === selectedSubjectId);
    if (!subj) return;

    const newEntry = {
      subjectId: selectedSubjectId, // Ensure we store the ID as 'subjectId' to match backend schema expectation
      title: subj.title,
      code: subj.code, // Optional visual helper
      originalPrice: parseFloat(subjectPrice),
      offerPrice: parseFloat(subjectOfferPrice),
    };

    setFormData({
      ...formData,
      subjects: [...(formData.subjects || []), newEntry],
    });

    // Reset inputs
    setSelectedSubjectId("");
    setSubjectPrice("");
    setSubjectOfferPrice("");
  };

  const handleRemoveSubject = (id) => {
    setFormData({
      ...formData,
      subjects: (formData.subjects || []).filter((s) => s.subjectId !== id),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header with Gradient */}
        <div className="relative px-8 py-5 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Edit size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {isEditing ? "Edit Course" : "Create New Course"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isEditing
                    ? "Update course details"
                    : "Add a new course to your catalog"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto max-h-[75vh]">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen size={16} className="text-primary" />
                Course Title
              </label>
              <input
                type="text"
                placeholder="e.g., Advanced Mathematics for Engineers"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Thumbnail Upload */}
            <ImageUpload
              value={formData.thumbnail}
              onChange={(url) => setFormData({ ...formData, thumbnail: url })}
              label="Course Thumbnail"
            />

            {/* Classification Section */}
            <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-muted/20 to-transparent space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    Classification
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Select department and year level
                  </p>
                </div>
                {loadingSubjects && (
                  <Loader2 className="animate-spin w-4 h-4 text-primary ml-auto" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Department */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Department
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground text-sm"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: e.target.value,
                        yearLevel: "",
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {departmentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Level */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Calendar size={12} /> Year Level
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    value={formData.yearLevel}
                    disabled={!formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearLevel: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select Year Level
                    </option>
                    {yearOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Subjects Management Section */}
            <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-accent/5 to-transparent space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-accent to-accent/40 rounded-full"></div>
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    Course Subjects & Pricing
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Add subjects and set their prices
                  </p>
                </div>
              </div>

              {/* Add Subject Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-muted/20 rounded-xl border border-border/50">
                <div className="md:col-span-6 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Select Subject
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm text-foreground disabled:opacity-50"
                    value={selectedSubjectId}
                    onChange={handleSubjectChange}
                    disabled={!formData.department || !formData.yearLevel}
                  >
                    <option value="">
                      {!formData.department || !formData.yearLevel
                        ? "Select dept & year first"
                        : "Choose a subject..."}
                    </option>
                    {subjectOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Price (৳)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm text-foreground"
                    placeholder="0"
                    value={subjectPrice}
                    onChange={(e) => setSubjectPrice(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Offer (৳)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm text-foreground"
                    placeholder="0"
                    value={subjectOfferPrice}
                    onChange={(e) => setSubjectOfferPrice(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    disabled={!selectedSubjectId}
                    className="w-full h-[42px] flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* List of Added Subjects */}
              {currentSubjects.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {currentSubjects.map((subj, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between p-4 bg-background rounded-xl border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-sm text-foreground">
                            {subj.title}
                          </h5>
                          {subj.code && (
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                              {subj.code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground line-through">
                            ৳{subj.originalPrice}
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ৳{subj.offerPrice}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">
                            {Math.round(
                              ((subj.originalPrice - subj.offerPrice) /
                                subj.originalPrice) *
                                100,
                            )}
                            % OFF
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subj.subjectId)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all opacity-70 group-hover:opacity-100"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 rounded-lg bg-muted/20 border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    No subjects added yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a subject from the dropdown above to add.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEditing ? "Update Course" : "Create Course"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
