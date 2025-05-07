import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Section, Lesson } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  LockKeyhole,
  FileText,
  Clock,
  XCircle
} from "lucide-react";

interface LessonSidebarProps {
  courseId: number;
  currentLessonId?: number;
  isMobile?: boolean;
  onClose?: () => void;
}

const LessonSidebar = ({ courseId, currentLessonId, isMobile = false, onClose }: LessonSidebarProps) => {
  const [location, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  // Fetch course sections and lessons progress
  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: [`/api/courses/${courseId}/sections`],
  });
  
  const { data: progress, isLoading: progressLoading } = useQuery<{ completed: boolean, lastWatchedPosition: number }[]>({
    queryKey: [`/api/lesson-progress`],
  });
  
  // Expand the section containing the current lesson
  useEffect(() => {
    if (sections && currentLessonId) {
      const currentSection = sections.find(section => {
        return section.lessons?.some(lesson => lesson.id === currentLessonId);
      });
      
      if (currentSection) {
        setExpandedSections(prev => 
          prev.includes(currentSection.id.toString()) 
            ? prev 
            : [...prev, currentSection.id.toString()]
        );
      }
    }
  }, [sections, currentLessonId]);
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };
  
  const isLessonCompleted = (lessonId: number) => {
    if (!progress) return false;
    const lessonProgress = progress.find(p => p.lessonId === lessonId);
    return lessonProgress?.completed || false;
  };
  
  // Calculate overall course progress
  const calculateProgress = () => {
    if (!sections || !progress) return 0;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    sections.forEach(section => {
      if (section.lessons) {
        totalLessons += section.lessons.length;
        section.lessons.forEach(lesson => {
          if (isLessonCompleted(lesson.id)) {
            completedLessons++;
          }
        });
      }
    });
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };
  
  // Find next and previous lessons for navigation
  const findAdjacentLessons = () => {
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
  
  const { prev, next } = findAdjacentLessons();
  
  if (sectionsLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (!sections || sections.length === 0) {
    return (
      <div className="p-4 text-center">
        <XCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="font-medium text-gray-700">No content available</h3>
        <p className="text-gray-500 text-sm">This course doesn't have any sections yet.</p>
      </div>
    );
  }
  
  const progressValue = calculateProgress();
  
  return (
    <div className="flex flex-col h-full border-r bg-white">
      {isMobile && (
        <div className="p-2 border-b">
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full flex justify-between">
            <span>Close</span>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg mb-2">Course Content</h2>
        <div className="flex items-center justify-between text-sm mb-1">
          <span>Your progress</span>
          <span className="font-medium">{progressValue}% complete</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="w-full"
        >
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id.toString()}
              className="border-b"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                <div className="text-left">
                  <span className="font-medium">{section.title}</span>
                  {section.lessons && (
                    <div className="text-xs text-gray-500 mt-1">
                      {section.lessons.length} lessons
                      {section.lessons.reduce((acc, lesson) => acc + lesson.duration, 0) > 0 && (
                        <span> • {formatDuration(section.lessons.reduce((acc, lesson) => acc + lesson.duration, 0))}</span>
                      )}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <ul className="divide-y">
                  {section.lessons?.map((lesson) => {
                    const isCurrentLesson = lesson.id === currentLessonId;
                    const isCompleted = isLessonCompleted(lesson.id);
                    
                    return (
                      <li key={lesson.id} className={`${isCurrentLesson ? 'bg-primary-50' : 'hover:bg-gray-50'} transition-colors`}>
                        <Link href={`/learn/${courseId}/${lesson.id}`}>
                          <a 
                            className="px-4 py-3 flex items-start gap-3" 
                            onClick={() => {
                              if (isMobile && onClose) onClose();
                            }}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : isCurrentLesson ? (
                                <PlayCircle className="h-5 w-5 text-primary" />
                              ) : lesson.isPreview ? (
                                <Circle className="h-5 w-5 text-gray-300" />
                              ) : (
                                <LockKeyhole className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between gap-2">
                                <span className={`${isCurrentLesson ? 'font-medium text-primary' : ''}`}>
                                  {lesson.title}
                                </span>
                                {lesson.duration > 0 && (
                                  <span className="text-gray-500 text-xs flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDuration(lesson.duration)}
                                  </span>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-xs text-gray-500 mt-1">{lesson.description}</p>
                              )}
                              {lesson.isPreview && (
                                <span className="text-xs text-primary bg-primary-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                  Preview
                                </span>
                              )}
                            </div>
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex justify-between">
          {prev ? (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => setLocation(`/learn/${courseId}/${prev.id}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="truncate max-w-[100px]">
                {prev.title}
              </span>
            </Button>
          ) : (
            <div />
          )}
          
          {next ? (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => setLocation(`/learn/${courseId}/${next.id}`)}
            >
              <span className="truncate max-w-[100px]">
                {next.title}
              </span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              className="flex items-center"
              onClick={() => setLocation(`/certificates`)}
            >
              Complete Course
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonSidebar;
