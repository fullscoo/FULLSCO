import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Course, Enrollment } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, Book, Clock, Award, CheckCircle } from "lucide-react";
import { useState } from "react";

interface CourseProgressProps {
  enrollment: Enrollment & { course?: Course };
  displayMode?: "card" | "list";
}

const CourseProgress = ({ enrollment, displayMode = "card" }: CourseProgressProps) => {
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${enrollment.courseId}`],
    enabled: !enrollment.course,
  });
  
  // If the course was already passed in with the enrollment, use that
  const courseData = enrollment.course || course;
  
  const formatTime = (totalHours: number) => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min`;
    }
  };
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (isLoading || !courseData) {
    return displayMode === "card" ? (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-6">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <Skeleton className="h-4 w-full mb-6" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <Skeleton className="h-16 w-24 rounded" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <Skeleton className="h-2 w-full" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }
  
  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const calculateCompletionPercentage = () => {
    if (enrollment.completedAt) return 100;
    return Math.round(enrollment.progress);
  };
  
  const completionPercentage = calculateCompletionPercentage();
  
  if (displayMode === "card") {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
        <div className="relative">
          <img
            className="h-48 w-full object-cover"
            src={courseData.thumbnailImage}
            alt={courseData.title}
          />
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(enrollment.status)}`}>
            {enrollment.status === 'completed' ? 'Completed' : enrollment.status === 'active' ? 'In Progress' : 'Cancelled'}
          </div>
        </div>
        
        <div className="p-6 flex-grow flex flex-col">
          <Link href={`/courses/${courseData.slug}`}>
            <a className="text-xl font-semibold text-gray-900 hover:text-primary transition mb-2">
              {courseData.title}
            </a>
          </Link>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatTime(courseData.durationHours)}</span>
            <span className="mx-2">•</span>
            <Book className="h-4 w-4 mr-1" />
            <span>{courseData.level}</span>
          </div>
          
          <div className="mb-4 flex-grow">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
          
          <div className="flex">
            {enrollment.status === 'completed' ? (
              <Button className="w-full flex items-center justify-center gap-2" asChild>
                <Link href="/certificates">
                  <Award className="h-4 w-4" />
                  View Certificate
                </Link>
              </Button>
            ) : (
              <Button className="w-full flex items-center justify-center gap-2" asChild>
                <Link href={`/learn/${courseData.id}`}>
                  <PlayCircle className="h-4 w-4" />
                  {completionPercentage > 0 ? 'Continue Learning' : 'Start Learning'}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    // List display mode
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <img
          className="h-20 w-32 object-cover rounded"
          src={courseData.thumbnailImage}
          alt={courseData.title}
        />
        
        <div className="flex-1">
          <Link href={`/courses/${courseData.slug}`}>
            <a className="font-semibold text-gray-900 hover:text-primary transition">
              {courseData.title}
            </a>
          </Link>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{formatTime(courseData.durationHours)}</span>
            </div>
            <div className="flex items-center">
              <Book className="h-3.5 w-3.5 mr-1" />
              <span>{courseData.level}</span>
            </div>
            {enrollment.enrolledAt && (
              <div className="flex items-center">
                <i className="fas fa-calendar-alt mr-1"></i>
                <span>Enrolled: {formatDate(enrollment.enrolledAt)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-2 mb-1 flex-grow">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-1.5" />
          </div>
        </div>
        
        <div className="w-full sm:w-auto mt-3 sm:mt-0">
          {enrollment.status === 'completed' ? (
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </span>
              <Button size="sm" variant="outline" asChild>
                <Link href="/certificates">
                  View Certificate
                </Link>
              </Button>
            </div>
          ) : (
            <Button size="sm" asChild>
              <Link href={`/learn/${courseData.id}`}>
                {completionPercentage > 0 ? 'Continue' : 'Start'}
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }
};

export default CourseProgress;
