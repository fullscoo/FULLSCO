import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import CourseCard from "./course-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { CourseFilters } from "./course-filter";
import { Loader2 } from "lucide-react";

interface CourseListProps {
  filters: CourseFilters;
  searchQuery?: string;
  categorySlug?: string;
}

const CourseList = ({ filters, searchQuery, categorySlug }: CourseListProps) => {
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;
  
  // Generate the query key based on filters, search query, etc.
  const getQueryKey = () => {
    if (searchQuery) {
      return [`/api/courses/search?q=${searchQuery}`];
    } else if (categorySlug) {
      return [`/api/courses/category/${categorySlug}`];
    } else {
      return ['/api/courses'];
    }
  };

  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: getQueryKey(),
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Failed to load courses. Please try again later.</span>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-12 rounded text-center">
        <h3 className="text-xl font-semibold mb-2">No courses found</h3>
        <p>Try adjusting your filters or search term to find courses.</p>
      </div>
    );
  }
  
  // Apply filters
  let filteredCourses = [...courses];
  
  if (filters.categories.length > 0) {
    filteredCourses = filteredCourses.filter(course => 
      filters.categories.includes(course.category)
    );
  }
  
  if (filters.levels.length > 0) {
    filteredCourses = filteredCourses.filter(course => 
      filters.levels.includes(course.level)
    );
  }
  
  if (filters.price.length > 0) {
    filteredCourses = filteredCourses.filter(course => {
      if (filters.price.includes('free') && course.price === 0) return true;
      if (filters.price.includes('paid') && course.price > 0) return true;
      return false;
    });
  }
  
  if (filters.rating.length > 0) {
    const minRating = Math.min(...filters.rating.map(r => parseFloat(r)));
    filteredCourses = filteredCourses.filter(course => 
      course.rating >= minRating
    );
  }
  
  // Apply sorting
  switch (sortBy) {
    case "popularity":
      filteredCourses.sort((a, b) => b.totalStudents - a.totalStudents);
      break;
    case "rating":
      filteredCourses.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      filteredCourses.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "price-low":
      filteredCourses.sort((a, b) => {
        const aPrice = a.discountPrice !== null ? a.discountPrice : a.price;
        const bPrice = b.discountPrice !== null ? b.discountPrice : b.price;
        return aPrice - bPrice;
      });
      break;
    case "price-high":
      filteredCourses.sort((a, b) => {
        const aPrice = a.discountPrice !== null ? a.discountPrice : a.price;
        const bPrice = b.discountPrice !== null ? b.discountPrice : b.price;
        return bPrice - aPrice;
      });
      break;
  }
  
  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const paginatedCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <p className="text-gray-500 mb-3 sm:mb-0">
          <span className="font-medium text-gray-900">{filteredCourses.length}</span> courses found
        </p>
        <div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              
              // Show first, last, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNumber);
                      }}
                      isActive={pageNumber === currentPage}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Add ellipsis after first page and before last page
              if (pageNumber === 2 || pageNumber === totalPages - 1) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default CourseList;
