"use client";
import { useState, useEffect, use } from "react";
import axios from "axios";
import SubjectCard from "@/components/SubjectCard";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import { ArrowRight, X } from "lucide-react";

export default function CoursePage({ params }) {
  // Unwrap params using React.use for Next.js 15+ compatibility
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}`,
        );
        const data = response.data;

        // Map backend data to frontend structure
        const mappedCourse = {
          id: data._id,
          title: data.title,
          shortDescription: `${data.department} - ${data.yearLevel}`,
          subjects: data.subjects.map((sub) => ({
            id: sub._id,
            title: sub.title,
            description: "Comprehensive subject module", // Placeholder
            price: sub.offerPrice,
            originalPrice: sub.originalPrice,
            icon: "book", // Placeholder
            chapters: [],
          })),
        };

        setCourse(mappedCourse);
      } catch (error) {
        console.error("Failed to fetch course:", error);
        // If 404, we might want to redirect or show not found
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading course instructions...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Course not found
      </div>
    );
  }

  const toggleSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter((sid) => sid !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const totalAmount = selectedSubjects.reduce((total, subjectId) => {
    const subject = course.subjects.find((s) => s.id === subjectId);
    return total + (subject ? subject.price : 0);
  }, 0);

  const handleProceed = () => {
    if (selectedSubjects.length === 0) return;

    if (user?.role === "admin") {
      Swal.fire({
        icon: "info",
        title: "Admin Access",
        text: "You are an admin, you don't need to purchase courses!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const query = selectedSubjects.join(",");
    router.push(`/checkout?courseId=${id}&subjects=${query}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-300">
      <main className="flex-1 py-12">
        <div className="container-custom relative">
          <Link
            href="/"
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-surface text-muted-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl font-extrabold text-dark mb-3">
              {course.title}
            </h1>
            <p className="text-lg text-gray-500">
              Select the subjects you want to purchase.
            </p>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-32">
            {course.subjects.length > 0 ? (
              course.subjects.map((subject) => {
                const isPurchased =
                  user?.purchasedSubjects?.includes(subject.id) || false;
                return (
                  <SubjectCard
                    key={subject.id}
                    courseId={id}
                    subject={subject}
                    isSelected={selectedSubjects.includes(subject.id)}
                    isPurchased={isPurchased}
                    onClick={() => !isPurchased && toggleSubject(subject.id)}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-400 py-20">
                No subjects available for this course yet.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Sticky Payment Bar */}
      <div className="fixed py-3 bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 transition-colors duration-300">
        <div className="container-custom py-4 md:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Total Amount
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-4xl font-black text-primary leading-none">
                  {totalAmount}
                </span>
                <span className="text-xs md:text-sm font-bold text-muted-foreground">
                  TK
                </span>
              </div>
            </div>

            <button
              onClick={handleProceed}
              disabled={selectedSubjects.length === 0}
              className={`px-6 py-3.5 md:px-10 md:py-4 rounded-md font-bold text-sm md:text-lg transition-all duration-300 flex items-center justify-center gap-2
                  ${
                    selectedSubjects.length > 0
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover   hover:shadow-primary/40 active:scale-95"
                      : "bg-surface text-muted-foreground cursor-not-allowed"
                  }`}
            >
              <span>Proceed to Pay</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
