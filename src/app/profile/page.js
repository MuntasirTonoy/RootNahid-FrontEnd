"use client";

import axios from "axios";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Camera,
  Save,
  X,
  ChevronDown,
  Bookmark,
  PlayCircle,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

const AVATARS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Bella",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Shadow",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Ginger",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Midnight",
];

export default function ProfilePage() {
  const { user, updateUserProfile, updateUserPassword } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState(AVATARS[0]);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Saved Videos State
  const [savedVideos, setSavedVideos] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || AVATARS[0]);
    }
  }, [user]);

  useEffect(() => {
    const fetchSavedVideos = async () => {
      if (!user) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/saved-videos`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSavedVideos(res.data);
      } catch (error) {
        console.error("Failed to fetch saved videos", error);
      } finally {
        setLoadingSaved(false);
      }
    };
    if (user) {
      fetchSavedVideos();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateUserProfile({ displayName, photoURL });

      if (newPassword) {
        await updateUserPassword(newPassword);
      }

      toast.success("Profile updated successfully!");
      setNewPassword(""); // Clear password field for security
      setShowPasswordChange(false);
    } catch (error) {
      toast.error("Failed to update profile: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectAvatar = (url) => {
    setPhotoURL(url);
    setShowAvatarModal(false);
  };

  return (
    <AuthGuard>
      <div className="container-custom pt-12 pb-24 min-h-[80vh]">
        <div className="max-w-4xl mx-auto my-6 md:my-10 space-y-6 md:space-y-8 px-4 md:px-0">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-foreground">
              My Profile
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Avatar Section */}
            <div className="bg-card rounded-3xl border border-border h-fit p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-primary ring-offset-4 ring-offset-card transition-all">
                    <img
                      src={photoURL || AVATARS[0]}
                      alt="Profile"
                      className="w-full h-full object-cover bg-surface"
                    />
                  </div>
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute bottom-0 right-0 rounded-full p-2 bg-background border border-border text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-foreground mt-2">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground break-all opacity-80">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:col-span-2 space-y-6 md:space-y-8">
              <div className="bg-card rounded-3xl border border-border p-5 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-6">
                  Account Details
                </h3>

                <form
                  onSubmit={handleUpdateProfile}
                  className="space-y-5 md:space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User size={16} className="text-muted-foreground" />{" "}
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 rounded-md bg-surface border  border-border  focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground/50 text-sm md:text-base"
                      placeholder="Your Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" /> Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-md bg-surface/50 border border-border text-muted-foreground cursor-not-allowed text-sm md:text-base"
                    />
                    <p className="text-xs text-muted-foreground pl-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="py-2">
                    <div className="border border-border rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordChange(!showPasswordChange)
                        }
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface transition-colors"
                      >
                        <div className="flex items-center gap-2 font-medium text-foreground text-sm md:text-base">
                          <Lock size={16} className="text-muted-foreground" />{" "}
                          Change Password
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${showPasswordChange ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showPasswordChange && (
                        <div className="p-4 bg-surface/30 border-t border-border animate-in slide-in-from-top-2">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-sm md:text-base"
                            placeholder="New Password"
                          />
                          <p className="text-xs text-orange-500 mt-2 pl-1">
                            Note: Requires recent login. If it fails, please
                            logout and login again.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 mb-4 md:mb-10">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-6 md:px-8 py-3 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full md:w-auto justify-center"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Saved Videos Section */}
              <div className="bg-surface rounded-3xl border border-border p-5 md:p-8">
                <header className="flex justify-between items-center mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                    <Bookmark className="text-primary" size={24} />
                    Saved Lessons
                  </h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border">
                    {savedVideos.length}{" "}
                    {savedVideos.length === 1 ? "lesson" : "lessons"}
                  </span>
                </header>

                {loadingSaved ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                ) : savedVideos.length > 0 ? (
                  <div className="space-y-4">
                    {savedVideos.map((video) => (
                      <Link
                        key={video._id}
                        href={
                          video.subjectId
                            ? `/learn/${video.subjectId.courseId}/${video.subjectId._id}?chapter=${encodeURIComponent(video.chapterName)}&part=${video._id}`
                            : "#"
                        }
                        className="flex items-start gap-3 md:gap-4 p-4 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all border border-border group"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 mt-0.5 md:mt-0">
                          <PlayCircle size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h4 className="font-bold text-foreground text-sm md:text-base truncate group-hover:text-primary transition-colors">
                              {video.title}
                            </h4>
                            <span className="inline-flex sm:hidden text-[10px] font-bold px-2 py-0.5 bg-background rounded-md border border-border w-fit text-primary/80">
                              Part {video.partNumber}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-foreground line-clamp-1 opacity-70">
                            {video.subjectId?.title || "Unknown Subject"} •{" "}
                            {video.chapterName}
                          </p>
                        </div>
                        <div className="hidden sm:block text-[10px] md:text-xs font-bold px-3 py-1.5 bg-background rounded-lg border border-border whitespace-nowrap group-hover:bg-primary transition-all">
                          Part {video.partNumber}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-foreground text-sm">
                    <p>No saved lessons yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Selection Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-3xl shadow-2xl max-w-lg w-full p-5 md:p-6 border border-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  Choose an Avatar
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
                {AVATARS.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAvatar(avatar)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${photoURL === avatar ? "border-primary ring-2 ring-primary/20 scale-95" : "border-transparent hover:border-border hover:scale-105"}`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-full object-cover bg-surface"
                    />
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="px-6 py-2 rounded-md font-medium text-foreground hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
