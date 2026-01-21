"use client";
import { use, useEffect, useState } from "react";
import LessonSidebar from "@/components/LessonSidebar";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownToLine,
  Bookmark,
  CircleCheckBig,
  Loader2,
  Menu,
  X,
  Lock,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { auth } from "@/lib/firebase";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function LearnPage({ params }) {
  const { courseId, subjectId } = use(params);
  return <LearnPageContent courseId={courseId} subjectId={subjectId} />;
}

function LearnPageContent({ courseId, subjectId }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL Params
  const chapterId = searchParams.get("chapter");
  const partId = searchParams.get("part");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await auth.currentUser.getIdToken();
        const header = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Subject Details
        const subjectRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/${subjectId}`,
          header,
        );

        // 2. Fetch Videos (Flat List) - Backend filters non-free videos if not purchased
        const userVideosRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${subjectId}`,
          header,
        );

        setSubject(subjectRes.data);

        // 3. Group Videos into Chapters
        const videos = userVideosRes.data;
        const groupedMap = new Map();

        videos.forEach((v) => {
          const cName = v.chapterName ? v.chapterName.trim() : "Untitled";
          if (!groupedMap.has(cName)) {
            groupedMap.set(cName, {
              id: cName,
              title: v.chapterName,
              parts: [],
            });
          }
          groupedMap.get(cName).parts.push({
            id: v._id,
            title: v.title,
            videoUrl: v.videoUrl,
            noteLink: v.noteLink,
            isFree: v.isFree,
            partNumber: v.partNumber,
            description: v.description,
          });
        });

        const groupedChapters = Array.from(groupedMap.values()).map((c) => ({
          ...c,
          parts: c.parts.sort((a, b) => a.partNumber - b.partNumber),
        }));

        setChapters(groupedChapters);
      } catch (error) {
        console.error("Failed to load content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, user]);

  // Determine Current Lesson
  // If no params, default to first chapter's first part
  useEffect(() => {
    if (!loading && chapters.length > 0 && (!chapterId || !partId)) {
      const firstChapter = chapters[0];
      const firstPart = firstChapter?.parts[0];
      if (firstChapter && firstPart) {
        router.replace(
          `/learn/${courseId}/${subjectId}?chapter=${encodeURIComponent(firstChapter.id)}&part=${firstPart.id}`,
        );
      }
    }
  }, [loading, chapters, chapterId, partId, router, courseId, subjectId]);

  // Find active data objects
  const decodedChapterId = chapterId
    ? decodeURIComponent(chapterId).trim()
    : null;

  // Strict check: If params exist, find EXACT match. Do not fallback if not found.
  const currentChapter = decodedChapterId
    ? chapters.find((c) => c.id === decodedChapterId)
    : chapters[0];

  const currentPart =
    partId && currentChapter
      ? currentChapter.parts.find((p) => p.id === partId)
      : !partId && chapters.length > 0
        ? chapters[0].parts[0]
        : null;

  // Check if we requested a specific video but it wasn't valid (likely filtering by backend)
  const isAccessDenied = !!(partId && !currentPart);

  // Save/Bookmark Logic
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.savedVideos && currentPart) {
      const saved = user.savedVideos.some(
        (id) =>
          (typeof id === "object" ? id._id || id : id).toString() ===
          currentPart.id.toString(),
      );
      setIsSaved(saved);
    }
  }, [user, currentPart]);

  const handleToggleSave = async () => {
    if (!user || !currentPart) return;

    try {
      setSaveLoading(true);
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/save-video`,
        { videoId: currentPart.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsSaved(res.data.isSaved);
    } catch (error) {
      console.error("Failed to toggle save:", error);
      alert("Failed to save video. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLessonSelect = (cid, pid) => {
    router.push(
      `/learn/${courseId}/${subjectId}?chapter=${encodeURIComponent(cid)}&part=${pid}`,
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <LoadingAnimation />
      </div>
    );
  }

  if (!subject)
    return (
      <div className="p-8 text-center text-red-500">
        Subject not found or access denied.
      </div>
    );

  // Helper to ensure URL is embeddable
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/embed/")) return url;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-base-300">
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <LessonSidebar
              chapters={chapters}
              currentChapterId={chapterId}
              currentPartId={partId}
              onSelect={handleLessonSelect}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md bg-surface border border-border text-foreground hover:bg-muted transition-colors flex-shrink-0 my-2"
              >
                <Menu size={24} />
              </button>

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-1">
                      <span>{subject.title || "Subject"}</span>
                      <span>/</span>
                      <span className="truncate max-w-[150px]">
                        {currentChapter?.title}
                      </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground break-words">
                      {isAccessDenied
                        ? "Content Locked"
                        : currentPart?.title || "Select a lesson"}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Video Player Area */}
              <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-white/50 ring-1 ring-gray-100 relative group">
                {isAccessDenied ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-surface">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-4">
                      <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      You need to purchase this course to access this premium
                      content.
                    </p>
                    <Link
                      href="/"
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-all"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : currentPart?.videoUrl ? (
                  <iframe
                    src={getEmbedUrl(currentPart.videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {chapters.length === 0
                      ? "No contents available yet."
                      : "Select a video to play"}
                  </div>
                )}
              </div>

              {/* Rest of the page (Action Buttons, About) */}
              {/* Only show if access is allowed */}
              {!isAccessDenied && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
                  {/* ... existing buttons ... */}
                  <div className="order-1 lg:order-2 lg:col-span-1 space-y-4">
                    <button
                      onClick={handleToggleSave}
                      disabled={saveLoading || !currentPart}
                      className={`w-full py-4 px-6 font-bold rounded-md border border-border flex items-center justify-center gap-2 transition-all duration-300 
                      ${
                        isSaved
                          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                          : "bg-surface text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {saveLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Bookmark
                          className={isSaved ? "fill-current" : ""}
                          size={20}
                        />
                      )}
                      {isSaved ? "Save video" : "Save video"}
                    </button>

                    <a
                      href={currentPart?.noteLink || "#"}
                      target={currentPart?.noteLink ? "_blank" : "_self"}
                      onClick={(e) =>
                        !currentPart?.noteLink && e.preventDefault()
                      }
                      className={`w-full py-4 px-6 font-bold rounded-md border border-border flex items-center justify-center gap-2 transition-all duration-300
                      ${
                        currentPart?.noteLink
                          ? "bg-surface text-foreground border-border hover:bg-muted cursor-pointer"
                          : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50"
                      }`}
                    >
                      <ArrowDownToLine size={20} />
                      Download Notes
                    </a>
                  </div>

                  <div className="order-2 lg:order-1 lg:col-span-3">
                    <div className="bg-surface p-8 rounded-md border border-border transition-colors duration-300 h-full">
                      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-1 h-5 bg-primary rounded-full"></div>
                        About this Lesson
                      </h3>
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {currentPart?.description ||
                          (currentPart?.title
                            ? `You are watching ${currentPart.title}. No additional description provided.`
                            : "Select a lesson to start learning.")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
        {/* Mobile Sidebar */}
        {/* ... (keep as is) ... */}
      </div>
    </AuthGuard>
  );
}
