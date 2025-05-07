import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { User, Course } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  StarHalf, 
  MapPin, 
  Mail, 
  Globe, 
  Calendar, 
  Award,
  BookOpen,
  Search,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import CourseCard from "@/components/course-card";
import { Skeleton } from "@/components/ui/skeleton";

const InstructorPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("courses");
  
  // Fetch all instructors if no ID provided
  const { data: instructors, isLoading: instructorsLoading } = useQuery<User[]>({
    queryKey: ['/api/instructors'],
    enabled: !id
  });
  
  // Fetch single instructor if ID provided
  const { data: instructor, isLoading: instructorLoading } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
    enabled: !!id
  });
  
  // Fetch instructor's courses if ID provided
  const { data: instructorCourses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: [`/api/courses/instructor/${id}`],
    enabled: !!id
  });
  
  // Filter instructors by search term
  const filteredInstructors = instructors?.filter(instructor => 
    instructor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (instructor.bio && instructor.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
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
  
  // Render instructor list
  if (!id) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold mb-4 font-heading">Meet Our Instructors</h1>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
              Learn from industry experts who bring real-world experience to their teaching.
              Our instructors are carefully selected for their expertise and teaching ability.
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for instructors..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Instructors Grid */}
          {instructorsLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          ) : filteredInstructors && filteredInstructors.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredInstructors.map((instructor) => (
                <Link href={`/instructors/${instructor.id}`} key={instructor.id}>
                  <a className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-400">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {instructor.profileImage ? (
                          <img 
                            src={instructor.profileImage} 
                            alt={instructor.fullName}
                            className="h-24 w-24 rounded-full border-4 border-white object-cover"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                            <span className="text-3xl font-bold text-gray-400">
                              {instructor.fullName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2">{instructor.fullName}</h2>
                      <p className="text-primary-600 text-sm mb-3">Instructor</p>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {instructor.bio || `Experienced instructor specializing in various subjects, helping students achieve their learning goals through comprehensive and engaging teaching methods.`}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <StarHalf className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-gray-600 text-sm">4.5</span>
                        </div>
                        <span className="text-gray-500 text-sm">10 courses</span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No instructors found</h3>
              <p className="text-gray-500 mb-6">We couldn't find any instructors matching your search criteria.</p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Render single instructor profile
  if (instructorLoading || coursesLoading) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-64 bg-gradient-to-r from-primary-600 to-primary-400">
              <Skeleton className="h-full" />
            </div>
            <div className="p-8">
              <Skeleton className="h-12 w-48 mb-4" />
              <Skeleton className="h-6 w-32 mb-8" />
              <Skeleton className="h-28 w-full mb-8" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-12 w-full mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!instructor) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Instructor Not Found</h1>
            <p className="text-gray-600 mb-6">The instructor you're looking for doesn't exist or has been removed.</p>
            <Link href="/instructors">
              <Button>
                View All Instructors
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-r from-primary-600 to-primary-400 relative">
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
              {instructor.profileImage ? (
                <img 
                  src={instructor.profileImage} 
                  alt={instructor.fullName}
                  className="h-36 w-36 rounded-full border-4 border-white object-cover bg-white"
                />
              ) : (
                <div className="h-36 w-36 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  <span className="text-5xl font-bold text-gray-400">
                    {instructor.fullName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="mt-20 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{instructor.fullName}</h1>
              <p className="text-primary-600 mb-4">
                <Badge variant="secondary" className="text-md font-medium">
                  {instructor.role === 'instructor' ? 'Instructor' : 'Admin'}
                </Badge>
              </p>
              <p className="text-gray-600 max-w-3xl mx-auto">
                {instructor.bio || `Experienced educator and industry expert dedicated to providing high-quality, engaging, and practical learning experiences. Committed to helping students achieve their goals through comprehensive courses and personalized guidance.`}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-primary-600 mb-1">
                  <BookOpen className="h-6 w-6 mx-auto" />
                </div>
                <div className="font-bold text-2xl mb-1">
                  {instructorCourses?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Courses</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-primary-600 mb-1">
                  <Users className="h-6 w-6 mx-auto" />
                </div>
                <div className="font-bold text-2xl mb-1">
                  {instructorCourses?.reduce((acc, course) => acc + course.totalStudents, 0) || 0}
                </div>
                <div className="text-sm text-gray-500">Students</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-primary-600 mb-1">
                  <Star className="h-6 w-6 mx-auto fill-current" />
                </div>
                <div className="font-bold text-2xl mb-1">
                  {instructorCourses && instructorCourses.length > 0
                    ? (instructorCourses.reduce((acc, course) => acc + course.rating, 0) / instructorCourses.length).toFixed(1)
                    : "0.0"}
                </div>
                <div className="text-sm text-gray-500">Avg. Rating</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-primary-600 mb-1">
                  <Award className="h-6 w-6 mx-auto" />
                </div>
                <div className="font-bold text-2xl mb-1">
                  {instructorCourses?.reduce((acc, course) => acc + course.totalReviews, 0) || 0}
                </div>
                <div className="text-sm text-gray-500">Reviews</div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <Tabs 
              defaultValue="courses"
              value={activeTab}
              onValueChange={setActiveTab} 
              className="max-w-5xl mx-auto"
            >
              <TabsList className="mb-8 grid w-full grid-cols-2">
                <TabsTrigger value="courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Courses
                </TabsTrigger>
                <TabsTrigger value="about">
                  <Users className="mr-2 h-4 w-4" />
                  About
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="courses">
                {instructorCourses && instructorCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instructorCourses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No courses yet</h3>
                    <p className="text-gray-500">This instructor hasn't published any courses yet.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="about">
                <div className="bg-gray-50 rounded-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">About the Instructor</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Biography</h3>
                      <p className="text-gray-600">
                        {instructor.bio || `An experienced educator with a passion for teaching and helping students achieve their goals. With extensive industry experience and a talent for explaining complex concepts in an easy-to-understand way, this instructor is dedicated to providing high-quality educational content.`}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-500 mr-3" />
                          <span>{instructor.email}</span>
                        </li>
                        <li className="flex items-center">
                          <Globe className="h-5 w-5 text-gray-500 mr-3" />
                          <span>instructor-website.com</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Teaching Experience</h3>
                      <ul className="space-y-4">
                        <li className="flex">
                          <div className="flex-shrink-0 mr-4">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">Senior Instructor</h4>
                            <p className="text-sm text-gray-500">2018 - Present</p>
                            <p className="mt-1 text-gray-600">
                              Creating and delivering comprehensive online courses to thousands of students worldwide.
                            </p>
                          </div>
                        </li>
                        <li className="flex">
                          <div className="flex-shrink-0 mr-4">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">University Professor</h4>
                            <p className="text-sm text-gray-500">2015 - 2018</p>
                            <p className="mt-1 text-gray-600">
                              Taught undergraduate and graduate level courses in computer science and web development.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorPage;
