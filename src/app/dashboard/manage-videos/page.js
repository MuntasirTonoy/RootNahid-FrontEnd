"use client";

import { useEffect, useState } from 'react';
import { Plus, Trash, Video, FileText, ExternalLink, PlayCircle, Edit, X, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function ManageVideosList() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [availableSubjects, setAvailableSubjects] = useState([]);

  const fetchData = async () => {
    try {
        const token = await auth.currentUser.getIdToken();
        const header = { headers: { Authorization: `Bearer ${token}` } };
        
        const [videosRes, subjectsRes] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/videos`, header),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subjects`, header)
        ]);

        setVideos(videosRes.data);
        setAvailableSubjects(subjectsRes.data);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchData();
    }
  }, [user]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = await auth.currentUser.getIdToken();
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/video/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire('Deleted!', 'Video has been deleted.', 'success');
          fetchData();
        } catch (error) {
          console.error("Error deleting video:", error);
          Swal.fire('Error', 'Failed to delete video', 'error');
        }
      }
    });
  };

  const handleEditClick = (video) => {
      // Find the full subject object to pre-fill department and year
      const subject = availableSubjects.find(s => s._id === video.subjectId?._id || s._id === video.subjectId);
      
      setEditingVideo({ 
          ...video,
          department: subject?.department || '',
          yearLevel: subject?.yearLevel || '',
          // Ensure subjectId is the string ID, not an object if populated
          subjectId: typeof video.subjectId === 'object' ? video.subjectId._id : video.subjectId
      });
      setIsEditModalOpen(true);
  };

  const handleUpdateVideo = async () => {
      if (!editingVideo.title || !editingVideo.videoUrl) {
          Swal.fire('Error', 'Title and Video URL are required', 'error');
          return;
      }
      
      try {
          setUpdateLoading(true);
          const token = await auth.currentUser.getIdToken();
          await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/video/${editingVideo._id}`, editingVideo, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          Swal.fire('Success', 'Video updated successfully', 'success');
          setIsEditModalOpen(false);
          setEditingVideo(null);
          fetchData();
      } catch (error) {
          console.error("Error updating video:", error);
          Swal.fire('Error', 'Failed to update video', 'error');
      } finally {
          setUpdateLoading(false);
      }
  };

  return (
    <div className="space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
             <Video size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Videos</h1>
            <p className="text-sm text-muted-foreground">Manage your uploaded video content library.</p>
          </div>
        </div>
       <Link
  href="/dashboard/manage-videos/upload"
  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
>
  <UploadIcon
    size={18}
    className="transition-transform duration-300 group-hover:-translate-y-0.5"
  />
  Upload New Video
</Link>

      </div>

      {/* Video Inventory Table */}
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-card rounded-2xl overflow-hidden">
        <table className="w-full">
            <thead className="bg-muted/40 text-xs uppercase">
            <tr>
                <th className="p-4 text-left">Video</th>
                <th className="text-left">Subject</th>
                <th className="text-left">Chapter</th>
                <th className="text-right pr-6">Actions</th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
                <tr><td colSpan="5" className="p-6 text-center">Loading videos...</td></tr>
            ) : videos.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center">No videos found.</td></tr>
            ) : (
                videos.map((video) => (
                <tr key={video._id} className="hover:bg-muted/40">
                    <td className="p-4 flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <PlayCircle size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-sm block mb-1">{video.title}</div>
                            <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2 py-1 rounded-md">
                                Part {video.partNumber}
                            </span>
                        </div>
                    </td>
                    <td>
                        <div className="text-sm font-medium">{video.subjectTitle}</div>
                    </td>
                    <td>
                        <div className="text-sm text-foreground mb-1">{video.chapterName}</div>
                        
                        <div className="flex gap-3 mt-1">
                            {video.videoUrl && (
                                <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-xs font-medium" title="Watch Video">
                                    <ExternalLink size={12} /> Video
                                </a>
                            )}
                            {video.noteLink && (
                                <a href={video.noteLink} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1 text-xs font-medium" title="View Notes">
                                    <FileText size={12} /> Notes
                                </a>
                            )}
                        </div>
                    </td>
                    <td className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                             <button onClick={() => handleEditClick(video)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="Edit Video">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(video._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete Video">
                                <Trash size={18} />
                            </button>
                        </div>
                    </td>
                </tr>
            )))}
            </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {videos.map((video) => (
          <div key={video._id} className="bg-gray-50 dark:bg-card rounded-2xl p-4 space-y-3">
            <div className="flex gap-3 items-center">
               <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <PlayCircle size={24} />
               </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm line-clamp-1">{video.title}</h3>
                <p className="text-xs text-muted-foreground">{video.subjectTitle} • {video.chapterName}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 mt-2">
                 <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2 py-1 rounded-md">
                    Part {video.partNumber}
                </span>
                
                <div className="flex gap-4 items-center">
                    {video.videoUrl && (
                        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                            <ExternalLink size={18} />
                        </a>
                    )}
                     <button onClick={() => handleEditClick(video)} className="text-blue-500 hover:text-blue-600">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(video._id)} className="text-red-500 hover:text-red-600">
                        <Trash size={18} />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit size={18} className="text-primary"/> Edit Video
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                     {/* Subject & Year Selection */}
                    <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                        <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">Change Subject (Optional)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             <select 
                                className="select select-bordered w-full rounded-xl text-sm bg-surface"
                                value={editingVideo.department || ''}
                                onChange={(e) => {
                                    setEditingVideo({
                                        ...editingVideo, 
                                        department: e.target.value, 
                                        yearLevel: '', 
                                        subjectId: '',
                                        subjectTitle: ''
                                    });
                                }}
                             >
                                <option value="" disabled>Select Department</option>
                                {[...new Set(availableSubjects.map(s => s.department))].filter(Boolean).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                             </select>

                             <select 
                                className="select select-bordered w-full rounded-xl text-sm bg-surface"
                                value={editingVideo.yearLevel || ''}
                                disabled={!editingVideo.department}
                                onChange={(e) => {
                                    setEditingVideo({
                                        ...editingVideo, 
                                        yearLevel: e.target.value,
                                        subjectId: '',
                                        subjectTitle: ''
                                    });
                                }}
                             >
                                <option value="" disabled>Select Year</option>
                                {[...new Set(availableSubjects.filter(s => s.department === editingVideo.department).map(s => s.yearLevel))].filter(Boolean).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                             </select>
                        </div>
                        
                        <select 
                            className="select select-bordered w-full rounded-xl text-sm bg-surface"
                            value={editingVideo.subjectId || ''}
                            disabled={!editingVideo.yearLevel}
                             onChange={(e) => {
                                const selectedSubject = availableSubjects.find(s => s._id === e.target.value);
                                if (selectedSubject) {
                                    setEditingVideo({
                                        ...editingVideo, 
                                        subjectId: selectedSubject._id,
                                        subjectTitle: selectedSubject.title
                                    });
                                }
                            }}
                        >
                            <option value="" disabled>Select Subject</option>
                            {availableSubjects
                                .filter(s => s.department === editingVideo.department && s.yearLevel === editingVideo.yearLevel)
                                .map(s => (
                                <option key={s._id} value={s._id}>[{s.code}] {s.title}</option>
                            ))}
                        </select>
                    </div>

                     {/* Title */}
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-muted-foreground">Video Title</label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={editingVideo.title}
                            onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                        />
                    </div>
                    
                    {/* Chapter Name & Part Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label text-xs font-bold uppercase text-muted-foreground">Chapter Name</label>
                             <input 
                                type="text" 
                                className="input input-bordered w-full rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={editingVideo.chapterName}
                                onChange={(e) => setEditingVideo({...editingVideo, chapterName: e.target.value})}
                            />
                        </div>
                         <div className="form-control">
                            <label className="label text-xs font-bold uppercase text-muted-foreground">Part Number</label>
                             <input 
                                type="number" 
                                className="input input-bordered w-full rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={editingVideo.partNumber}
                                onChange={(e) => setEditingVideo({...editingVideo, partNumber: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    {/* URL & Link */}
                     <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-muted-foreground">Video URL</label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={editingVideo.videoUrl}
                            onChange={(e) => setEditingVideo({...editingVideo, videoUrl: e.target.value})}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label text-xs font-bold uppercase text-muted-foreground">Note Link (Optional)</label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={editingVideo.noteLink}
                            onChange={(e) => setEditingVideo({...editingVideo, noteLink: e.target.value})}
                        />
                    </div>

                    {/* Access Type */}
                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-4">
                            <span className="label-text text-sm font-bold">Is Free?</span> 
                            <input 
                                type="checkbox" 
                                className="toggle toggle-success toggle-sm" 
                                checked={editingVideo.isFree}
                                onChange={(e) => setEditingVideo({...editingVideo, isFree: e.target.checked})}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateVideo}
                disabled={updateLoading}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
               {updateLoading ? <span className="loading loading-spinner loading-xs"></span> : <Save size={16} />}
               Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadIcon({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
    )
}
