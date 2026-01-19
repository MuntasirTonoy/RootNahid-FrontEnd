'use client';
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import SubjectCard from '@/components/SubjectCard';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CoursePage({ params }) {
  // Unwrap params using React.use for Next.js 15+ compatibility
  const { id } = use(params);
  const router = useRouter();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}`);
        const data = response.data;
        
        // Map backend data to frontend structure
        const mappedCourse = {
          id: data._id,
          title: data.title,
          shortDescription: `${data.department} - ${data.yearLevel}`,
          subjects: data.subjects.map(sub => ({
             id: sub._id,
             title: sub.title,
             description: 'Comprehensive subject module', // Placeholder
             price: sub.offerPrice,
             originalPrice: sub.originalPrice,
             icon: 'book', // Placeholder
             chapters: [] 
          }))
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
    return <div className="min-h-screen flex items-center justify-center">Loading course instructions...</div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Course not found</div>;
  }

  const toggleSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(sid => sid !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  const totalAmount = selectedSubjects.reduce((total, subjectId) => {
    const subject = course.subjects.find(s => s.id === subjectId);
    return total + (subject ? subject.price : 0);
  }, 0);

  const handleProceed = () => {
     if (selectedSubjects.length === 0) return;
     const query = selectedSubjects.join(',');
     router.push(`/checkout?courseId=${id}&subjects=${query}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-300">
      
      <main className="flex-1 py-12">
        <div className="container-custom relative">
          <Link href="/" className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 text-gray-400">
             ✕
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl font-extrabold text-dark mb-3">{course.title}</h1>
            <p className="text-lg text-gray-500">
              Build your personalized mathematics curriculum. Choose the subjects you wish to master.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {course.subjects.length > 0 ? (
              course.subjects.map((subject) => (
                <SubjectCard 
                  key={subject.id} 
                  courseId={id}
                  subject={subject} 
                  isSelected={selectedSubjects.includes(subject.id)}
                  onClick={() => toggleSubject(subject.id)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-400">No subjects available for this course yet.</div>
            )}
          </div>

        </div>
      </main>

      {/* Bottom Sticky Payment Bar */}
      <div className="fixed bottom-0 bg-primary-foreground left-0 right-0 bg-base-100  p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         <div className="container-custom flex justify-between items-center">
            <div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Total Amount</p>
              <h3 className="text-3xl font-extrabold text-primary">{totalAmount} TK</h3>
            </div>

            <button 
              onClick={handleProceed}
              disabled={selectedSubjects.length === 0}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all
                ${selectedSubjects.length > 0 
                  ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Proceed to Pay
            </button>
         </div>
      </div>
    </div>
  );
}
