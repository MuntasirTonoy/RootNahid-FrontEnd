"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash,
  Save,
  BookOpen,
  Video,
  Link as LinkIcon,
  DollarSign,
  Layers,
  ChevronRight,
  ChevronDown,
  Edit,
  ArrowLeft,
  Loader2,
  FileText,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// --- Reusable Dropdown Component ---
const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="form-control w-full" ref={dropdownRef}>
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>

      <div className="relative w-full">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center px-4 py-3 bg-surface border border-transparent hover:bg-muted text-foreground font-normal rounded-md transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className={!value ? "text-muted-foreground" : ""}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-card rounded-md shadow-xl border border-border max-h-60 overflow-y-auto z-[100]">
            <ul className="space-y-1">
              {options.map((opt, idx) => (
                <li key={idx} onClick={() => handleSelect(opt.value)}>
                  <div className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer text-sm text-foreground">
                    {opt.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default function EditPanel() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { id } = params; // EditLog ID

  // Selections
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Derived Data for Dropdowns
  const [subjectsList, setSubjectsList] = useState([]);

  // Form Data
  const [chapterName, setChapterName] = useState("");
  const [videoParts, setVideoParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch Subjects & Edit Data
  useEffect(() => {
    const init = async () => {
      if (!user || !id) return;
      try {
        const token = await auth.currentUser.getIdToken();

        // 1. Fetch Subjects
        const subjectsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subjects`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        // Handle paginated response
        const allSubjects = subjectsRes.data.data || subjectsRes.data || [];
        setSubjectsList(Array.isArray(allSubjects) ? allSubjects : []);

        // 2. Fetch Edit Log Data
        const editLogRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/edit-log/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const logData = editLogRes.data;

        // Populate State
        setSelectedDept(logData.department);
        setSelectedYear(logData.yearLevel);

        // Find subject title from ID
        const subj = allSubjects.find(
          (s) => s._id === logData.subjectId._id || s._id === logData.subjectId,
        );
        if (subj) setSelectedSubject(subj.title);

        setChapterName(logData.chapterName);

        // Map videos
        if (logData.videoIds && logData.videoIds.length > 0) {
          setVideoParts(
            logData.videoIds.map((v) => ({
              _id: v._id,
              partNumber: v.partNumber,
              title: v.title,
              videoUrl: v.videoUrl,
              noteLink: v.noteLink,
              description: v.description,
              isFree: v.isFree,
            })),
          );
        } else {
          setVideoParts([
            {
              partNumber: 1,
              title: "",
              videoUrl: "",
              noteLink: "",
              isFree: false,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        toast.error("Failed to load edit details");
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [user, id]);

  // Derived Data
  const departmentOptions = [
    ...new Set(subjectsList.map((s) => s.department)),
  ].map((d) => ({
    label: d,
    value: d,
  }));

  const yearOptions = selectedDept
    ? [
        ...new Set(
          subjectsList
            .filter((s) => s.department === selectedDept)
            .map((s) => s.yearLevel),
        ),
      ].map((y) => ({ label: y, value: y }))
    : [];

  const subjects = subjectsList.filter(
    (s) => s.department === selectedDept && s.yearLevel === selectedYear,
  );

  const currentSubjectObj = subjects.find((s) => s.title === selectedSubject);

  const subjectOptions = subjects.map((s) => ({
    label: `[${s.code || "N/A"}] ${s.title}`,
    value: s.title,
  }));

  // Handlers
  const addPart = () => {
    setVideoParts([
      ...videoParts,
      {
        partNumber: videoParts.length + 1,
        title: "",
        videoUrl: "",
        noteLink: "",
        isFree: false,
      },
    ]);
  };

  const removePart = (index) => {
    if (videoParts.length > 1) {
      const newParts = videoParts.filter((_, i) => i !== index);
      // Re-index part numbers, but keep _id if exists (backend will handle deletion/update logic, here we just reorder visually)
      // Actually, if we remove a part that has an _id, we should probably track it to delete it on backend?
      // The backend update logic currently: "incomingIds = req.body.videos... videosToDelete = editLog.videoIds.filter(id => !incomingIds...)"
      // So if we just remove it from the array sent to backend, backend will delete it. Good.

      const reIndexed = newParts.map((p, i) => ({ ...p, partNumber: i + 1 }));
      setVideoParts(reIndexed);
    }
  };

  const updatePart = (index, field, value) => {
    const newParts = [...videoParts];
    newParts[index][field] = value;
    setVideoParts(newParts);
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const handleSubmit = async () => {
    if (
      !selectedSubject ||
      !chapterName ||
      videoParts.some((p) => !p.videoUrl)
    ) {
      toast.warning("Please fill in all required fields");
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Update Batch?",
      text: `Are you sure you want to update all videos in "${chapterName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();

      const subjectId = subjects.find((s) => s.title === selectedSubject)?._id;

      const batchData = {
        chapterName,
        department: selectedDept,
        yearLevel: selectedYear,
        subjectId,
        videos: videoParts.map((part) => ({
          _id: part._id, // Include ID for existing videos
          title: part.title || `${chapterName} - Part ${part.partNumber}`,
          videoUrl: getEmbedUrl(part.videoUrl),
          noteLink: part.noteLink,
          description: part.description,
          isFree: part.isFree,
          partNumber: part.partNumber,
        })),
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/edit-log/${id}`,
        batchData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Videos updated successfully!");

      setTimeout(() => {
        router.push("/dashboard/manage-videos");
      }, 2000);
    } catch (error) {
      console.error("Error updating videos:", error);
      toast.error("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-40">
      {/* ------------------- HEADER ------------------- */}
      <div className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link
            href="/dashboard/manage-videos"
            className="btn btn-ghost btn-sm btn-circle p-2 rounded-full bg-muted/0 hover:bg-muted text-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Edit size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Edit Panel</h1>
              <p className="text-xs text-muted-foreground">
                Modify batch video details
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* ------------------- 1. SELECTION CARD ------------------- */}
        <div className="bg-card rounded-3xl border border-border p-5">
          <div className="overflow-visible z-10">
            <h2 className="text-base font-bold mb-4 flex gap-2 text-muted-foreground items-center">
              <Layers size={18} /> Batch Options
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomDropdown
                label="Department"
                placeholder="Select Dept..."
                value={selectedDept}
                options={departmentOptions}
                onChange={(val) => {
                  setSelectedDept(val);
                  setSelectedYear("");
                  setSelectedSubject("");
                }}
              />

              <CustomDropdown
                label="Year Level"
                placeholder="Select Year..."
                value={selectedYear}
                options={yearOptions}
                disabled={!selectedDept}
                onChange={(val) => {
                  setSelectedYear(val);
                  setSelectedSubject("");
                }}
              />

              <CustomDropdown
                label="Subject"
                placeholder="Select Subject..."
                value={
                  currentSubjectObj
                    ? `[${currentSubjectObj.code}] ${currentSubjectObj.title}`
                    : ""
                }
                options={subjectOptions}
                disabled={!selectedYear}
                onChange={(val) => setSelectedSubject(val)}
              />
            </div>
          </div>
        </div>

        {/* ------------------- 2. CONTENT EDITOR ------------------- */}
        {selectedSubject && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Chapter Header */}
            <div className="bg-card rounded-3xl border border-border p-6">
              <div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold text-lg flex items-center gap-2 text-foreground">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Chapter Name
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 1: Differential Calculus"
                    className="w-full text-base p-4 rounded-md border border-transparent bg-surface outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Video Parts Container */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-accent" /> Video Segments
                </h3>
                <span className="badge  p-2">{videoParts.length} Parts</span>
              </div>

              {videoParts.map((part, index) => (
                <div
                  key={index}
                  className="bg-card rounded-3xl border border-border relative group overflow-visible"
                >
                  {/* Remove Button (Floating) */}
                  {videoParts.length > 1 && (
                    <button
                      onClick={() => removePart(index)}
                      className="absolute -top-3 -right-3 rounded-md bg-red-500 text-white p-2 opacity-0 group-hover:opacity-100 transition-all z-10"
                      title="Remove Part"
                    >
                      <Trash size={20} />
                    </button>
                  )}

                  <div className="card-body p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left: Indicator */}
                      <div className="flex md:flex-col items-center gap-2 md:w-16 md:pt-2 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {part.partNumber}
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden md:block rotate-180 md:rotate-0 mt-2">
                          Part
                        </span>
                        <span className="text-sm font-bold md:hidden text-muted-foreground">
                          Part {part.partNumber}
                        </span>
                      </div>

                      {/* Right: Inputs */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title & Video URL */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label label-text-alt text-muted-foreground font-semibold uppercase">
                              {" "}
                              Video Title{" "}
                            </label>
                            <input
                              type="text"
                              className="w-full text-sm p-3 rounded-md border border-transparent bg-surface outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                              placeholder={`Part ${part.partNumber}`}
                              value={part.title}
                              onChange={(e) =>
                                updatePart(index, "title", e.target.value)
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label label-text-alt text-primary font-bold uppercase">
                              Video URL *
                            </label>
                            <input
                              type="text"
                              className="w-full text-sm p-3 rounded-md border border-transparent bg-surface outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                              placeholder="https://youtube.com/..."
                              value={part.videoUrl}
                              onChange={(e) =>
                                updatePart(index, "videoUrl", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Note Link */}
                        <div className="form-control">
                          <label className="label label-text-alt text-muted-foreground font-semibold uppercase flex gap-1 items-center">
                            <LinkIcon size={12} /> PDF Note Link
                          </label>
                          <input
                            type="text"
                            className="w-full text-sm p-3 rounded-md border border-transparent bg-surface outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                            placeholder="Drive/Dropbox Link"
                            value={part.noteLink}
                            onChange={(e) =>
                              updatePart(index, "noteLink", e.target.value)
                            }
                          />
                        </div>

                        {/* Description */}
                        <div className="form-control md:col-span-2">
                          <label className="label label-text-alt text-muted-foreground font-semibold uppercase flex gap-1 items-center">
                            <FileText size={12} /> Description
                          </label>
                          <textarea
                            className="w-full text-sm p-3 rounded-md border border-transparent bg-surface outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground min-h-[80px]"
                            placeholder="Brief description of this video part..."
                            value={part.description || ""}
                            onChange={(e) =>
                              updatePart(index, "description", e.target.value)
                            }
                          />
                        </div>

                        {/* Access Control */}
                        <div className="form-control">
                          <label className="label label-text-alt text-muted-foreground font-semibold uppercase flex gap-1 items-center">
                            <DollarSign size={12} /> Access Type
                          </label>
                          <div className="flex items-center gap-3 p-3 rounded-md bg-surface border-none w-full md:w-fit h-[46px]">
                            <span
                              className={`text-xs font-bold px-2 transition-colors ${!part.isFree ? "text-error" : "text-muted-foreground/30"}`}
                            >
                              Paid
                            </span>
                            <input
                              type="checkbox"
                              className="toggle toggle-sm toggle-success"
                              checked={part.isFree}
                              onChange={(e) =>
                                updatePart(index, "isFree", e.target.checked)
                              }
                            />
                            <span
                              className={`text-xs font-bold px-2 transition-colors ${part.isFree ? "text-success" : "text-muted-foreground/30"}`}
                            >
                              Free
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addPart}
                className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground w-full hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all"
              >
                <Plus size={20} />
                Add Another Video Part
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------- FLOATING FOOTER ------------------- */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border p-4 z-40 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm">
            {selectedSubject ? (
              <>
                <span className="badge badge-primary badge-outline">
                  {currentSubjectObj?.title || selectedSubject}
                </span>
                <ChevronRight size={14} className="text-base-content/30" />
                <span
                  className={chapterName ? "font-bold" : "italic opacity-50"}
                >
                  {chapterName || "Untitled Chapter"}
                </span>
              </>
            ) : (
              <span className="opacity-50 italic">No subject selected</span>
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-all flex-1 md:flex-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedSubject}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-2.5 font-semibold text-primary-foreground flex-1 md:flex-none min-w-[160px] shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Save size={18} />
              )}
              Update Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
