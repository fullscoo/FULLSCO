import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg 
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" 
            fill="currentColor" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
          
          <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl font-heading">
                <span className="block xl:inline">تعلم بلا حدود</span>
                <span className="block text-primary xl:inline mt-2">Limitless Learning</span>
              </h1>
              
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
                Discover high-quality courses taught by expert instructors. Advance your career, learn new skills, and achieve your goals through flexible, online education.
              </p>
              
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href="/courses">
                    <Button size="lg" className="w-full">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/auth">
                    <Button variant="outline" size="lg" className="w-full">
                      Join Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img 
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" 
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b2bd?ixlib=rb-4.0.3&w=1080&q=80" 
          alt="Students learning online" 
        />
      </div>
    </div>
  );
};

export default HeroSection;
