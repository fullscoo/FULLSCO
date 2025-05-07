import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import CourseProgress from "@/components/course-progress";
import { 
  User, 
  Settings, 
  BookOpen, 
  Award, 
  EditIcon, 
  Save, 
  PlusCircle, 
  Loader2,
  Grid3X3,
  List,
  GraduationCap,
  ShieldCheck,
  FileText,
  BookMarked
} from "lucide-react";
import { Enrollment } from "@shared/schema";

// Define profile update schema
const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  profileImage: z.string().optional(),
  bio: z.string().optional(),
});

// Define password update schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ProfilePage = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(
    location.includes("my-courses") ? "courses" : "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  
  // Fetch user enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });
  
  // Filter enrollments by status
  const activeEnrollments = enrollments?.filter(e => e.status === 'active') || [];
  const completedEnrollments = enrollments?.filter(e => e.status === 'completed') || [];
  
  // Profile update form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      profileImage: user?.profileImage || "",
      bio: user?.bio || "",
    },
  });
  
  // Password update form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const res = await apiRequest("POST", `/api/users/${user?.id}/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
      passwordForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  // Handle password form submission
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate(data);
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>
          <div className="px-6 py-4 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center">
            <div className="-mt-16 md:-mt-24 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white">
                <AvatarImage src={user.profileImage || ""} alt={user.fullName} />
                <AvatarFallback className="text-3xl">{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{user.fullName}</h1>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="mr-2">
                      {user.role === 'instructor' ? (
                        <>
                          <GraduationCap className="mr-1 h-3 w-3" />
                          Instructor
                        </>
                      ) : user.role === 'admin' ? (
                        <>
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Administrator
                        </>
                      ) : (
                        <>
                          <User className="mr-1 h-3 w-3" />
                          Student
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="mr-1 h-3 w-3" />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  {user.role === 'instructor' && (
                    <Link href="/instructor/dashboard">
                      <Button variant="outline" className="mr-2">
                        <BookMarked className="mr-2 h-4 w-4" />
                        Instructor Dashboard
                      </Button>
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard">
                      <Button variant="outline" className="mr-2">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="mr-2 h-4 w-4" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="mr-2 h-4 w-4" />
              Certificates
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Summary</CardTitle>
                    <CardDescription>Your personal information and statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Username</h3>
                        <p>{user.username}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p>{user.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                        <p className="capitalize">{user.role}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Learning Stats</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary">
                              {enrollments?.length || 0}
                            </p>
                            <p className="text-xs text-gray-500">Courses</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {completedEnrollments.length || 0}
                            </p>
                            <p className="text-xs text-gray-500">Completed</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                        <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Manage your profile details</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <EditIcon className="mr-2 h-4 w-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="profileImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Image URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://example.com/avatar.png" />
                                </FormControl>
                                <FormDescription>
                                  Enter a URL for your profile picture
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Tell us about yourself"
                                    className="resize-none min-h-[120px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="mr-2"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p className="mt-1">{user.fullName}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="mt-1">{user.email}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                          <p className="mt-1">{user.bio || "No bio provided yet."}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit"
                          disabled={updatePasswordMutation.isPending}
                        >
                          {updatePasswordMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* My Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Learning</CardTitle>
                  <CardDescription>Track your progress and continue learning</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={displayMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setDisplayMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={displayMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setDisplayMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : enrollments && enrollments.length > 0 ? (
                  <div>
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">In Progress ({activeEnrollments.length})</h3>
                      {activeEnrollments.length > 0 ? (
                        <div className={displayMode === "grid" 
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                          : "space-y-4"
                        }>
                          {activeEnrollments.map(enrollment => (
                            <CourseProgress 
                              key={enrollment.id} 
                              enrollment={enrollment} 
                              displayMode={displayMode}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <p className="text-gray-600 mb-4">You don't have any in-progress courses.</p>
                          <Link href="/courses">
                            <Button>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Browse Courses
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    {completedEnrollments.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Completed ({completedEnrollments.length})</h3>
                        <div className={displayMode === "grid" 
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                          : "space-y-4"
                        }>
                          {completedEnrollments.map(enrollment => (
                            <CourseProgress 
                              key={enrollment.id} 
                              enrollment={enrollment} 
                              displayMode={displayMode}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.</p>
                    <Link href="/courses">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>My Certificates</CardTitle>
                <CardDescription>View and download your earned certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No certificates yet</h3>
                  <p className="text-gray-500 mb-6">Complete courses to earn certificates that showcase your achievements.</p>
                  <Link href="/courses">
                    <Button variant="outline">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
