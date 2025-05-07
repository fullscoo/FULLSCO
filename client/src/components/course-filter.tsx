import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface CourseFilters {
  categories: string[];
  levels: string[];
  price: string[];
  rating: string[];
}

interface CourseFilterProps {
  filters: CourseFilters;
  onFilterChange: (filters: CourseFilters) => void;
  isMobile?: boolean;
}

const CourseFilter = ({ filters, onFilterChange, isMobile = false }: CourseFilterProps) => {
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [localFilters, setLocalFilters] = useState<CourseFilters>(filters);
  
  const { data: categories } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });
  
  // Update local filters when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all-levels', label: 'All Levels' },
  ];
  
  const priceOptions = [
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ];
  
  const ratingOptions = [
    { value: '4.5', label: '4.5 & up' },
    { value: '4.0', label: '4.0 & up' },
    { value: '3.5', label: '3.5 & up' },
    { value: '3.0', label: '3.0 & up' },
  ];
  
  const handleCheckboxChange = (
    filterType: keyof CourseFilters,
    value: string,
    checked: boolean
  ) => {
    const updatedFilters = { ...localFilters };
    
    if (checked) {
      updatedFilters[filterType] = [...updatedFilters[filterType], value];
    } else {
      updatedFilters[filterType] = updatedFilters[filterType].filter(
        (item) => item !== value
      );
    }
    
    setLocalFilters(updatedFilters);
  };
  
  const applyFilters = () => {
    onFilterChange(localFilters);
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  const resetFilters = () => {
    const emptyFilters: CourseFilters = {
      categories: [],
      levels: [],
      price: [],
      rating: [],
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };
  
  const FilterContent = () => (
    <>
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
        <div className="space-y-2">
          {categories?.map((category) => (
            <div key={category} className="flex items-center">
              <input
                id={`cat-${category}`}
                name="category"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                checked={localFilters.categories.includes(category)}
                onChange={(e) => 
                  handleCheckboxChange('categories', category, e.target.checked)
                }
              />
              <Label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-600 capitalize">
                {category.replace('-', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Level</h3>
        <div className="space-y-2">
          {levels.map((level) => (
            <div key={level.value} className="flex items-center">
              <input
                id={`level-${level.value}`}
                name="level"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                checked={localFilters.levels.includes(level.value)}
                onChange={(e) => 
                  handleCheckboxChange('levels', level.value, e.target.checked)
                }
              />
              <Label htmlFor={`level-${level.value}`} className="ml-2 text-sm text-gray-600">
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Price</h3>
        <div className="space-y-2">
          {priceOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`price-${option.value}`}
                name="price"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                checked={localFilters.price.includes(option.value)}
                onChange={(e) => 
                  handleCheckboxChange('price', option.value, e.target.checked)
                }
              />
              <Label htmlFor={`price-${option.value}`} className="ml-2 text-sm text-gray-600">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Rating</h3>
        <div className="space-y-2">
          {ratingOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`rating-${option.value}`}
                name="rating"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                checked={localFilters.rating.includes(option.value)}
                onChange={(e) => 
                  handleCheckboxChange('rating', option.value, e.target.checked)
                }
              />
              <Label htmlFor={`rating-${option.value}`} className="ml-2 text-sm text-gray-600">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={resetFilters} variant="outline" className="w-full">
          Reset Filters
        </Button>
      </div>
    </>
  );
  
  if (isMobile) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full bg-white rounded-lg shadow mb-6"
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between">
            <span>Filter Courses</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4">
          <FilterContent />
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
      <FilterContent />
    </div>
  );
};

export default CourseFilter;
