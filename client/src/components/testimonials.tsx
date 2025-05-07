import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Fatima H.",
    role: "Web Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=120&fit=crop&crop=faces&q=80",
    content: "The web development course completely transformed my career path. I went from knowing nothing about coding to landing a junior developer job in just 6 months. The instructors are amazing!",
    rating: 5
  },
  {
    id: 2,
    name: "Omar K.",
    role: "Marketing Manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=120&fit=crop&crop=faces&q=80",
    content: "I've tried many online platforms, but Taalim stands out for its high-quality content and interactive learning experience. The certificate I earned helped me secure a promotion at work!",
    rating: 5
  },
  {
    id: 3,
    name: "Noura A.",
    role: "Data Analyst",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=120&fit=crop&crop=faces&q=80",
    content: "The data science course was challenging but incredibly rewarding. The support from instructors and the community made all the difference. I now work in my dream field thanks to what I learned.",
    rating: 4.5
  }
];

const TestimonialsSection = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-heading">
            What Our Students Say
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Hear from our community of learners about their experience
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex text-yellow-500 mb-4">
                  {Array.from({ length: Math.floor(testimonial.rating) }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                  {testimonial.rating % 1 > 0 && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      className="h-5 w-5 fill-current"
                    >
                      <path fill="none" d="M0 0h24v24H0z"/>
                      <path d="M12 8.8l-1.8 3.6-4 .6 2.9 2.8-.7 4 3.6-1.9V2c-2.3 0-4.4 1.1-5.7 2.8l1.4.4L12 8.8z"/>
                      <path d="M12 2v16.2l3.6 1.9-.7-4 2.9-2.8-4-.6L12 8.8l-1.8-3.6 3.4-1 .4-.4C12.4 2.3 11.7 2 11 2h1z"/>
                    </svg>
                  )}
                  {Array.from({ length: Math.floor(5 - testimonial.rating) }).map((_, i) => (
                    <Star key={i + Math.ceil(testimonial.rating)} className="h-5 w-5 text-gray-300" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-gray-900 font-semibold">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
