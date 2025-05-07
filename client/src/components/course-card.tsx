import { Link } from "wouter";
import { Star, StarHalf, Clock, Signal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  compact?: boolean;
}

const CourseCard = ({ course, compact = false }: CourseCardProps) => {
  const {
    id,
    slug,
    title,
    shortDescription,
    thumbnailImage,
    instructorId,
    price,
    discountPrice,
    level,
    durationHours,
    rating,
    totalReviews,
    category,
    isFeatured
  } = course;

  // Format the rating to display full and half stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={thumbnailImage} 
          alt={title} 
        />
        
        {isFeatured && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-white text-sm px-3 py-1 m-2 rounded-full font-medium">
            Bestseller
          </div>
        )}
        
        <div className="absolute top-0 left-0 bg-white text-gray-800 text-xs font-bold py-1 px-2 m-2 rounded-full flex items-center">
          <Star className="h-3 w-3 text-yellow-500 mr-1" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>
      
      <CardContent className="p-6 flex-grow">
        <div className="flex items-center">
          <div className="flex text-yellow-500">
            {[...Array(5)].map((_, i) => {
              if (i < fullStars) {
                return <Star key={i} className="h-4 w-4 fill-current" />;
              } else if (i === fullStars && hasHalfStar) {
                return <StarHalf key={i} className="h-4 w-4 fill-current" />;
              } else {
                return <Star key={i} className="h-4 w-4 text-gray-300" />;
              }
            })}
          </div>
          <span className="ml-2 text-sm text-gray-500">{rating.toFixed(1)} ({totalReviews} reviews)</span>
        </div>
        
        <Link href={`/courses/${slug}`}>
          <a className="mt-3 block text-xl font-semibold text-gray-900 hover:text-primary transition">
            {title}
          </a>
        </Link>
        
        {!compact && (
          <p className="mt-1 text-gray-600 text-sm line-clamp-2">{shortDescription}</p>
        )}
        
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <User className="mr-1 h-4 w-4" />
          <span>Instructor #{instructorId}</span>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{durationHours} hours total</span>
          </div>
          <div className="flex items-center">
            <Signal className="mr-1 h-4 w-4" />
            <span>{level}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          <div>
            {discountPrice ? (
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-900">${discountPrice.toFixed(2)}</span>
                <span className="text-gray-400 line-through text-sm ml-2">${price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-xl font-bold text-gray-900">${price.toFixed(2)}</span>
            )}
          </div>
          
          <Link href={`/courses/${slug}`}>
            <Button size="sm">Enroll Now</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
