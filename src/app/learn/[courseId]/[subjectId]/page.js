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
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { auth } from "@/lib/firebase";

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
        // We use subjectId directly assuming the URL contains the DB _id of the subject
        // If the URL contains a slug, we might need a different endpoint or lookup
        // Assuming subjectId passed in param is the DB ID (matches previous conversations)
        const subjectRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subjects/${subjectId}`,
          header,
        );

        // 2. Fetch Videos (Flat List)

        // Actually, let's use the specific endpoint we saw in userController: /api/videos/:subjectId
        // But wait, axios.get below...
        const userVideosRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${subjectId}`,
          header,
        );

        setSubject(subjectRes.data);

        // 3. Group Videos into Chapters
        // Backend returns flat list of videos with 'chapterName'
        const videos = userVideosRes.data;
        const groupedMap = new Map();

        videos.forEach((v) => {
          const cName = v.chapterName ? v.chapterName.trim() : "Untitled";
          if (!groupedMap.has(cName)) {
            groupedMap.set(cName, {
              id: cName, // Use trimmed name as ID
              title: v.chapterName, // Keep original title
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

        // Convert Map to Array and Sort parts by partNumber
        const groupedChapters = Array.from(groupedMap.values()).map((c) => ({
          ...c,
          parts: c.parts.sort((a, b) => a.partNumber - b.partNumber),
        }));

        setChapters(groupedChapters);
        console.log("Loaded Chapters:", groupedChapters);
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
  // Note: chapter IDs in our grouped data are just the names (strings)
  const decodedChapterId = chapterId
    ? decodeURIComponent(chapterId).trim()
    : null;
  const currentChapter =
    chapters.find((c) => c.id === decodedChapterId || c.id === chapterId) ||
    chapters[0];
  const currentPart =
    currentChapter?.parts?.find((p) => p.id === partId) ||
    currentChapter?.parts?.[0];

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
      // Optional: Toast/Alert can go here
    } catch (error) {
      console.error("Failed to toggle save:", error);
      alert("Failed to save video. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLessonSelect = (cid, pid) => {
    // chapter IDs are names, so we need to encode/decode, but cleaner to just push
    router.push(
      `/learn/${courseId}/${subjectId}?chapter=${encodeURIComponent(cid)}&part=${pid}`,
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="animate-spin text-primary" size={40} />
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
    // If already embed, return
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
                className="lg:hidden p-2 rounded-md bg-surface shadow-sm border border-border text-foreground hover:bg-muted transition-colors flex-shrink-0 my-2"
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
                      {currentPart?.title || "Select a lesson"}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Video Player Area */}
              <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-white/50 ring-1 ring-gray-100 relative group">
                {currentPart?.videoUrl ? (
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

              {/* Content Grid: PC (3:1), Mobile (Buttons top, About bottom) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
                {/* Action Buttons - Order 1 on Mobile, 2 on lg */}
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

                {/* About Section - Order 2 on Mobile, 1 on lg */}
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
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Slider/Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 ease-in-out"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="absolute inset-y-0 left-0 w-80 bg-background shadow-2xl animate-in slide-in-from-left duration-300 ease-in-out flex flex-col">
              <div className="flex-1 overflow-hidden">
                <LessonSidebar
                  chapters={chapters}
                  currentChapterId={chapterId}
                  currentPartId={partId}
                  onClose={() => setIsSidebarOpen(false)}
                  onSelect={(cid, pid) => {
                    handleLessonSelect(cid, pid);
                    setIsSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
