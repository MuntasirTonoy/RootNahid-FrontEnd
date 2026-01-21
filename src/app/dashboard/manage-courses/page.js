"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit, X, SquareChartGantt } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import Swal from "sweetalert2";

import Link from "next/link";
import CourseEditModal from "@/components/dashboard/CourseEditModal";

export default function ManageCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    yearLevel: "",
    thumbnail: "",
  });

  const fetchCourses = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCourses(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCourses();
  }, [user]);

  const openModal = (course = null) => {
    if (course) {
      setIsEditing(true);
      setCurrentCourse(course);
      setFormData(course);
    } else {
      setIsEditing(false);
      setFormData({
        title: "",
        department: "",
        yearLevel: "",
        thumbnail: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await auth.currentUser.getIdToken();

    try {
      if (isEditing) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/course/${currentCourse._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Swal.fire("Updated", "Course updated successfully", "success");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/course`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Swal.fire("Created", "Course created successfully", "success");
      }
      setModalOpen(false);
      fetchCourses();
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!res.isConfirmed) return;

    const token = await auth.currentUser.getIdToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/course/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchCourses();
    Swal.fire("Deleted", "Course removed", "success");
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <SquareChartGantt size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manage Courses</h1>
            <p className="text-sm text-muted-foreground">
              Manage your course inventory
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/manage-courses/add"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground w-full sm:w-auto hover:cursor-pointer hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        >
          <Plus size={18} />
          Add Course
        </Link>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-card rounded-md border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/3 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Course</th>
              <th className="text-left">Department</th>
              <th className="text-left">Year</th>
              <th className="text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-6 text-center">
                  Loading…
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c._id} className="hover:bg-muted/10">
                  <td className="p-4 flex gap-4 items-center">
                    <img
                      src={c.thumbnail}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="font-bold">{c.title}</span>
                  </td>
                  <td className="text-left">{c.department}</td>
                  <td className="text-left">{c.yearLevel}</td>
                  <td className="pr-6 text-right space-x-2">
                    <button
                      onClick={() => openModal(c)}
                      className="text-blue-500"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-500"
                    >
                      <Trash size={18} />
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
        {courses.map((c) => (
          <div
            key={c._id}
            className="bg-gray-50 dark:bg-card rounded-2xl p-4 space-y-3"
          >
            <div className="flex gap-3 items-center">
              <img
                src={c.thumbnail}
                className="w-14 h-14 rounded-md object-cover"
              />
              <div>
                <h3 className="font-bold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.department}</p>
                <p className="text-sm">{c.yearLevel}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => openModal(c)}
                className="flex-1 py-2 rounded-md bg-blue-50 text-blue-600 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                className="flex-1 py-2 rounded-md bg-red-50 text-red-600 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      <CourseEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
