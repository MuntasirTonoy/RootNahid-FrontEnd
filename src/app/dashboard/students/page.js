"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import Swal from 'sweetalert2';
import { User, Users, Shield, ShieldOff } from 'lucide-react';

export default function StudentsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchUsers();
    }
  }, [user]);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const actionText = newRole === 'admin' ? 'Make Admin' : 'Remove Admin';

    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${actionText.toLowerCase()} this user?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionText}`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = await auth.currentUser.getIdToken();
          await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/${userId}/role`, { role: newRole }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire('Success', `User role updated to ${newRole}`, 'success');
          fetchUsers();
        } catch (error) {
          console.error("Error updating role:", error);
          Swal.fire('Error', 'Failed to update role', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={24} />
        </div>
        <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-sm text-muted-foreground">Manage registered users and their roles</p>
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-card rounded-2xl overflow-hidden">
        <table className="w-full">
            <thead className="bg-muted/40 text-xs uppercase">
            <tr>
                <th className="p-4 text-left">User</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-right pr-6">Actions</th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
                <tr><td colSpan="4" className="p-6 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center">No users found.</td></tr>
            ) : (
                users.map((u) => (
                <tr key={u._id} className="hover:bg-muted/40">
                    <td className="p-4 flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {u.name?.charAt(0)}
                        </div> 
                        <span className="font-bold">{u.name}</span>
                    </td>
                    <td className="text-muted-foreground">{u.email}</td>
                    <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {u.role.toUpperCase()}
                        </span>
                    </td>
                    <td className="pr-6 text-right">
                        {u.email !== user.email && ( 
                                <button 
                                onClick={() => toggleRole(u._id, u.role)} 
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${u.role === 'admin' ? 'text-red-600 hover:bg-red-50' : 'text-primary hover:bg-primary/10'}`}
                            >
                                {u.role === 'admin' ? <><ShieldOff size={16}/> Remove Admin</> : <><Shield size={16}/> Make Admin</>}
                            </button>
                        )}
                    </td>
                </tr>
            )))}
            </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {users.map((u) => (
          <div key={u._id} className="bg-gray-50 dark:bg-card rounded-2xl p-4 space-y-3">
            <div className="flex gap-3 items-center">
               <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {u.name?.charAt(0)}
               </div>
              <div>
                <h3 className="font-bold">{u.name}</h3>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {u.role.toUpperCase()}
                </span>
                {u.email !== user.email && (
                    <button 
                        onClick={() => toggleRole(u._id, u.role)} 
                        className={`text-xs font-bold ${u.role === 'admin' ? 'text-red-500' : 'text-primary'}`}
                    >
                        {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
