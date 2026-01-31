"use client";

import { useEffect, useState } from "react";
import {
  Trash,
  Video,
  FileText,
  ExternalLink,
  PlayCircle,
  Edit,
  X,
  Save,
  MonitorPlay,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Link from "next/link";

import LoadingAnimation from "@/components/LoadingAnimation";

import Pagination from "@/components/dashboard/Pagination";
import EmptyState from "@/components/EmptyState";

export default function ManageVideosList() {
  const { user } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [availableSubjects, setAvailableSubjects] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const header = { headers: { Authorization: `Bearer ${token}` } };

      const [videosRes, subjectsRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/videos?page=${currentPage}&limit=10`,
          header,
        ),
        // Fetch all subjects for the dropdowns
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/subjects?limit=1000`,
          header,
        ),
      ]);

      // Handle Paginated Response
      if (videosRes.data.pagination) {
        setVideos(videosRes.data.data);
        setTotalPages(videosRes.data.pagination.pages);
      } else {
        // Fallback if API hasn't updated yet or error
        setVideos(videosRes.data);
      }

      // Handle Subjects (Check if paginated or array)
      if (subjectsRes.data.data) {
        setAvailableSubjects(subjectsRes.data.data);
      } else {
        setAvailableSubjects(subjectsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, currentPage]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeletingId(id);
          const token = await auth.currentUser.getIdToken();
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/video/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          toast.success("Video deleted successfully");
          fetchData();
        } catch (error) {
          console.error("Error deleting video:", error);
          toast.error("Failed to delete video");
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleEditClick = (video) => {
    if (video.editLogId) {
      router.push(`/dashboard/edit-panel/${video.editLogId}`);
    } else {
      toast.info("Legacy videos cannot be batch edited");
    }
  };

  // Helper to convert YouTube links to Embed format
  const getEmbedUrl = (url) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  // Helper to convert to Watch URL for "Source" button
  const getWatchUrl = (url) => {
    if (!url) return "#";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/watch?v=${match[2]}`
      : url;
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo.title || !editingVideo.videoUrl) {
      toast.error("Title and Video URL are required");
      return;
    }

    try {
      setUpdateLoading(true);
      const token = await auth.currentUser.getIdToken();

      // Apply transformation to videoUrl before sending
      const updatedVideoData = {
        ...editingVideo,
        videoUrl: getEmbedUrl(editingVideo.videoUrl),
        description: editingVideo.description,
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/video/${editingVideo._id}`,
        updatedVideoData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Video updated successfully");
      setIsEditModalOpen(false);
      setEditingVideo(null);
      fetchData();
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("Failed to update video");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Video size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Manage Videos
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your uploaded video content library.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/manage-videos/upload"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground w-full sm:w-auto hover:cursor-pointer hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        >
          <UploadIcon
            size={18}
            className="transition-transform duration-300 group-hover:-translate-y-0.5"
          />
          Upload Video
        </Link>
      </div>

      {/* Video Inventory Table */}
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-card rounded-md border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30 text-xs uppercase font-semibold border-b border-border">
            <tr>
              <th className="p-4 text-left">Video</th>
              <th className="text-left font-semibold">Subject</th>
              <th className="text-left font-semibold">Chapter</th>
              <th className="text-right pr-6 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-6 text-center">
                  <LoadingAnimation />
                </td>
              </tr>
            ) : videos.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center">
                  <EmptyState
                    message="No Videos Found"
                    description="Get started by uploading your first video content."
                  />
                </td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr
                  key={video._id}
                  className="hover:bg-muted/10 hover:cursor-pointer"
                >
                  <td className="p-4 flex gap-4 items-center">
                    {(() => {
                      const sub = video.subjectId;
                      const sId = sub?._id || sub;
                      const cId = sub?.courseId?._id || sub?.courseId;
                      const chapter = video.chapterName?.trim() || "Untitled";

                      return (
                        <Link
                          href={`/learn/${cId}/${sId}?chapter=${encodeURIComponent(chapter)}&part=${video._id}`}
                          target="_blank"
                          className="w-10 h-10 rounded-lg bg-red-100/50 text-red-600 flex items-center justify-center shrink-0 hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-105"
                          title="Play in App"
                        >
                          <PlayCircle size={20} />
                        </Link>
                      );
                    })()}
                    <div>
                      <div className="font-bold text-sm block mb-1">
                        {video.title}
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2 py-1 rounded-md">
                        Part {video.partNumber}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-medium">
                      {video.subjectId?.title || "Unknown Subject"}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-foreground">
                      {video.chapterName}
                    </div>
                  </td>
                  <td className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={getWatchUrl(video.videoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                        title="View Video Source"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button
                        onClick={() => handleEditClick(video)}
                        className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                        title="Edit Video"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(video._id)}
                        disabled={deletingId === video._id}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Video"
                      >
                        {deletingId === video._id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <Trash size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {videos.length === 0 && !loading ? (
          <EmptyState
            message="No Videos Found"
            description="Get started by uploading your first video content."
          />
        ) : (
          videos.map((video) => (
            <div
              key={video._id}
              className="bg-surface rounded-2xl p-4 space-y-3"
            >
              {(() => {
                const sub = video.subjectId;
                const sId = sub?._id || sub;
                const cId = sub?.courseId?._id || sub?.courseId;
                const chapter = video.chapterName?.trim() || "Untitled";

                return (
                  <Link
                    href={`/learn/${cId}/${sId}?chapter=${encodeURIComponent(chapter)}&part=${video._id}`}
                    className="flex gap-3 items-center hover:bg-muted/10 transition-colors p-2 -mx-2 rounded-lg group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center shrink-0 border border-red-200/50 transition-transform group-hover:scale-105">
                      <PlayCircle size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground line-clamp-1 leading-tight mb-1">
                        {video.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground truncate font-medium">
                        {video.subjectId?.title || "Unknown"} •{" "}
                        {video.chapterName}
                      </p>
                    </div>
                  </Link>
                );
              })()}

              <div className="flex flex-wrap gap-2 py-1">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2 py-1 rounded-md">
                  Part {video.partNumber}
                </span>
                {video.noteLink && (
                  <a
                    href={video.noteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100"
                  >
                    <FileText size={10} /> Notes
                  </a>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border/50">
                <a
                  href={getWatchUrl(video.videoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                  title="View Video Source"
                >
                  <ExternalLink size={20} />
                </a>

                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleEditClick(video)}
                    className="p-2 bg-blue-50 text-blue-500 rounded-md"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    disabled={deletingId === video._id}
                    className="p-2 bg-red-50 text-red-500 rounded-md disabled:opacity-50"
                  >
                    {deletingId === video._id ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Trash size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />
    </div>
  );
}

function UploadIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
