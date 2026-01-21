import {
  Edit,
  Save,
  X,
  BookOpen,
  ImageIcon,
  Calendar,
  Plus,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "@/lib/firebase";
import Swal from "sweetalert2";

export default function CourseEditModal({
  isOpen,
  onClose,
  isEditing,
  formData,
  setFormData,
  onSubmit,
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
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subjects`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setAvailableSubjects(res.data);
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
      Swal.fire("Error", "Please set both Price and Offer Price", "warning");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Edit size={18} className="text-primary" />
            {isEditing ? "Edit Course" : "Add Course"}
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
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Title */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen size={14} /> Course Title
                </div>
              </label>
              <input
                type="text"
                placeholder="e.g. Master Algebra"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input input-bordered w-full rounded-md bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary/20 p-3"
                required
              />
            </div>

            {/* Thumbnail */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ImageIcon size={14} /> Thumbnail URL
                </div>
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.thumbnail}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail: e.target.value })
                }
                className="input input-bordered w-full rounded-md bg-surface border-border focus:outline-none focus:ring-2 focus:ring-primary/20 p-3"
                required
              />
            </div>

            {/* Classification */}
            <div className="p-5 rounded-lg border border-border bg-muted/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-1 bg-primary rounded-full"></div>
                <label className="text-sm font-bold text-foreground">
                  Classification
                </label>
                {loadingSubjects && (
                  <span className="loading loading-spinner loading-xs text-muted-foreground"></span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department */}
                <div className="form-control">
                  <label className="label text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Department
                  </label>
                  <select
                    className="select select-bordered w-full rounded-md text-sm bg-background border-border focus:border-primary p-3 text-foreground dark:bg-card"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: e.target.value,
                        yearLevel: "", // Reset year when dept changes
                      })
                    }
                    required
                  >
                    <option value="" disabled className="text-muted-foreground">
                      Select Dept
                    </option>
                    {departmentOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="text-foreground bg-background"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Level */}
                <div className="form-control">
                  <label className="label text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} /> Year Level
                    </div>
                  </label>
                  <select
                    className="select select-bordered w-full rounded-md text-sm bg-background border-border focus:border-primary p-3 text-foreground dark:bg-card"
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
                    <option value="" disabled className="text-muted-foreground">
                      Select Year
                    </option>
                    {yearOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="text-foreground bg-background"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SUBJECTS MANAGEMENT */}
            <div className="p-5 rounded-lg border border-border bg-muted/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-1 bg-accent rounded-full"></div>
                <label className="text-sm font-bold text-foreground">
                  Course Subjects & Pricing
                </label>
              </div>

              {/* Add Subject Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-surface rounded-lg border border-border/50">
                <div className="md:col-span-5">
                  <label className="label text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Add Subject
                  </label>
                  <select
                    className="select select-bordered select-sm w-full rounded-md text-xs bg-background text-foreground border-border dark:bg-card"
                    value={selectedSubjectId}
                    onChange={handleSubjectChange}
                    disabled={!formData.department || !formData.yearLevel}
                  >
                    <option value="" className="text-muted-foreground">
                      Select...
                    </option>
                    {subjectOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="text-foreground bg-background"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="label text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full rounded-md text-xs bg-background text-foreground border-border dark:bg-card p-3"
                    placeholder="0.00"
                    value={subjectPrice}
                    onChange={(e) => setSubjectPrice(e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="label text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Offer Price
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full rounded-md text-xs bg-background text-foreground border-border dark:bg-card p-3"
                    placeholder="0.00"
                    value={subjectOfferPrice}
                    onChange={(e) => setSubjectOfferPrice(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    disabled={!selectedSubjectId}
                    className="
      w-10 h-10
      flex items-center justify-center
      rounded-full
      bg-primary text-primary-foreground
      transition-all duration-200
      hover:bg-primary-hover  
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed
    "
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List of Added Subjects */}
              {currentSubjects.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {currentSubjects.map((subj, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-surface p-3 rounded-lg border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-sm text-foreground">
                          {subj.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                          <span className="text-error line-through decoration-auto">
                            ৳{subj.originalPrice}
                          </span>
                          <span className="text-success font-bold">
                            ৳{subj.offerPrice}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subj.subjectId)}
                          className="btn btn-ghost btn-xs bg-red-500 p-2 text-white hover:bg-error/10 rounded-md"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground italic">
                  No subjects added yet.
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-md text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2 rounded-md text-sm font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20 flex items-center gap-2 transition-all"
              >
                <Save size={16} />
                {isEditing ? "Update Course" : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
