import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Course } from "@shared/schema";
import { Laptop, BarChart3, Paintbrush, Globe, Camera, Heart } from "lucide-react";
import CourseFilter, { CourseFilters } from "@/components/course-filter";
import CourseList from "@/components/course-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CoursesPage = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [filters, setFilters] = useState<CourseFilters>({
    categories: [],
    levels: [],
    price: [],
    rating: [],
  });
  
  // Extract category from URL if provided
  const categoryFromUrl = location.includes("/category/") 
    ? location.split("/category/")[1] 
    : null;
  
  // Extract search query from URL if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
      setSearchInputValue(q);
    }
  }, []);
  
  // Set category filter if provided in URL
  useEffect(() => {
    if (categoryFromUrl && !filters.categories.includes(categoryFromUrl)) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryFromUrl]
      }));
    }
  }, [categoryFromUrl]);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInputValue);
  };
  
  const handleFilterChange = (newFilters: CourseFilters) => {
    setFilters(newFilters);
  };
  
  const { data: categories } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });
  
  // Map of category slugs to icons
  const categoryIcons: Record<string, React.ReactNode> = {
    programming: <Laptop className="text-lg" />,
    business: <BarChart3 className="text-lg" />,
    design: <Paintbrush className="text-lg" />,
    languages: <Globe className="text-lg" />,
    photography: <Camera className="text-lg" />,
    health: <Heart className="text-lg" />,
  };
  
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-primary-700 rounded-xl p-8 mb-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-4 font-heading">
              {categoryFromUrl 
                ? `${categoryFromUrl.charAt(0).toUpperCase() + categoryFromUrl.slice(1).replace('-', ' ')} Courses` 
                : searchQuery 
                  ? `Search Results for "${searchQuery}"` 
                  : "Explore Our Courses"}
            </h1>
            <p className="text-lg text-primary-100 mb-6">
              {categoryFromUrl 
                ? `Discover the perfect ${categoryFromUrl.replace('-', ' ')} course to enhance your skills and knowledge`
                : "Find the right course to help you achieve your personal and professional goals"}
            </p>
            
            <form onSubmit={handleSearchSubmit} className="flex w-full max-w-xl">
              <Input
                type="search"
                placeholder="Search for courses..."
                className="rounded-r-none"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
              />
              <Button type="submit" className="rounded-l-none">
                Search
              </Button>
            </form>
          </div>
        </div>
        
        {/* Categories Quick Select (shown only when no category is selected) */}
        {!categoryFromUrl && categories && categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Popular Categories</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <a 
                  key={category} 
                  href={`/courses/category/${category}`}
                  className={`flex items-center px-4 py-2 rounded-full border text-sm font-medium ${
                    filters.categories.includes(category)
                      ? "bg-primary-100 border-primary-300 text-primary-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2">
                    {categoryIcons[category] || <span className="w-4 h-4 inline-block"></span>}
                  </span>
                  <span className="capitalize">{category.replace('-', ' ')}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block">
            <CourseFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>
          
          {/* Filters - Mobile */}
          <div className="lg:hidden col-span-full">
            <CourseFilter filters={filters} onFilterChange={handleFilterChange} isMobile />
          </div>
          
          {/* Courses */}
          <div className="lg:col-span-3">
            <CourseList
              filters={filters}
              searchQuery={searchQuery}
              categorySlug={categoryFromUrl || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
