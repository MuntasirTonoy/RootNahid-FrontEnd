"use client";

import { useState, useRef, useEffect } from "react";
import {
  Save,
  BookOpen,
  ChevronDown,
  Image as ImageIcon,
  ArrowLeft,
  Layout,
  Plus,
  Trash,
  DollarSign,
  Tag,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import Swal from "sweetalert2";
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
        <span className="label-text font-medium text-muted-foreground uppercase text-xs tracking-wider">
          {label}
        </span>
      </label>

      <div className="relative w-full">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center px-4 py-4 bg-surface border border-transparent hover:bg-surface-hover text-foreground font-medium rounded-md transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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

const AddCourse = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Data State
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Course Details
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Subject Addition State
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectPrice, setSubjectPrice] = useState("");
  const [subjectOfferPrice, setSubjectOfferPrice] = useState("");

  // Added Subjects List
  const [addedSubjects, setAddedSubjects] = useState([]);

  const [loading, setLoading] = useState(false);

  // Fetch Subjects on Mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
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
        Swal.fire("Error", "Failed to load subjects", "error");
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

  // Filter subjects based on selected Dept/Year
  // AND exclude already added subjects
  const subjectOptions =
    selectedDept && selectedYear
      ? availableSubjects
          .filter(
            (s) =>
              s.department === selectedDept &&
              s.yearLevel === selectedYear &&
              !addedSubjects.find((added) => added.subjectId === s._id),
          )
          .map((s) => {
            const idVal = s._id?.$oid || s._id;
            if (!idVal) return null;
            return {
              label: `[${s.code || "N/A"}] ${s.title}`,
              value: idVal,
              originalPrice: s.originalPrice, // Keep ref for auto-fill
              offerPrice: s.offerPrice,
            };
          })
          .filter(Boolean)
      : [];

  // When a subject is selected, optionally pre-fill the price inputs
  useEffect(() => {
    if (selectedSubjectId) {
      const subj = availableSubjects.find((s) => s._id === selectedSubjectId);
      if (subj) {
        setSubjectPrice(subj.originalPrice || "");
        setSubjectOfferPrice(subj.offerPrice || "");
      }
    } else {
      setSubjectPrice("");
      setSubjectOfferPrice("");
    }
  }, [selectedSubjectId, availableSubjects]);

  const handleAddSubject = () => {
    if (!selectedSubjectId) return;
    if (!subjectPrice || !subjectOfferPrice) {
      Swal.fire("Error", "Please set both Price and Offer Price", "warning");
      return;
    }

    const subj = availableSubjects.find((s) => s._id === selectedSubjectId);
    if (!subj) return;

    const newEntry = {
      subjectId: selectedSubjectId, // Ensure we store the ID as 'subjectId' to match backend schema expectation
      title: subj.title,
      code: subj.code,
      originalPrice: parseFloat(subjectPrice),
      offerPrice: parseFloat(subjectOfferPrice),
    };

    setAddedSubjects([...addedSubjects, newEntry]);
    setSelectedSubjectId("");
    setSubjectPrice("");
    setSubjectOfferPrice("");
  };

  const handleRemoveSubject = (id) => {
    setAddedSubjects(addedSubjects.filter((s) => s.subjectId !== id));
  };

  const handleSubmit = async () => {
    if (!title || !selectedDept || !selectedYear) {
      Swal.fire(
        "Missing Fields",
        "Please fill in Title, Department, and Year level.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();

      const courseData = {
        title: title,
        department: selectedDept,
        yearLevel: selectedYear,
        thumbnail: thumbnail,
        subjects: addedSubjects.map((s) => ({
          subjectId: s.subjectId,
          title: s.title,
          originalPrice: s.originalPrice,
          offerPrice: s.offerPrice,
        })),
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/course`,
        courseData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Swal.fire("Success", "Course created successfully", "success");
      router.push("/dashboard/manage-courses");
    } catch (error) {
      console.error("Error creating course:", error);
      Swal.fire(
        "Creation Failed",
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
      <div className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-2 py-6 flex items-center gap-4">
          <Link
            href="/dashboard/manage-courses"
            className="btn btn-ghost btn-sm btn-circle p-2 rounded-full bg-muted/0 hover:bg-muted text-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Layout size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Add New Course
              </h1>
              <p className="text-xs text-muted-foreground">Upload Panel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-3 md:p-6 space-y-6">
        <div className="bg-card rounded-3xl border border-border p-5 md:p-8 space-y-8">
          {/* Title Input */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-lg flex items-center gap-2 text-foreground">
                <BookOpen className="w-5 h-5 text-primary" />
                Course Title
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Master Algebra"
              className="w-full text-base p-4 rounded-md border border-transparent bg-surface hover:bg-surface-hover outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Thumbnail Input */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-lg flex items-center gap-2 text-foreground">
                <ImageIcon className="w-5 h-5 text-primary" />
                Thumbnail URL
              </span>
            </label>
            <input
              type="text"
              placeholder="https://..."
              className="w-full text-base p-4 rounded-md border border-transparent bg-surface hover:bg-surface-hover outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>

          <div className="divider text-muted-foreground text-sm font-medium">
            Course Filters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                setAddedSubjects([]);
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
                setAddedSubjects([]);
              }}
            />
          </div>

          {/* SUBJECTS SECTION */}
          <div className="divider text-muted-foreground text-sm font-medium">
            Course Curriculum
          </div>

          <div className="bg-muted/10 rounded-2xl p-6 border border-border/50 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              Add Subjects & Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <CustomDropdown
                  label="Select Subject"
                  placeholder="Choose..."
                  value={
                    selectedSubjectId
                      ? availableSubjects.find(
                          (s) => s._id === selectedSubjectId,
                        )?.title || ""
                      : ""
                  }
                  options={subjectOptions}
                  disabled={!selectedYear}
                  onChange={(val) => setSelectedSubjectId(val)}
                />
              </div>

              <div className="md:col-span-3">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-1">
                      <DollarSign size={14} /> Price
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full text-sm p-4 rounded-md border border-transparent bg-surface hover:bg-surface-hover outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                    value={subjectPrice}
                    onChange={(e) => setSubjectPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-1">
                      <Tag size={14} /> Offer
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full text-sm p-4 rounded-md border border-transparent bg-surface hover:bg-surface-hover outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                    value={subjectOfferPrice}
                    onChange={(e) => setSubjectOfferPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium text-muted-foreground uppercase text-xs tracking-wider">
                      Action
                    </span>
                  </label>
                  <button
                    onClick={handleAddSubject}
                    disabled={!selectedSubjectId}
                    type="button"
                    className="w-full p-4 rounded-md border border-transparent bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    <span>add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ADDED SUBJECTS LIST */}
            {addedSubjects.length > 0 && (
              <div className="mt-4 space-y-2">
                {addedSubjects.map((subj, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-card p-4 rounded-md border border-border group hover:border-primary/30 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        [{subj.code}] {subj.title}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                        <span className="text-error line-through">
                          ৳{subj.originalPrice}
                        </span>
                        <span className="text-success font-bold">
                          ৳{subj.offerPrice}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSubject(subj.subjectId)}
                      className="btn btn-square btn-ghost btn-sm text-error hover:bg-error/10 opacity-50 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 sm:pt-8">
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !title ||
                !selectedDept ||
                !selectedYear ||
                addedSubjects.length === 0
              }
              className="group relative w-full flex items-center justify-center gap-3 rounded-xl bg-foreground text-background px-6 py-4 font-bold text-base sm:text-lg  hover:bg-primary hover:text-white hover:shadow-primary/40 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none hover:-translate-y-1 overflow-hidden"
            >
              {loading ? (
                <span className="loading loading-spinner loading-md text-current"></span>
              ) : (
                <>
                  <Save
                    size={22}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <span>
                    Create Course with {addedSubjects.length} Subjects
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
