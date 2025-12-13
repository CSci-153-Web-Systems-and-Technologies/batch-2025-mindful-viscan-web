'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import NavBar from '@/app/components/NavBar';
import { supabase } from '@/lib/supabase';

interface CounselingSession {
  id: string;
  status: string;
  type: string;
  scheduled_at: string;
  counselor: {
    id: string;
    email?: string;
    full_name?: string;
  } | null;
}

export default function StudentDashboard() {
  const { user, isLoaded } = useUser();
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mood & Thoughts state
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [thoughts, setThoughts] = useState('');
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [isSavingThoughts, setIsSavingThoughts] = useState(false);
  const maxThoughtsLength = 50;

  // Fetch counseling sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Try to find user in Supabase - check if id matches Clerk userId or if there's a clerk_id field
        let studentId = user.id;
        let userFound = false;
        
        // First try: assume users.id matches Clerk userId
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (userData && !userError) {
          studentId = userData.id;
          userFound = true;
        } else {
          // If not found, try clerk_id field
          const { data: userDataByClerkId, error: clerkIdError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', user.id)
            .single();
          
          if (userDataByClerkId && !clerkIdError) {
            studentId = userDataByClerkId.id;
            userFound = true;
          } else {
            // User not found in Supabase - this is okay, they might not have any sessions yet
            console.log('User not found in Supabase users table. This is normal for new users.');
            setSessions([]);
            setLoading(false);
            return;
          }
        }

        // Fetch counseling sessions
        const { data: joinedData, error: joinError } = await supabase
          .from('counseling_sessions')
          .select(`
            id,
            status,
            type,
            scheduled_at,
            counselor_id
          `)
          .eq('student_id', studentId)
          .order('scheduled_at', { ascending: false });

        if (joinError) {
          // Log detailed error information
          const errorInfo: any = {
            message: joinError.message || 'Unknown error',
            details: joinError.details || 'No details available',
            hint: joinError.hint || 'No hint available',
            code: joinError.code || 'No error code',
          };
          
          // Log the full error object
          console.error('Error fetching counseling sessions:', errorInfo);
          console.error('Full error object:', JSON.stringify(joinError, null, 2));
          
          // Common error: Table doesn't exist or RLS policy issue
          if (joinError.code === 'PGRST116' || joinError.message?.includes('relation') || joinError.message?.includes('does not exist')) {
            console.warn('Possible issue: Table "counseling_sessions" may not exist or RLS policies may be blocking access.');
          }
          
          setSessions([]);
          return;
        }

        if (!joinedData) {
          setSessions([]);
          return;
        }

        let sessionsData = joinedData;
        
        // Fetch counselor info separately if counselor_id exists
        const counselorIds = [...new Set(joinedData.map((s: any) => s.counselor_id).filter(Boolean))];
        
        if (counselorIds.length > 0) {
          const { data: counselorsData, error: counselorsError } = await supabase
            .from('users')
            .select('id, full_name, email')
            .in('id', counselorIds);

          if (counselorsError) {
            console.error('Error fetching counselors:', {
              message: counselorsError.message,
              details: counselorsError.details,
              hint: counselorsError.hint,
              code: counselorsError.code,
              error: counselorsError
            });
          }

          // Map counselor data to sessions (even if there was an error, continue with available data)
          const counselorsMap = new Map(
            (counselorsData || []).map((c: any) => [c.id, c])
          );

          sessionsData = sessionsData.map((session: any) => ({
            ...session,
            counselor: session.counselor_id ? (counselorsMap.get(session.counselor_id) || null) : null,
          }));
        }

        // Transform data to match our interface
        const transformedSessions = sessionsData.map((session: any) => ({
          id: session.id,
          status: session.status || 'Pending',
          type: session.type || 'General',
          scheduled_at: session.scheduled_at,
          counselor: session.counselor ? {
            id: session.counselor.id,
            full_name: session.counselor.full_name,
            email: session.counselor.email,
          } : null,
        }));
        setSessions(transformedSessions);
      } catch (error) {
        console.error('Unexpected error fetching sessions:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchSessions();
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
        <NavBar />
        <div className="flex flex-grow items-center justify-center p-6 pt-24">
          <div className="text-gray-200">Loading...</div>
        </div>
      </main>
    );
  }

  // Get user's name from Clerk
  const userName = user?.firstName || user?.fullName || 'User';

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      session.status?.toLowerCase().includes(searchTerm) ||
      session.type?.toLowerCase().includes(searchTerm) ||
      session.counselor?.full_name?.toLowerCase().includes(searchTerm) ||
      session.counselor?.email?.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / rowsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle row selection
  const toggleRowSelection = (sessionId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === paginatedSessions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedSessions.map(s => s.id)));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Get counselor display name/email
  const getCounselorDisplay = (counselor: CounselingSession['counselor']) => {
    if (!counselor) return 'N/A';
    // In a real app, you'd fetch email from users table or Clerk
    // For now, use a placeholder or full_name
    return counselor.email || counselor.full_name || 'Unknown';
  };

  // Calendar functions
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ day: number; isCurrentMonth: boolean }> = [];
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    
    // Add days from next month to fill the grid (6 rows * 7 days = 42)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    
    return days;
  };
  
  const isToday = (day: number, date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value));
    setCurrentDate(newDate);
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value));
    setCurrentDate(newDate);
  };
  
  const calendarDays = getDaysInMonth(currentDate);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Generate year options (current year ± 5 years)
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i);
  }

  // Mood emojis (1 = very happy, 5 = very sad)
  const moodEmojis = ['😊', '🙂', '😐', '😔', '😢'];
  
  // Handle mood selection and save to Supabase
  const handleMoodClick = async (moodRating: number) => {
    if (!user?.id || isSavingMood) return;
    
    try {
      setIsSavingMood(true);
      setSelectedMood(moodRating);
      
      // Get user's Supabase ID (same logic as sessions)
      let userId = user.id;
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!userData) {
        const { data: userDataByClerkId } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single();
        
        if (userDataByClerkId) {
          userId = userDataByClerkId.id;
        }
      } else {
        userId = userData.id;
      }
      
      // Insert mood log
      const { error } = await supabase
        .from('mood_logs')
        .insert({
          user_id: userId,
          mood_rating: moodRating,
          note: null,
        });
      
      if (error) {
        console.error('Error saving mood:', error);
        setSelectedMood(null);
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      setSelectedMood(null);
    } finally {
      setIsSavingMood(false);
    }
  };
  
  // Handle thoughts save to Supabase
  const handleSaveThoughts = async () => {
    if (!user?.id || !thoughts.trim() || isSavingThoughts) return;
    
    try {
      setIsSavingThoughts(true);
      
      // Get user's Supabase ID
      let userId = user.id;
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!userData) {
        const { data: userDataByClerkId } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single();
        
        if (userDataByClerkId) {
          userId = userDataByClerkId.id;
        }
      } else {
        userId = userData.id;
      }
      
      // Insert thought
      const { error } = await supabase
        .from('thoughts')
        .insert({
          user_id: userId,
          content: thoughts.trim(),
        });
      
      if (error) {
        console.error('Error saving thoughts:', error);
      } else {
        // Clear thoughts after successful save
        setThoughts('');
      }
    } catch (error) {
      console.error('Error saving thoughts:', error);
    } finally {
      setIsSavingThoughts(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
      <NavBar />
      <div className="flex flex-grow p-8 md:p-12 pt-24">
        {/* Main card with padding to show gradient background around it */}
        <div className="w-full mx-auto">
          <div className="rounded-2xl bg-[#031207] p-6 md:p-10 lg:p-12 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] min-h-[calc(100vh-14rem)] flex flex-col">
            {/* Two-column grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[68%_32%] gap-6 lg:gap-8 flex-1">
              {/* Left Column - Wider */}
              <div className="flex flex-col flex-1">
                {/* Welcome Header */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-kodchasan font-bold mb-8 bg-gradient-to-r from-[#42734D] via-[#5A9F5F] to-[#6A9F6F] bg-clip-text text-transparent">
                  Welcome! How are you today, {userName}?
                </h1>
                
                {/* Session History Section - Card with green border */}
                <div className="flex flex-col flex-1 rounded-lg bg-[#031207] border-t border-l border-gray-900/50 border-r-2 border-b-2 border-r-mindful-green/60 border-b-mindful-green/60 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] p-6">
                  <div className="flex flex-col flex-1 gap-4">
                    <h2 className="text-gray-200 text-lg font-medium">Session History</h2>
                  
                  {/* Filter and Columns */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Filter sessions..."
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="flex-1 px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-mindful-green"
                    />
                    <button className="px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 hover:bg-[#1a2f1a] transition-colors flex items-center gap-2">
                      Columns
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Table */}
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-[#0F1E0F] rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#0F1E0F] border-b border-gray-700">
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedRows.size === paginatedSessions.length && paginatedSessions.length > 0}
                                  onChange={toggleAllSelection}
                                  className="rounded border-gray-600 bg-[#0F1E0F] text-mindful-green focus:ring-mindful-green"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-gray-200 text-sm font-medium">Status</th>
                              <th className="px-4 py-3 text-left text-gray-200 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  Counselor
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                </div>
                              </th>
                              <th className="px-4 py-3 text-left text-gray-200 text-sm font-medium">Date</th>
                              <th className="px-4 py-3 text-left text-gray-200 text-sm font-medium">Session Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedSessions.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                  No sessions found
                                </td>
                              </tr>
                            ) : (
                              paginatedSessions.map((session, index) => (
                                <tr
                                  key={session.id}
                                  className={`border-b border-gray-800 ${
                                    index % 2 === 0 ? 'bg-[#031207]' : 'bg-[#0a1a0a]'
                                  } hover:bg-[#0F1E0F] transition-colors`}
                                >
                                  <td className="px-4 py-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedRows.has(session.id)}
                                      onChange={() => toggleRowSelection(session.id)}
                                      className="rounded border-gray-600 bg-[#0F1E0F] text-mindful-green focus:ring-mindful-green"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-gray-200 text-sm">{session.status || 'N/A'}</td>
                                  <td className="px-4 py-3 text-gray-200 text-sm">
                                    {getCounselorDisplay(session.counselor)}
                                  </td>
                                  <td className="px-4 py-3 text-gray-200 text-sm">
                                    {session.scheduled_at ? formatDate(session.scheduled_at) : 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-gray-200 text-sm">{session.type || 'N/A'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination and Selection Info */}
                      <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-sm">
                          {selectedRows.size} of {filteredSessions.length} row(s) selected.
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 hover:bg-[#1a2f1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 hover:bg-[#1a2f1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons - Pushed to bottom */}
                      <div className="flex justify-end gap-3 mt-auto pt-4">
                        <button
                          disabled={selectedRows.size === 0}
                          className="px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 hover:bg-[#1a2f1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete Selected
                        </button>
                        <button className="px-4 py-2 bg-mindful-green hover:bg-[#5a9f5f] text-white rounded-lg transition-colors font-medium">
                          Request new session
                        </button>
                      </div>
                    </>
                  )}
                  </div>
                </div>
              </div>

              {/* Right Column - Narrower */}
              <div className="flex flex-col gap-6">
                {/* Upcoming Events Calendar */}
                <div className="rounded-lg bg-[#031207] border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] p-6">
                  <h2 className="text-gray-200 text-lg font-medium mb-4">Upcoming Events</h2>
                  
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="text-gray-200 hover:text-mindful-green transition-colors p-1"
                      aria-label="Previous month"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={currentMonth}
                        onChange={handleMonthChange}
                        className="bg-[#0F1E0F] border border-gray-700 rounded px-2 py-1 text-gray-200 text-sm focus:outline-none focus:border-mindful-green cursor-pointer"
                      >
                        {monthNames.map((month, index) => (
                          <option key={index} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        value={currentYear}
                        onChange={handleYearChange}
                        className="bg-[#0F1E0F] border border-gray-700 rounded px-2 py-1 text-gray-200 text-sm focus:outline-none focus:border-mindful-green cursor-pointer"
                      >
                        {yearOptions.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={() => navigateMonth('next')}
                      className="text-gray-200 hover:text-mindful-green transition-colors p-1"
                      aria-label="Next month"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-gray-400 text-xs font-medium py-1">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {calendarDays.map((dayInfo, index) => {
                      const { day, isCurrentMonth } = dayInfo;
                      const isTodayDate = isToday(day, currentDate, isCurrentMonth);
                      
                      return (
                        <div
                          key={index}
                          className={`
                            aspect-square flex items-center justify-center text-sm
                            ${isCurrentMonth ? 'text-gray-200' : 'text-gray-500'}
                            ${isTodayDate 
                              ? 'bg-mindful-green/30 border-2 border-mindful-green rounded' 
                              : 'hover:bg-[#0F1E0F] rounded transition-colors cursor-pointer'
                            }
                          `}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Mood & Thoughts Section */}
                <div className="rounded-lg bg-[#031207] border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] p-6">
                  {/* Mood Selection */}
                  <div className="mb-6">
                    <div className="flex justify-center gap-4">
                      {moodEmojis.map((emoji, index) => {
                        const moodRating = index + 1;
                        const isSelected = selectedMood === moodRating;
                        return (
                          <button
                            key={moodRating}
                            onClick={() => handleMoodClick(moodRating)}
                            disabled={isSavingMood}
                            className={`
                              w-12 h-12 rounded-full flex items-center justify-center text-2xl
                              transition-all duration-200
                              ${isSelected 
                                ? 'bg-mindful-green/30 border-2 border-mindful-green scale-110' 
                                : 'bg-[#0F1E0F] border-2 border-gray-700 hover:border-mindful-green/50 hover:scale-105'
                              }
                              ${isSavingMood ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            aria-label={`Mood rating ${moodRating}`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Thoughts Input */}
                  <div className="space-y-2">
                    <textarea
                      value={thoughts}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= maxThoughtsLength) {
                          setThoughts(value);
                        }
                      }}
                      placeholder="Thoughts for the day?"
                      rows={4}
                      className="w-full px-4 py-3 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-mindful-green resize-none"
                    />
                    
                    {/* Character count and save button */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">
                        {thoughts.length}/{maxThoughtsLength}
                      </span>
                      <button
                        onClick={handleSaveThoughts}
                        disabled={!thoughts.trim() || isSavingThoughts || thoughts.length === 0}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                          ${thoughts.trim() && !isSavingThoughts
                            ? 'bg-mindful-green hover:bg-[#5a9f5f] text-white cursor-pointer'
                            : 'bg-[#0F1E0F] border border-gray-700 text-gray-500 cursor-not-allowed'
                          }
                        `}
                        aria-label="Save thoughts"
                      >
                        {isSavingThoughts ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

