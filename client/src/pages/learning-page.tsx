import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Course, Section, Lesson } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import VideoPlayer from "@/components/ui/video-player";
import LessonSidebar from "@/components/lesson-sidebar";
import { 
  Menu, 
  BookOpen, 
  CheckCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LearningPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId?: string }>();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("video");
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  
  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
  });
  
  // Fetch course sections and lessons
  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: [`/api/courses/${courseId}/sections`],
    enabled: !!courseId,
  });
  
  // Determine current lesson ID
  const [currentLessonId, setCurrentLessonId] = useState<number | undefined>(
    lessonId ? parseInt(lessonId) : undefined
  );
  
  // Update current lesson ID when URL changes
  useEffect(() => {
    if (lessonId) {
      setCurrentLessonId(parseInt(lessonId));
    } else if (sections && sections.length > 0 && sections[0].lessons && sections[0].lessons.length > 0) {
      // Navigate to first lesson if no lesson ID provided
      const firstLessonId = sections[0].lessons[0].id;
      navigate(`/learn/${courseId}/${firstLessonId}`, { replace: true });
    }
  }, [lessonId, sections, navigate, courseId]);
  
  // Fetch current lesson
  const { data: currentLesson, isLoading: lessonLoading } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${currentLessonId}`],
    enabled: !!currentLessonId,
  });
  
  // Fetch lesson progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: [`/api/lesson-progress/${currentLessonId}`],
    enabled: !!currentLessonId && !!user,
  });
  
  // Update lesson progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, completed, lastWatchedPosition }: { 
      lessonId: number, 
      completed: boolean, 
      lastWatchedPosition: number 
    }) => {
      const res = await apiRequest("POST", "/api/lesson-progress", {
        lessonId,
        completed,
        lastWatchedPosition
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lesson-progress/${currentLessonId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
    onError: (error) => {
      console.error("Failed to update progress:", error);
    }
  });
  
  // Handle video time update - track progress
  const handleTimeUpdate = (currentTime: number) => {
    if (!currentLessonId || !currentLesson) return;
    
    // Update progress every 10 seconds while watching
    if (currentTime % 10 < 1) {
      updateProgressMutation.mutate({
        lessonId: currentLessonId,
        completed: currentTime >= currentLesson.duration * 0.9, // Mark as completed if watched 90% of video
        lastWatchedPosition: Math.floor(currentTime)
      });
    }
  };
  
  // Handle video end
  const handleVideoEnd = () => {
    if (!currentLessonId) return;
    
    // Mark as completed
    updateProgressMutation.mutate({
      lessonId: currentLessonId,
      completed: true,
      lastWatchedPosition: currentLesson?.duration || 0
    });
    
    toast({
      title: "Lesson completed!",
      description: "Great job! Moving to the next lesson...",
    });
    
    // Find next lesson and navigate to it
    if (sections) {
      let foundCurrent = false;
      let nextLesson: Lesson | null = null;
      
      for (const section of sections) {
        if (!section.lessons) continue;
        
        for (const lesson of section.lessons) {
          if (foundCurrent) {
            nextLesson = lesson;
            break;
          }
          if (lesson.id === currentLessonId) {
            foundCurrent = true;
          }
        }
        
        if (nextLesson) break;
      }
      
      if (nextLesson) {
        setTimeout(() => {
          navigate(`/learn/${courseId}/${nextLesson.id}`);
        }, 1500);
      }
    }
  };
  
  // Find next and previous lessons
  const getAdjacentLessons = () => {
    if (!sections || !currentLessonId) return { prev: null, next: null };
    
    let allLessons: Lesson[] = [];
    sections.forEach(section => {
      if (section.lessons) {
        allLessons = [...allLessons, ...section.lessons];
      }
    });
    
    allLessons.sort((a, b) => {
      const sectionA = sections.find(s => s.id === a.sectionId);
      const sectionB = sections.find(s => s.id === b.sectionId);
      
      if (!sectionA || !sectionB) return 0;
      
      if (sectionA.orderIndex !== sectionB.orderIndex) {
        return sectionA.orderIndex - sectionB.orderIndex;
      }
      
      return a.orderIndex - b.orderIndex;
    });
    
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);
    
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    };
  };
  
  const { prev, next } = getAdjacentLessons();
  
  // Calculate course progress
  const calculateProgress = () => {
    if (!sections) return 0;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    sections.forEach(section => {
      if (section.lessons) {
        totalLessons += section.lessons.length;
      }
    });
    
    if (totalLessons === 0) return 0;
    
    // Mocked progress calculation - in a real app this would be based on user's progress data
    return Math.round((completedLessons / totalLessons) * 100);
  };
  
  // Mark lesson as complete
  const markAsComplete = () => {
    if (!currentLessonId) return;
    
    updateProgressMutation.mutate({
      lessonId: currentLessonId,
      completed: true,
      lastWatchedPosition: currentLesson?.duration || 0
    });
    
    toast({
      title: "Lesson marked as complete",
      description: "Your progress has been updated",
    });
  };
  
  // If user is not authenticated, redirect to login
  useEffect(() => {
    if (!user && !courseLoading) {
      toast({
        title: "Authentication required",
        description: "Please login to access course content",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, courseLoading, navigate, toast]);
  
  if (courseLoading || sectionsLoading || !course) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex-1 flex">
          <div className="hidden md:block w-64 border-r">
            <Skeleton className="h-full" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-[500px] w-full mb-6" />
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top navigation bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)} 
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href={`/courses/${course.slug}`}>
            <a className="text-primary hover:text-primary-700 mr-4">
              <ChevronLeft className="h-5 w-5 inline-block" />
              <span className="ml-1">Back to Course</span>
            </a>
          </Link>
          <h1 className="text-lg font-medium truncate hidden sm:block">{course.title}</h1>
        </div>
        <div className="flex items-center">
          <div className="mr-4 hidden sm:block">
            <Progress value={calculateProgress()} className="w-32 h-2" />
            <span className="text-xs text-gray-500">{calculateProgress()}% complete</span>
          </div>
          <Button variant="outline" size="sm" onClick={markAsComplete}>
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Mark Complete</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Course Sidebar - Desktop */}
        <div className="hidden md:block w-80 border-r flex-shrink-0 overflow-y-auto">
          <LessonSidebar courseId={parseInt(courseId)} currentLessonId={currentLessonId} />
        </div>
        
        {/* Course Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="absolute top-0 bottom-0 left-0 w-80 bg-white" onClick={e => e.stopPropagation()}>
              <LessonSidebar courseId={parseInt(courseId)} currentLessonId={currentLessonId} isMobile onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto p-4 md:p-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Video player */}
                <div ref={videoPlayerRef}>
                  <VideoPlayer
                    src={currentLesson.videoUrl || ""}
                    poster={course.thumbnailImage}
                    title={currentLesson.title}
                    autoPlay
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnd}
                    initialTime={progress?.lastWatchedPosition || 0}
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                      {progress?.completed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {prev && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center"
                          onClick={() => navigate(`/learn/${courseId}/${prev.id}`)}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          <span className="truncate max-w-[100px]">
                            Previous
                          </span>
                        </Button>
                      )}
                      
                      {next && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center"
                          onClick={() => navigate(`/learn/${courseId}/${next.id}`)}
                        >
                          <span className="truncate max-w-[100px]">
                            Next
                          </span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="video">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Lesson Content
                      </TabsTrigger>
                      <TabsTrigger value="transcript">
                        <FileText className="h-4 w-4 mr-2" />
                        Transcript
                      </TabsTrigger>
                      <TabsTrigger value="discussion">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Discussion
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="video" className="mt-6">
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>No additional content for this lesson.</p>' }} />
                    </TabsContent>
                    
                    <TabsContent value="transcript" className="mt-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-medium text-lg mb-4">Lesson Transcript</h3>
                        <p className="text-gray-500">
                          Transcripts are auto-generated and may contain errors. They are provided for reference and accessibility purposes.
                        </p>
                        
                        <div className="mt-4 space-y-4">
                          {/* Simulated transcript - would be fetched from API in a real app */}
                          <div className="flex">
                            <span className="text-gray-500 w-16 flex-shrink-0">00:00</span>
                            <p>Welcome to this lesson on web development fundamentals.</p>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 w-16 flex-shrink-0">00:15</span>
                            <p>Today we'll be covering the basic structure of HTML documents.</p>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 w-16 flex-shrink-0">00:32</span>
                            <p>Let's start by understanding what HTML stands for - Hypertext Markup Language.</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="discussion" className="mt-6">
                      <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Discussion coming soon</h3>
                        <p className="text-gray-500">The discussion feature will be available in a future update.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
                <p className="text-gray-600 mb-6">The lesson you're looking for doesn't exist or has been removed.</p>
                <Link href={`/courses/${course.slug}`}>
                  <Button>
                    Return to Course
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
