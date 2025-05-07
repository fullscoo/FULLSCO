import { Link } from "wouter";
import { Star, StarHalf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@shared/schema";

interface InstructorCardProps {
  instructor: User;
  courseCount: number;
  rating: number;
}

const InstructorCard = ({ instructor, courseCount, rating }: InstructorCardProps) => {
  const { id, fullName, bio, profileImage } = instructor;

  // Format the rating to display full and half stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="relative">
        <img 
          className="w-full h-56 object-cover" 
          src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=200&background=random`} 
          alt={`${fullName} - Instructor`} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
      </div>
      
      <CardContent className="p-6">
        <Link href={`/instructors/${id}`}>
          <a className="font-bold text-xl mb-2 hover:text-primary transition">{fullName}</a>
        </Link>
        
        <p className="text-primary-600 text-sm mb-3">
          {instructor.role === 'instructor' ? 'Instructor' : 'Admin'}
        </p>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {bio || 'Expert instructor with experience in teaching and professional practice.'}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
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
            <span className="text-gray-500 text-sm ml-2">{rating.toFixed(1)}</span>
          </div>
          <div className="text-gray-500 text-sm">{courseCount} courses</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructorCard;
