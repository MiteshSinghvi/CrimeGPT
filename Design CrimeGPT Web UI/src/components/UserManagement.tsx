import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldAlert, Trash2, Search, Loader2, Shield, UserCircle, Key, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type UserRole = 
  | 'Administrator'
  | 'Investigating Officer'
  | 'Senior Officer / Supervisor'
  | 'Legal Officer'
  | 'Forensic Expert';

interface User {
  id: string;
  name: string;
  email: string;
  badge_id: string;
  department: string;
  role: UserRole;
  created_at: string;
}

const ROLES: UserRole[] = [
  'Administrator',
  'Senior Officer / Supervisor',
  'Investigating Officer',
  'Legal Officer',
  'Forensic Expert'
];

function getRoleColor(role: string) {
  switch (role) {
    case 'Administrator': return 'text-amber-400';
    case 'Legal Officer': return 'text-purple-400';
    case 'Forensic Expert': return 'text-emerald-400';
    case 'Senior Officer / Supervisor': return 'text-blue-400';
    default: return 'text-slate-400';
  }
}

export function UserManagement({ user }: { user: any }) {
  const { t } = useTranslation();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users from database");
      } else {
        setUsersList(data as User[] || []);
      }
      setIsLoading(false);
    }
    
    if (user.role === 'Administrator') {
      fetchUsers();
    }
  }, [user.role]);

  if (user.role !== 'Administrator') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full text-red-400">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Restricted Area</h2>
        <p className="text-slate-400 max-w-md text-center">
          Administrator clearance required to manage personnel.
        </p>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Officer role updated to ${newRole} successfully.`);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      console.error("Supabase update error:", error);
      console.log("If this is a schema cache error, try running the SQL migration and refreshing the browser.");
      toast.error(`Error: ${error.message || "Failed to update role"}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirm = window.confirm("Are you sure you want to revoke access for this officer? This action cannot be undone.");
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success("User access revoked successfully.");
      setUsersList(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      console.error("Supabase delete error:", error);
      toast.error(`Error: ${error.message || "Failed to revoke user access"}`);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.badge_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
            <Users size={24} className="text-amber-400" />
            {t("Personnel Management")}
          </h2>
          <p className="text-sm text-slate-400 mt-1">View and manage officer access, roles, and departmental permissions.</p>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email, or badge..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-[#1C2541]/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 bg-[#1C2541]/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Officer Details</th>
                <th className="px-6 py-4">Badge / ID</th>
                <th className="px-6 py-4">Access Role</th>
                <th className="px-6 py-4 hidden md:table-cell">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-amber-400" />
                    Loading personnel data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No officers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-blue-700 to-blue-900 text-white shrink-0">
                          {u.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || <UserCircle size={18} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300 font-mono">{u.badge_id || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{u.department || 'Unassigned'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className={`appearance-none bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer ${getRoleColor(u.role)}`}
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role} className="bg-slate-900 text-slate-300">
                              {role}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={user.id === u.id}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                        title={user.id === u.id ? "Cannot revoke your own access" : "Revoke Access"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
