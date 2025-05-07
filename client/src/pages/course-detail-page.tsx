import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Course, Section, Lesson, Review } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Star,
  StarHalf,
  Clock,
  User,
  Play,
  CheckCircle,
  Award,
  BarChart,
  Book,
  Globe,
  FileBadge,
  PlayCircle,
  Lock,
  FileText,
  ChevronRight,
  X
} from "lucide-react";
import PaymentForm from "@/components/payment-form";
import VideoPlayer from "@/components/ui/video-player";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  
  // Fetch course details
  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: [`/api/courses/${slug}`],
  });
  
  // Fetch course sections
  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: [`/api/courses/${course?.id}/sections`],
    enabled: !!course?.id,
  });
  
  // Fetch course reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/courses/${course?.id}/reviews`],
    enabled: !!course?.id,
  });
  
  // Check if user is enrolled
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["/api/enrollments", course?.id],
    queryFn: async () => {
      if (!user || !course) return null;
      
      try {
        const res = await apiRequest("GET", `/api/enrollments/user/${user.id}/course/${course.id}`);
        return await res.json();
      } catch (error) {
        return null;
      }
    },
    enabled: !!user && !!course,
  });
  
  // Format rating display
  const formatRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />;
          } else if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className="h-5 w-5 text-yellow-500 fill-current" />;
          } else {
            return <Star key={i} className="h-5 w-5 text-gray-300" />;
          }
        })}
      </div>
    );
  };
  
  // Calculate percentages for ratings graph
  const calculateRatingPercentages = () => {
    if (!reviews || reviews.length === 0) return [0, 0, 0, 0, 0];
    
    const ratingCounts = [0, 0, 0, 0, 0]; // 5-star, 4-star, 3-star, 2-star, 1-star
    
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingCounts[5 - rating]++;
      }
    });
    
    return ratingCounts.map(count => (count / reviews.length) * 100);
  };
  
  const ratingPercentages = calculateRatingPercentages();
  
  // Handle preview lesson
  const handlePreview = (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setPreviewModalOpen(true);
  };
  
  // Handle enrollment
  const handleEnroll = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to enroll in this course",
        variant: "destructive",
      });
      
      // Redirect to login page with return URL
      window.location.href = `/auth?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    setPaymentModalOpen(true);
  };
  
  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };
  
  // Format duration hours
  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    } else {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} min`;
    }
  };
  
  // Calculate total lessons and total content duration
  const calculateTotals = () => {
    if (!sections) return { totalLessons: 0, totalDuration: 0 };
    
    let totalLessons = 0;
    let totalDuration = 0;
    
    sections.forEach(section => {
      if (section.lessons) {
        totalLessons += section.lessons.length;
        section.lessons.forEach(lesson => {
          totalDuration += lesson.duration;
        });
      }
    });
    
    return { totalLessons, totalDuration };
  };
  
  const { totalLessons, totalDuration } = calculateTotals();
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
              <div className="mb-8">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link href="/courses">
            <Button>
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50">
      {/* Course Header */}
      <div className="bg-primary-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <nav className="flex mb-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link href="/">
                      <a className="text-primary-200 hover:text-white text-sm">Home</a>
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="text-primary-400 h-4 w-4 mx-1" />
                    <Link href="/courses">
                      <a className="text-primary-200 hover:text-white text-sm">Courses</a>
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="text-primary-400 h-4 w-4 mx-1" />
                    <Link href={`/courses/category/${course.category}`}>
                      <a className="text-primary-200 hover:text-white text-sm capitalize">{course.category.replace('-', ' ')}</a>
                    </Link>
                  </li>
                </ol>
              </nav>
              
              <h1 className="text-3xl font-bold text-white font-heading">{course.title}</h1>
              <p className="mt-2 text-xl text-primary-200">{course.shortDescription}</p>
              
              <div className="mt-4 flex flex-wrap items-center text-sm text-primary-200 gap-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-500 mr-1">
                    {formatRating(course.rating)}
                  </div>
                  <span className="ml-2">{course.rating.toFixed(1)} ({course.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{course.totalStudents} students enrolled</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatDuration(course.durationHours)}</span>
                </div>
                <div className="flex items-center">
                  <BarChart className="h-4 w-4 mr-1" />
                  <span className="capitalize">{course.level.replace('-', ' ')}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-300" />
                <span className="text-white">Created by <Link href={`/instructors/${course.instructorId}`}><a className="text-primary-200 hover:text-white font-medium">Instructor #{course.instructorId}</a></Link></span>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary-700 text-primary-200 border-primary-600 hover:bg-primary-600">
                  <Globe className="h-3 w-3 mr-1" />
                  {course.language}
                </Badge>
                <Badge variant="outline" className="bg-primary-700 text-primary-200 border-primary-600 hover:bg-primary-600">
                  <Book className="h-3 w-3 mr-1" />
                  {course.category}
                </Badge>
                <Badge variant="outline" className="bg-primary-700 text-primary-200 border-primary-600 hover:bg-primary-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Last updated {new Date(course.updatedAt).toLocaleDateString()}
                </Badge>
                {course.isFeatured && (
                  <Badge variant="outline" className="bg-yellow-600 text-yellow-100 border-yellow-700 hover:bg-yellow-700">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full lg:w-80">
                <div className="relative">
                  <img 
                    src={course.thumbnailImage} 
                    alt={course.title} 
                    className="w-full object-cover h-48"
                  />
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity hover:bg-opacity-50"
                    onClick={() => {
                      // Find first preview lesson
                      if (sections && sections.length > 0) {
                        for (const section of sections) {
                          if (section.lessons) {
                            const preview = section.lessons.find(lesson => lesson.isPreview);
                            if (preview) {
                              handlePreview(preview);
                              return;
                            }
                          }
                        }
                      }
                      // If no preview found
                      toast({
                        title: "No preview available",
                        description: "This course doesn't have a preview lesson",
                        variant: "destructive",
                      });
                    }}
                  >
                    <div className="w-16 h-16 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-white fill-current" />
                    </div>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {course.discountPrice !== null ? (
                      <>
                        <span className="text-3xl font-bold text-gray-900">${course.discountPrice.toFixed(2)}</span>
                        <span className="text-gray-500 line-through">${course.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">${course.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {enrollment ? (
                      <Button className="w-full" asChild>
                        <Link href={`/learn/${course.id}`}>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Continue Learning
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={handleEnroll}
                      >
                        Enroll Now
                      </Button>
                    )}
                    <Button variant="outline" className="w-full">
                      Add to Wishlist
                    </Button>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">This course includes:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <span>{formatDuration(course.durationHours)} on-demand video</span>
                      </li>
                      <li className="flex items-start">
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <span>{totalLessons} lessons</span>
                      </li>
                      <li className="flex items-start">
                        <FileBadge className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-start">
                        <Globe className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <span>Full lifetime access</span>
                      </li>
                      <li className="flex items-start">
                        <Book className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                        <span>Access on mobile and TV</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <p className="text-center text-gray-500 text-sm">30-Day Money-Back Guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="p-0 bg-transparent border-b w-full rounded-none justify-start h-auto">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculum"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger
                    value="instructor"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    Instructor
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">About This Course</h2>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
                  
                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 font-heading">What You'll Learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.tags && course.tags.map((tag, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Curriculum Tab */}
                <TabsContent value="curriculum" className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 font-heading">Course Content</h2>
                    <div className="text-gray-500 text-sm">
                      <span>{sections?.length || 0} sections • {totalLessons} lectures • {formatDuration(course.durationHours)} total length</span>
                    </div>
                  </div>
                  
                  {sectionsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : sections && sections.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {sections.map((section) => (
                        <AccordionItem key={section.id} value={section.id.toString()} className="border-b">
                          <AccordionTrigger className="py-4 hover:bg-gray-50">
                            <div className="text-left">
                              <span className="font-medium">{section.title}</span>
                              {section.lessons && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {section.lessons.length} lessons
                                  {section.lessons.reduce((acc, lesson) => acc + lesson.duration, 0) > 0 && (
                                    <span> • {formatTime(section.lessons.reduce((acc, lesson) => acc + lesson.duration, 0))}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-0">
                            <ul className="divide-y">
                              {section.lessons?.map((lesson) => (
                                <li key={lesson.id} className="hover:bg-gray-50 transition-colors">
                                  <div className="px-4 py-3 flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                      {lesson.isPreview ? (
                                        <button
                                          onClick={() => handlePreview(lesson)}
                                          className="flex items-center text-primary hover:text-primary-700"
                                        >
                                          <PlayCircle className="h-5 w-5" />
                                        </button>
                                      ) : (
                                        <Lock className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between gap-2">
                                        <span className="font-medium">
                                          {lesson.title}
                                        </span>
                                        {lesson.duration > 0 && (
                                          <span className="text-gray-500 text-xs flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatTime(lesson.duration)}
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
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Book className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No content available yet</h3>
                      <p className="text-gray-500">The curriculum for this course is being prepared.</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Instructor Tab */}
                <TabsContent value="instructor" className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading">Meet Your Instructor</h2>
                  
                  {/* Placeholder for instructor details - in a real app this would fetch instructor details */}
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 font-heading">Instructor #{course.instructorId}</h3>
                      <p className="text-gray-500">Web Development Instructor & Full-Stack Engineer</p>
                      
                      <div className="mt-3 flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-gray-700">4.8 Instructor Rating</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-gray-700">42,789 Reviews</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-gray-700">128,546 Students</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-gray-700">
                        <p className="mb-4">An experienced instructor who has been teaching web development for many years and has helped thousands of students become professional developers.</p>
                        <p className="mb-4">As a full-stack developer with expertise in both frontend and backend technologies, this instructor brings real-world experience to their teaching. They're known for breaking down complex concepts into easy-to-understand lessons and providing practical, project-based learning experiences.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Reviews Tab */}
                <TabsContent value="reviews" className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0 font-heading">Student Reviews</h2>
                    <div className="flex items-center">
                      <div className="flex text-yellow-500 mr-2">
                        {formatRating(course.rating)}
                      </div>
                      <span className="text-gray-900 font-medium">{course.rating.toFixed(1)} out of 5</span>
                      <span className="text-gray-500 ml-2">({course.totalReviews} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    {[5, 4, 3, 2, 1].map((star, index) => (
                      <div key={star} className="flex items-center mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-3 mr-3">
                          <div 
                            className="bg-yellow-500 h-3 rounded-full" 
                            style={{ width: `${ratingPercentages[index]}%` }}
                          ></div>
                        </div>
                        <div className="w-16 flex items-center">
                          <div className="flex text-yellow-500 text-sm mr-1">
                            {[...Array(star)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-gray-500 text-xs">{Math.round(ratingPercentages[index])}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {reviewsLoading ? (
                    <div className="space-y-6">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center mb-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">User #{review.userId}</div>
                              <div className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex text-yellow-500 mb-2">
                            {formatRating(review.rating)}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Star className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No reviews yet</h3>
                      <p className="text-gray-500">Be the first to review this course after enrollment.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Related Courses Sidebar */}
          <div className="mt-10 lg:mt-0">
            <h3 className="text-xl font-bold text-gray-900 mb-6 font-heading">Related Courses</h3>
            <div className="space-y-6">
              {/* Placeholder for related courses - would be fetched based on category or instructor */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  <img className="h-36 w-full object-cover" src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&w=400&q=80" alt="JavaScript Course" />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900">Advanced JavaScript: The Complete Guide</h4>
                  <p className="text-sm text-gray-500 mt-1">Dr. Mohammed Sami</p>
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-500 text-sm">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <span className="ml-1 text-xs text-gray-500">(1,245)</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-gray-900">$69.99</span>
                    <Link href="#">
                      <a className="text-sm font-medium text-primary hover:text-primary-700">Details</a>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  <img className="h-36 w-full object-cover" src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&w=400&q=80" alt="React Course" />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900">React & Redux: From Beginner to Expert</h4>
                  <p className="text-sm text-gray-500 mt-1">Fatima Al-Hassan</p>
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-500 text-sm">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <StarHalf className="h-4 w-4 fill-current" />
                    </div>
                    <span className="ml-1 text-xs text-gray-500">(987)</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-gray-900">$79.99</span>
                    <Link href="#">
                      <a className="text-sm font-medium text-primary hover:text-primary-700">Details</a>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  <img className="h-36 w-full object-cover" src="https://images.unsplash.com/photo-1591267990532-e5bdb1b0ceb8?ixlib=rb-4.0.3&w=400&q=80" alt="Node.js Course" />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900">Node.js: Building RESTful APIs</h4>
                  <p className="text-sm text-gray-500 mt-1">Omar Al-Khatib</p>
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-500 text-sm">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                    <span className="ml-1 text-xs text-gray-500">(756)</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-gray-900">$74.99</span>
                    <Link href="#">
                      <a className="text-sm font-medium text-primary hover:text-primary-700">Details</a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewLesson?.title || "Course Preview"}</DialogTitle>
            <DialogDescription>
              {previewLesson?.description || "Get a preview of the course content"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            {previewLesson?.videoUrl ? (
              <VideoPlayer
                src={previewLesson.videoUrl}
                title={previewLesson.title}
                poster={course.thumbnailImage}
                className="rounded-md overflow-hidden"
              />
            ) : (
              <div className="aspect-video bg-gray-900 rounded-md flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              This is a preview of the course. Enroll to access all {totalLessons} lessons.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Enter your payment details to get access to "{course.title}"
            </DialogDescription>
          </DialogHeader>
          <PaymentForm 
            course={course} 
            onSuccess={() => {
              setPaymentModalOpen(false);
              window.location.href = `/learn/${course.id}`;
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;
