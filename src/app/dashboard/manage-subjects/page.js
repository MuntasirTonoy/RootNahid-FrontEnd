"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash,
  Edit,
  BookOpen,
  Layers,
  GraduationCap,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import Swal from "sweetalert2";

import SubjectEditModal from "@/components/dashboard/SubjectEditModal";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function ManageSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null); // For editing
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    department: "",
    yearLevel: "",
    courseId: "",
    originalPrice: "",
    offerPrice: "",
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const [subjectsRes, coursesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSubjects(subjectsRes.data);
      setCourses(coursesRes.data);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Handlers
  const openModal = (subject = null) => {
    if (subject) {
      setCurrentSubject(subject);
      setFormData({
        title: subject.title,
        code: subject.code || "",
        department: subject.department || "",
        yearLevel: subject.yearLevel || "",
        courseId: subject.courseId?._id || subject.courseId || "", // Handle populated vs raw ID safely
        originalPrice: subject.originalPrice,
        offerPrice: subject.offerPrice,
      });
    } else {
      setCurrentSubject(null);
      setFormData({
        title: "",
        code: "",
        department: "",
        yearLevel: "",
        courseId: "",
        originalPrice: "",
        offerPrice: "",
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setModalLoading(true);
    const token = await auth.currentUser.getIdToken();
    try {
      if (currentSubject) {
        // Update
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subject/${currentSubject._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Swal.fire("Updated", "Subject updated successfully", "success");
      } else {
        // Create
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subject`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Swal.fire("Created", "Subject created successfully", "success");
      }
      setModalOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete subject?",
      text: "This will permanently remove the subject.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!res.isConfirmed) return;

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subject/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
      Swal.fire("Deleted", "Subject removed", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to delete subject", "error");
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manage Subjects</h1>
            <p className="text-sm text-muted-foreground">
              Add and manage your academic subjects
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground w-full sm:w-auto hover:cursor-pointer hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-card rounded-md border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
            <tr>
              <th className="p-4 text-left w-20">Code</th>
              <th className="p-4 text-left">Subject Title</th>
              <th className="p-4 text-left">Dept. & Year</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-muted-foreground"
                >
                  <LoadingAnimation />
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-muted-foreground"
                >
                  No subjects found.
                </td>
              </tr>
            ) : (
              subjects.map((s) => (
                <tr key={s._id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-primary">
                    {s.code || "N/A"}
                  </td>
                  <td className="p-4 font-bold text-foreground">{s.title}</td>
                  <td className="p-4">
                    <div className="flex flex-col text-xs gap-1">
                      <span className="flex items-center gap-1">
                        <Layers size={10} className="text-muted-foreground" />{" "}
                        {s.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap
                          size={10}
                          className="text-muted-foreground"
                        />{" "}
                        {s.yearLevel}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-success text-sm">
                        ${s.offerPrice}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        ${s.originalPrice}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(s)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <LoadingAnimation />
          </div>
        ) : (
          subjects.map((s) => (
            <div
              key={s._id}
              className="bg-card border border-border rounded-md p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary mb-1">
                    {s.code || "N/A"}
                  </span>
                  <h3 className="font-bold text-lg leading-snug">{s.title}</h3>
                </div>
                <div className="text-right">
                  <div className="font-bold text-success">${s.offerPrice}</div>
                  <div className="text-xs text-muted-foreground line-through">
                    ${s.originalPrice}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-semibold uppercase text-[10px] mb-0.5">
                    Department
                  </span>
                  <span>{s.department}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold uppercase text-[10px] mb-0.5">
                    Year Level
                  </span>
                  <span>{s.yearLevel}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => openModal(s)}
                  className="flex-1 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="flex-1 py-2.5 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL ================= */}
      <SubjectEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        subject={formData}
        setSubject={setFormData}
        onSave={handleSave}
        loading={modalLoading}
        courses={courses}
      />
    </div>
  );
}
