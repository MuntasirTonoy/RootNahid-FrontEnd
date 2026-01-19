"use client";

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CourseCard from '@/components/CourseCard';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = direction === 'left' ? -400 : 400;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`);
        // Map backend data to frontend structure
        const mappedCourses = response.data.map(course => ({
          id: course._id,
          title: course.title,
          shortDescription: `${course.department} - ${course.yearLevel}`,
          price: 0, // Backend doesn't provide this yet
          offerPrice: 0,
          coverImage: course.thumbnail,
          tags: [course.yearLevel],
          features: [] // Backend doesn't provide this yet
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
                  Master <br/>
                  Mathematics <br/>
                  <span className="text-primary">with Nahid</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                  A minimal and clean platform designed to help you excel in your math journey with expert guidance and simplified learning modules.
                </p>
                
                <div className="flex items-center gap-4">
                  <button className="px-5 md:px-8 py-4 bg-primary text-primary-foreground font-bold  text-md lg:text-lg rounded-md hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1">
                    Explore Courses
                    <span>↓</span>
                  </button>
                  <button className="px-8 md:px-12 py-4 bg-surface hover:bg-surface-hover text-foreground font-bold text-md lg:text-lg rounded-md border border-border transition-colors">
                    Free Trial
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative w-full aspect-[4/3] max-w-2xl">
                 {/* Abstract 3D Shapes Placeholder - using CSS/Divs to approximate the look or an image */}
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-80 mix-blend-overlay"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-50"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Courses */}
        <section className="py-20 bg-surface transition-colors duration-300">
      <div className="container-custom">
        <div className="flex justify-between items-end mb-12">
           <div>
             <h2 className="text-4xl font-bold text-foreground mb-4">Popular Courses</h2>
             <p className="text-muted-foreground">Select the right path for your academic success</p>
           </div>
           <div className="flex gap-3">
             <button 
               onClick={() => scroll('left')}
               className="w-12 h-12 flex items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:shadow-lg active:scale-95"
             >
                <ArrowLeft className="w-5 h-5" />
             </button>
             <button 
               onClick={() => scroll('right')}
               className="w-12 h-12 flex items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:shadow-lg active:scale-95"
             >
                <ArrowRight className="w-5 h-5" />
             </button>
           </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
             <div className="w-full text-center py-20">Loading courses...</div>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="min-w-[300px] md:min-w-[350px] snap-start">
                  <CourseCard course={course} />
              </div>
            ))
          ) : (
             <div className="w-full text-center py-20 text-muted-foreground">No courses available at the moment.</div>
          )}
        </div>
      </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-background transition-colors duration-300">
           <div className="container-custom">
              <div className="bg-surface rounded-3xl p-12 shadow-sm border border-border flex flex-col md:flex-row justify-between items-center gap-12 transition-colors duration-300">
                 <div className="text-center flex-1">
                    <h3 className="text-5xl font-extrabold text-primary mb-2">5k+</h3>
                    <p className="font-bold text-muted-foreground text-sm tracking-widest uppercase">Students</p>
                 </div>
                 <div className="text-center flex-1 border-l border-border/50">
                    <h3 className="text-5xl font-extrabold text-primary mb-2">48+</h3>
                    <p className="font-bold text-muted-foreground text-sm tracking-widest uppercase">Courses</p>
                 </div>
                 <div className="text-center flex-1 border-l border-border/50">
                    <h3 className="text-5xl font-extrabold text-primary mb-2">99%</h3>
                    <p className="font-bold text-muted-foreground text-sm tracking-widest uppercase">Success Rate</p>
                 </div>
                 <div className="text-center flex-1 border-l border-border/50">
                    <h3 className="text-5xl font-extrabold text-primary mb-2">24/7</h3>
                    <p className="font-bold text-muted-foreground text-sm tracking-widest uppercase">Support</p>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}
