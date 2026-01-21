"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import CourseCard from "@/components/CourseCard";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Lottie from "lottie-react";
import heroAnimation from "../../public/hero-student.json";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScroll(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [courses]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = direction === "left" ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses`,
        );
        // Map backend data to frontend structure
        const mappedCourses = response.data.map((course) => ({
          id: course._id,
          title: course.title,
          shortDescription: `${course.department} - ${course.yearLevel}`,
          price: 0, // Backend doesn't provide this yet
          offerPrice: 0,
          coverImage: course.thumbnail,
          tags: [course.yearLevel],
          features: [], // Backend doesn't provide this yet
          subjects: course.subjects || [],
        }));
        setCourses(mappedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-light dark:bg-gray-950 transition-colors duration-300">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-background pt-12 pb-20 overflow-hidden relative transition-colors duration-300">
          <div className="container-custom relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
                  Master <br />
                  Mathematics <br />
                  <span className="text-primary">with Nahid</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                  A modern learning platform designed to elevate your math
                  journey with clear concepts, expert support, and simplified
                  modules. Upgrade to the full version and unlock your complete
                  learning potential..
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      document
                        .getElementById("popular-courses")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="px-5 md:px-8 py-4 bg-primary text-primary-foreground font-bold  text-md lg:text-lg rounded-md hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1"
                  >
                    Explore Courses
                    <span>↓</span>
                  </button>
                  <button className="px-8 md:px-12 py-4 bg-surface hover:bg-surface-hover text-foreground font-bold text-md lg:text-lg rounded-md border border-border transition-colors">
                    Free Trial
                  </button>
                </div>
              </div>

              <div className="flex-1 relative w-full aspect-[4/3] max-w-2xl">
                <Lottie animationData={heroAnimation} loop={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Popular Courses */}
        <section
          id="popular-courses"
          className="py-12 md:py-20 bg-surface transition-colors duration-300"
        >
          <div className="container-custom">
            <div className="flex flex-col items-center text-center mb-12">
              {/* <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary rounded-full">
                Top Rated
              </span> */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                Popular Courses
              </h2>
              <p className="text-muted-foreground text-sm md:text-lg max-w-2xl text-balance leading-relaxed">
                Select the right path for your academic success.
              </p>

              {canScroll && (
                <div className="hidden md:flex gap-4 mt-8">
                  <button
                    onClick={() => scroll("left")}
                    className="w-12 h-12 flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:shadow-lg active:scale-95 group"
                    aria-label="Scroll left"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    className="w-12 h-12 flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:shadow-lg active:scale-95 group"
                    aria-label="Scroll right"
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={scrollContainerRef}
              className={`flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 ${!canScroll ? "md:justify-center" : ""}`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {loading ? (
                <div className="w-full flex justify-center py-20">
                  <LoadingAnimation />
                </div>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="min-w-[300px] md:min-w-[350px] snap-start"
                  >
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-20 text-muted-foreground">
                  No courses available at the moment.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-20 bg-background transition-colors duration-300">
          <div className="container-custom">
            <div className="bg-surface rounded-3xl p-8 md:p-12 shadow-sm border border-border grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 transition-colors duration-300">
              <div className="text-center">
                <h3 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                  5k+
                </h3>
                <p className="font-bold text-muted-foreground text-[10px] md:text-xs tracking-widest uppercase">
                  Students
                </p>
              </div>
              <div className="text-center border-l border-border/50">
                <h3 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                  48+
                </h3>
                <p className="font-bold text-muted-foreground text-[10px] md:text-xs tracking-widest uppercase">
                  Courses
                </p>
              </div>
              <div className="text-center lg:border-l border-border/50">
                <h3 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                  99%
                </h3>
                <p className="font-bold text-muted-foreground text-[10px] md:text-xs tracking-widest uppercase">
                  Success Rate
                </p>
              </div>
              <div className="text-center border-l border-border/50">
                <h3 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                  24/7
                </h3>
                <p className="font-bold text-muted-foreground text-[10px] md:text-xs tracking-widest uppercase">
                  Support
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
