import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, InstructorRoute, AdminRoute } from "@/lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CoursesPage from "@/pages/courses-page";
import CourseDetailPage from "@/pages/course-detail-page";
import LearningPage from "@/pages/learning-page";
import InstructorPage from "@/pages/instructor-page";
import ProfilePage from "@/pages/profile-page";
import CertificatesPage from "@/pages/certificates-page";
import AdminDashboard from "@/pages/admin/dashboard";
import ManageCourses from "@/pages/admin/manage-courses";
import ManageUsers from "@/pages/admin/manage-users";
import NotFound from "@/pages/not-found";

import NavBar from "@/components/nav-bar";
import Footer from "@/components/footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/courses" component={CoursesPage} />
          <Route path="/courses/category/:category" component={CoursesPage} />
          <Route path="/courses/:slug" component={CourseDetailPage} />
          <ProtectedRoute path="/learn/:courseId/:lessonId?" component={LearningPage} />
          <Route path="/instructors" component={InstructorPage} />
          <Route path="/instructors/:id" component={InstructorPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/my-courses" component={ProfilePage} />
          <ProtectedRoute path="/certificates" component={CertificatesPage} />
          <InstructorRoute path="/instructor/dashboard" component={ProfilePage} />
          <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
          <AdminRoute path="/admin/courses" component={ManageCourses} />
          <AdminRoute path="/admin/users" component={ManageUsers} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
