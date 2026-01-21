"use client";

import { useState, useEffect } from "react";
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
  Upload,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import Swal from "sweetalert2";

// --- Reusable Dropdown Component ---
const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
}) => {
  // Helper to close dropdown on click
  const handleSelect = (val) => {
    onChange(val);
    const elem = document.activeElement;
    if (elem) {
      elem.blur();
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>

      <div
        className={`dropdown dropdown-bottom w-full ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <div
          tabIndex={0}
          role="button"
          className="btn w-full justify-between bg-surface border-transparent hover:bg-muted text-foreground font-normal rounded-md h-12"
        >
          <span className={!value ? "text-muted-foreground" : ""}>
            {value || placeholder}
          </span>
          <ChevronDown size={16} className="opacity-50" />
        </div>

        {!disabled && (
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-card rounded-md z-50 w-full p-2 shadow-xl border border-border max-h-60 overflow-y-auto flex-nowrap block text-foreground"
          >
            {options.map((opt, idx) => (
              <li key={idx} onClick={() => handleSelect(opt.value)}>
                <a className="hover:bg-muted rounded-lg">{opt.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default function ManageVideos() {
  const { user } = useAuth();

  // Selections
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Derived Data for Dropdowns
  // Data State
  const [subjectsList, setSubjectsList] = useState([]);

  // Fetch Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subjects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSubjectsList(data);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };
    fetchSubjects();
  }, [user]);

  // Derived Data
  // Unique Departments
  const departmentOptions = [
    ...new Set(subjectsList.map((s) => s.department)),
  ].map((d) => ({
    label: d,
    value: d,
  }));

  // Unique Years for selected Dept
  const yearOptions = selectedDept
    ? [
        ...new Set(
          subjectsList
            .filter((s) => s.department === selectedDept)
            .map((s) => s.yearLevel),
        ),
      ].map((y) => ({ label: y, value: y }))
    : [];

  // Filter subjects based on Dept and Year
  const subjects = subjectsList.filter(
    (s) => s.department === selectedDept && s.yearLevel === selectedYear,
  );

  const currentSubjectObj = subjects.find((s) => s.title === selectedSubject);

  const subjectOptions = subjects.map((s) => ({
    label: `[${s.code || "N/A"}] ${s.title}`,
    value: s.title,
  }));

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
      !selectedSubject ||
      !chapterName ||
      videoParts.some((p) => !p.videoUrl)
    ) {
      Swal.fire(
        "Missing Fields",
        "Please select Department, Year, Subject and fill in Video URLs.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      let successCount = 0;

      for (const part of videoParts) {
        const videoData = {
          title: part.title || `${chapterName} - Part ${part.partNumber}`,
          chapterName: chapterName,
          subjectTitle: selectedSubject,
          subjectId: subjects.find((s) => s.title === selectedSubject)?._id,
          subjectCode: subjects.find((s) => s.title === selectedSubject)?.code,
          partNumber: part.partNumber,
          videoUrl: getEmbedUrl(part.videoUrl),
          noteLink: part.noteLink,
          isFree: part.isFree,
        };

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/video`,
          videoData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        successCount++;
      }

      Swal.fire(
        "Success",
        `Uploaded ${successCount} videos for ${chapterName}`,
        "success",
      );
      setChapterName("");
      setVideoParts([
        { partNumber: 1, title: "", videoUrl: "", noteLink: "", isFree: false },
      ]);
    } catch (error) {
      console.error("Error creating videos:", error);
      Swal.fire(
        "Upload Failed",
        "Something went wrong. Check console.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans pb-40">
      {/* ------------------- HEADER ------------------- */}
      <div className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Upload size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Upload Panel</h1>
            <p className="text-sm text-muted-foreground">
              Upload and organize content
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* ------------------- 1. SELECTION CARD ------------------- */}
        <div className="bg-card rounded-3xl border border-border p-5">
          <div className="overflow-visible z-10">
            <h2 className="text-base font-bold mb-4 flex gap-2 text-muted-foreground items-center">
              <Layers size={18} /> Select options
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
                  setSelectedSubject("");
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
                  setSelectedSubject("");
                }}
              />

              {/* Subject Dropdown */}
              <CustomDropdown
                label="Subject"
                placeholder="Select Subject..."
                // Display the formatted string "[Code] Title" if selected, otherwise null
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
                className="btn btn-outline btn-block border-dashed border-2 text-base-content/50 hover:bg-base-100 hover:text-primary hover:border-primary transition-all h-16 normal-case"
              >
                <Plus className="w-6 h-6" /> Add Another Video Part
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------- FLOATING FOOTER ------------------- */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border p-4 z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm">
            {selectedSubject ? (
              <>
                <span className="badge badge-primary badge-outline">
                  {selectedSubject}
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
              className="btn bg-red-500 p-2 hover:bg-red-600 rounded-md text-white flex-1 md:flex-none"
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
              disabled={loading || !selectedSubject}
              className="btn btn-primary shadow-none bg-primary text-primary-content hover:bg-primary/90 rounded-md flex-1 md:flex-none min-w-[160px]"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Save size={18} />
              )}
              Save Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
