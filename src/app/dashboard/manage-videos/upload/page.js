"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash,
  BookOpen,
  Video,
  Link as LinkIcon,
  DollarSign,
  Layers,
  ChevronRight,
  ChevronDown,
  Upload,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-card rounded-md border border-border max-h-60 overflow-y-auto z-[100]">
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

const ManageVideos = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Data State
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Selections
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Fetch Subjects on Mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subjects?limit=1000`, // Fetch all for dropdowns
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Handle paginated response
        if (res.data.data) {
          setAvailableSubjects(res.data.data);
        } else if (Array.isArray(res.data)) {
          setAvailableSubjects(res.data);
        } else {
          setAvailableSubjects([]);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects");
      } finally {
        setDataLoading(false);
      }
    };

    if (user) fetchSubjects();
  }, [user]);

  // Derived Data for Dropdowns
  const departmentOptions = [
    ...new Set(availableSubjects.map((s) => s.department)),
  ]
    .filter(Boolean)
    .map((d) => ({ label: d, value: d }));

  const yearOptions = selectedDept
    ? [
        ...new Set(
          availableSubjects
            .filter((s) => s.department === selectedDept)
            .map((s) => s.yearLevel),
        ),
      ]
        .filter(Boolean)
        .map((y) => ({ label: y, value: y }))
    : [];

  // Find currently selected subject object to display neatly
  const currentSubjectObj = availableSubjects.find(
    (s) => s._id === selectedSubjectId,
  );

  const subjectOptions =
    selectedDept && selectedYear
      ? availableSubjects
          .filter(
            (s) =>
              s.department === selectedDept && s.yearLevel === selectedYear,
          )
          .map((s) => {
            // Handle standard string _id, MongoDB export format { $oid: '...' }, or fallback
            // This ensures we always get a usable ID string if possible.
            const idVal = s._id?.$oid || s._id;

            if (!idVal) return null; // Skip if no ID found

            return {
              label: `[${s.code || "N/A"}] ${s.title}`,
              value: idVal,
            };
          })
          .filter(Boolean) // Remove nulls
      : [];

  // Form Data
  const [chapterName, setChapterName] = useState("");
  const [videoParts, setVideoParts] = useState([
    { partNumber: 1, title: "", videoUrl: "", noteLink: "", isFree: false },
  ]);

  const [loading, setLoading] = useState(false);

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
      const reIndexed = newParts.map((p, i) => ({ ...p, partNumber: i + 1 }));
      setVideoParts(reIndexed);
    }
  };

  const updatePart = (index, field, value) => {
    const newParts = [...videoParts];
    newParts[index][field] = value;
    setVideoParts(newParts);
  };

  // Helper to convert YouTube links to Embed format
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
      !selectedSubjectId ||
      !chapterName ||
      videoParts.some((p) => !p.videoUrl)
    ) {
      toast.warning("Please complete all fields");
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();

      // Prepare batch data
      const batchData = {
        chapterName,
        department: selectedDept,
        yearLevel: selectedYear,
        subjectId: selectedSubjectId, // Sending correct ID
        videos: videoParts.map((part) => ({
          title: part.title || `${chapterName} - Part ${part.partNumber}`,
          videoUrl: getEmbedUrl(part.videoUrl),
          noteLink: part.noteLink,
          description: part.description,
          isFree: part.isFree,
          partNumber: part.partNumber,
        })),
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/video/batch`,
        batchData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(`Uploaded ${videoParts.length} videos successfully`);
      setChapterName("");
      setVideoParts([
        { partNumber: 1, title: "", videoUrl: "", noteLink: "", isFree: false },
      ]);
      router.push("/dashboard/manage-videos");
    } catch (error) {
      console.error("Error creating videos:", error);
      toast.error("Upload failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Upload size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Upload Videos
              </h1>
              <p className="text-xs text-muted-foreground">
                Upload and organize videos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* ------------------- 1. SELECTION CARD ------------------- */}
        <div className="bg-card rounded-3xl border border-border p-4 md:p-5">
          <div className="overflow-visible z-10">
            <h2 className="text-base font-bold mb-4 flex gap-2 text-muted-foreground items-center">
              <Layers size={18} /> Select options{" "}
              {dataLoading && (
                <span className="loading loading-spinner loading-xs ml-2"></span>
              )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Department Dropdown */}
              <CustomDropdown
                label="Department"
                placeholder="Select Dept..."
                value={selectedDept}
                options={departmentOptions}
                onChange={(val) => {
                  setSelectedDept(val);
                  setSelectedYear("");
                  setSelectedSubjectId("");
                }}
              />

              {/* Year Dropdown */}
              <CustomDropdown
                label="Year Level"
                placeholder="Select Year..."
                value={selectedYear}
                options={yearOptions}
                disabled={!selectedDept}
                onChange={(val) => {
                  setSelectedYear(val);
                  setSelectedSubjectId("");
                }}
              />

              {/* Subject Dropdown */}
              <CustomDropdown
                label="Subject"
                placeholder="Select Subject..."
                // Display the formatted string "[Code] Title" if selected, otherwise null
                value={
                  currentSubjectObj
                    ? `[${currentSubjectObj.code || "N/A"}] ${currentSubjectObj.title}`
                    : ""
                }
                options={subjectOptions}
                disabled={!selectedYear}
                onChange={(val) => setSelectedSubjectId(val)}
              />
            </div>
          </div>
        </div>

        {/* ------------------- 2. CONTENT EDITOR ------------------- */}
        {selectedSubjectId && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Chapter Header */}
            <div className="bg-card rounded-3xl border border-border p-4 md:p-6">
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
                      <Trash size={16} />
                    </button>
                  )}

                  <div className="card-body p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left: Indicator */}
                      <div className="flex md:flex-col items-center gap-2 md:w-16 md:pt-2 border-b md:border-b-0 md:border-r md:border-border pb-4 md:pb-0">
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
            {selectedSubjectId ? (
              <>
                <span className="badge badge-primary badge-outline">
                  {currentSubjectObj?.title || selectedSubjectId}
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
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-all flex-1 md:flex-none"
              onClick={() => {
                setChapterName("");
                setVideoParts([
                  {
                    partNumber: 1,
                    title: "",
                    videoUrl: "",
                    noteLink: "",
                    isFree: false,
                  },
                ]);
              }}
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedSubjectId}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-2.5 font-semibold text-primary-foreground flex-1 md:flex-none min-w-[160px] shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Upload size={18} />
              )}
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageVideos;
