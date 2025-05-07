import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Course, User } from "@shared/schema";
import HeroSection from "@/components/hero-section";
import FeaturedCourses from "@/components/featured-courses";
import TestimonialsSection from "@/components/testimonials";
import CourseCard from "@/components/course-card";
import InstructorCard from "@/components/instructor-card";
import { Button } from "@/components/ui/button";
import {
  Laptop,
  BarChart3,
  Paintbrush,
  Globe,
  Camera,
  Heart,
  CheckCircle,
  BookOpen,
  User as UserIcon,
  Clock
} from "lucide-react";

const HomePage = () => {
  // Fetch featured courses
  const { data: featuredCourses } = useQuery<Course[]>({
    queryKey: ['/api/courses/featured'],
  });
  
  // Fetch instructors
  const { data: instructors } = useQuery<User[]>({
    queryKey: ['/api/instructors'],
  });
  
  // Prepare category data with icons and counts
  const categories = [
    { 
      name: "Programming & Development", 
      icon: <Laptop className="text-2xl" />, 
      count: 75, 
      slug: "programming" 
    },
    { 
      name: "Business & Marketing", 
      icon: <BarChart3 className="text-2xl" />, 
      count: 120, 
      slug: "business" 
    },
    { 
      name: "Design", 
      icon: <Paintbrush className="text-2xl" />, 
      count: 85, 
      slug: "design" 
    },
    { 
      name: "Languages", 
      icon: <Globe className="text-2xl" />, 
      count: 60, 
      slug: "languages" 
    },
    { 
      name: "Photography & Video", 
      icon: <Camera className="text-2xl" />, 
      count: 45, 
      slug: "photography" 
    },
    { 
      name: "Health & Fitness", 
      icon: <Heart className="text-2xl" />, 
      count: 30, 
      slug: "health" 
    },
  ];
  
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Statistics Bar */}
      <div className="bg-primary-800 bg-opacity-90 backdrop-blur-lg py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-1 text-white">+1000</div>
              <div className="text-sm text-gray-200">Available Courses</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1 text-white">+250</div>
              <div className="text-sm text-gray-200">Professional Instructors</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1 text-white">+50,000</div>
              <div className="text-sm text-gray-200">Enrolled Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1 text-white">+5000</div>
              <div className="text-sm text-gray-200">Certificates Awarded</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-heading">Explore Learning Areas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from a variety of categories and discover courses that match your interests and career goals.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={`/courses/category/${category.slug}`}>
                <a className="flex flex-col items-center p-6 rounded-lg bg-gray-50 hover:bg-primary-50 transition duration-300 group">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary group-hover:bg-primary-200 transition">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-center">{category.name}</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">{category.count} courses</p>
                </a>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/courses">
              <Button variant="outline">
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Courses Section */}
      <FeaturedCourses />
      
      {/* Learning Experience Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-heading">Comprehensive Learning Experience</h2>
            <p className="text-gray-600">
              We provide a complete learning experience with multiple features to ensure the best results and help you achieve your goals efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-xl mb-3">High Quality Video Lessons</h3>
              <p className="text-gray-600">
                High definition recorded lessons that can be watched anytime, anywhere, on all devices.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Laptop className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-xl mb-3">Practical Projects & Exercises</h3>
              <p className="text-gray-600">
                Learn through practical application with real-world projects and exercises under expert guidance.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-xl mb-3">Accredited Certificates</h3>
              <p className="text-gray-600">
                Receive accredited certificates upon course completion to enhance your resume and career prospects.
              </p>
            </div>
          </div>
          
          <div className="mt-16 bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4 font-heading">Access Knowledge Anytime, Anywhere</h3>
                <p className="text-gray-600 mb-6">
                  Our platform is available on all devices so you can learn at home, at work, or on the go. Watch lectures, complete projects, and participate in discussions with the learning community.
                </p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                    <span>24/7 accessible lessons</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                    <span>Mobile apps for smartphones and tablets</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                    <span>Offline content viewing capability</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                    <span>Progress synchronization across devices</span>
                  </li>
                </ul>
                
                <Link href="/courses">
                  <Button>
                    Try the Platform for Free
                  </Button>
                </Link>
              </div>
              
              <div className="relative lg:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1610500796385-3ffc1ae2fead?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80"
                  alt="Comprehensive learning platform on various devices"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-full p-4">
                    <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Instructors Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-heading">Our Top Instructors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our educational content is delivered by a team of experts and specialists with both academic and practical experience in various fields.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors && instructors.slice(0, 4).map((instructor) => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                courseCount={5}
                rating={4.8}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/instructors">
              <Button variant="outline">
                View All Instructors
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Certificate Showcase */}
      <section className="py-16 bg-gradient-to-r from-primary-800 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-heading">Earn Accredited Certificates</h2>
              <p className="text-lg mb-8 text-gray-100">
                Enhance your resume and career opportunities by obtaining accredited certificates after completing courses on our platform. Our certificates are recognized by many companies and institutions.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="text-green-400 h-6 w-6 mr-3" />
                  <span>Certificates with unique serial numbers</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-400 h-6 w-6 mr-3" />
                  <span>Electronically verifiable via QR code</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-400 h-6 w-6 mr-3" />
                  <span>Professional design for printing and sharing on LinkedIn</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-green-400 h-6 w-6 mr-3" />
                  <span>Endorsed by industry experts and educational institutions</span>
                </li>
              </ul>
              
              <Link href="/courses">
                <Button variant="secondary">
                  Explore Certified Courses
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80"
                alt="Professional certificate template from our platform"
                className="rounded-xl shadow-2xl w-full"
              />
              <div className="absolute -top-6 -right-6 bg-yellow-400 text-primary-800 rounded-full w-24 h-24 flex items-center justify-center text-center font-bold p-2 shadow-lg transform rotate-12">
                100% Verified
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-3xl p-10 md:p-16 shadow-xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">Start Your Learning Journey Today</h2>
              <p className="text-gray-600 text-lg mb-8">
                Join thousands of students who are developing their skills and achieving their goals through our comprehensive learning platform.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth">
                  <Button size="lg">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" size="lg">
                    Browse Courses
                  </Button>
                </Link>
              </div>
              
              <p className="text-gray-500 mt-6">Over 50,000 students have already joined</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
