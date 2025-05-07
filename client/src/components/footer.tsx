import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-8 w-8 text-primary-400" />
              <span className="font-bold text-2xl text-white">Taalim</span>
            </Link>
            
            <p className="text-gray-400 mb-6">
              A comprehensive e-learning platform offering high-quality courses 
              taught by expert instructors. Advance your skills, get certified, 
              and achieve your career goals through flexible, online education.
            </p>
            
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-primary-600 hover:text-white text-gray-400">
                <FacebookIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-primary-600 hover:text-white text-gray-400">
                <TwitterIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-primary-600 hover:text-white text-gray-400">
                <InstagramIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-primary-600 hover:text-white text-gray-400">
                <LinkedinIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-primary-600 hover:text-white text-gray-400">
                <YoutubeIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Important Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white transition">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/courses">
                  <a className="text-gray-400 hover:text-white transition">Courses</a>
                </Link>
              </li>
              <li>
                <Link href="/instructors">
                  <a className="text-gray-400 hover:text-white transition">Instructors</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white transition">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-400 hover:text-white transition">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-gray-400 hover:text-white transition">Blog</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq">
                  <a className="text-gray-400 hover:text-white transition">FAQs</a>
                </Link>
              </li>
              <li>
                <Link href="/help-center">
                  <a className="text-gray-400 hover:text-white transition">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <a className="text-gray-400 hover:text-white transition">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-gray-400 hover:text-white transition">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/refund-policy">
                  <a className="text-gray-400 hover:text-white transition">Refund Policy</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">Cairo, Egypt</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-400" dir="ltr">+20 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400">info@taalim.com</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h3 className="font-bold text-lg mb-4">Newsletter</h3>
              <form className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-gray-800 text-white border-gray-700 rounded-r-none focus-visible:ring-primary-400" 
                  required 
                />
                <Button type="submit" className="rounded-l-none">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Taalim Learning Platform. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-4">
              <img src="https://via.placeholder.com/40x25?text=Visa" alt="Visa" className="h-6" />
              <img src="https://via.placeholder.com/40x25?text=MC" alt="Mastercard" className="h-6" />
              <img src="https://via.placeholder.com/40x25?text=PayPal" alt="PayPal" className="h-6" />
              <img src="https://via.placeholder.com/40x25?text=Fawry" alt="Fawry" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
