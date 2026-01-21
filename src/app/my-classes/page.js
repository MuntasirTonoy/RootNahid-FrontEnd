"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MoveRight, Loader2 } from "lucide-react";
import EnrolledSubjectCard from "@/components/EnrolledSubjectCard";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function MyClasses() {
  const { user, loading: authLoading } = useAuth();
  const [enrolledData, setEnrolledData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      if (
        !user ||
        !user.purchasedSubjects ||
        user.purchasedSubjects.length === 0
      ) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Normalize subject IDs and fetch details for all purchased subjects
        const subjectPromises = user.purchasedSubjects.map((item) => {
          // Handle various ID formats (string, object with $oid, object with _id)
          const subjectId =
            (typeof item === "object" && item !== null
              ? item.$oid || item._id
              : item) || item.toString();

          return axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects/${subjectId}`)
            .then((res) => res.data)
            .catch((err) => {
              console.error(
                `Failed to fetch subject with ID: ${subjectId}`,
                err,
              );
              return null;
            });
        });

        const subjects = (await Promise.all(subjectPromises)).filter(Boolean);

        // 2. Identify unique Course IDs from the subjects
        const courseIds = [
          ...new Set(subjects.map((s) => s.courseId.toString())),
        ];

        // 3. Fetch Course details
        const coursePromises = courseIds.map((courseId) =>
          axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`)
            .then((res) => res.data)
            .catch((err) => null),
        );

        const fetchedCourses = (await Promise.all(coursePromises)).filter(
          Boolean,
        );

        // 4. Handle missing courses (Polyfill for orphaned subjects)
        const validCoursesMap = new Map(
          fetchedCourses.map((c) => [c._id.toString(), c]),
        );

        const finalCourses = [];

        courseIds.forEach((cId) => {
          if (validCoursesMap.has(cId)) {
            finalCourses.push(validCoursesMap.get(cId));
          } else {
            // Create placeholder for missing course
            const exemplar = subjects.find(
              (s) => s.courseId.toString() === cId,
            );
            if (exemplar) {
              // Construct a more friendly title based on available metadata
              let fallbackTitle = "Miscellaneous Subjects";
              if (exemplar.department && exemplar.yearLevel) {
                fallbackTitle = `${exemplar.department} - ${exemplar.yearLevel}`;
              } else if (exemplar.department) {
                fallbackTitle = `${exemplar.department} Course`;
              }

              finalCourses.push({
                _id: cId,
                title: fallbackTitle, // Dynamic friendly title
                department: exemplar.department || "General",
                yearLevel: exemplar.yearLevel || "N/A",
                subjects: [], // Will be filled below
              });
            }
          }
        });

        // 5. Group subjects by Course
        const grouped = finalCourses.map((course) => {
          const courseSubjects = subjects.filter(
            (s) =>
              s.courseId.toString() === (course._id || course.id).toString(),
          );
          return {
            ...course,
            subjects: courseSubjects,
          };
        });

        setEnrolledData(grouped);
      } catch (error) {
        console.error("Failed to fetch enrolled classes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchEnrolledClasses();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  return (
    <AuthGuard forbiddenRoles={["admin"]}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="py-12 md:py-20">
          <div className="container-custom">
            <header className="mb-12 md:mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                My Classes
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Access your enrolled subjects and continue your learning journey
                with expert guidance.
              </p>
            </header>

            {loading ? (
              <div className="flex justify-center py-32">
                <LoadingAnimation />
              </div>
            ) : enrolledData.length > 0 ? (
              <div className="space-y-20">
                {enrolledData.map((course) => (
                  <div
                    key={course.id || course._id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    {/* Course Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-border/60">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-12 bg-primary rounded-full shadow-[0_0_15px_rgba(0,230,118,0.3)]"></div>
                        <div>
                          <h2 className="text-3xl font-bold tracking-tight">
                            {course.title}
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
                              {course.department}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border"></span>
                            <span className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
                              {course.yearLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-md border border-border/50">
                        <span className="text-primary font-bold">
                          {course.subjects?.length || 0}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Enrolled Subjects
                        </span>
                      </div>
                    </div>

                    {/* Subjects Grid */}
                    {course.subjects && course.subjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {course.subjects.map((subject) => (
                          <EnrolledSubjectCard
                            key={subject._id || subject.id}
                            subject={subject}
                            courseId={course._id || course.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-surface/50 rounded-3xl p-12 text-center border border-dashed border-border">
                        <p className="text-muted-foreground italic">
                          No specific subjects listed for this course yet.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-surface rounded-[2rem] border border-border shadow-sm">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MoveRight className="text-primary rotate-180" size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4">No Enrolled Classes</h3>
                <p className="mb-10 text-muted-foreground max-w-md mx-auto text-lg">
                  Explore our selection of premium mathematics courses and start
                  your journey today.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-10 py-4 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                >
                  Browse All Courses
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
