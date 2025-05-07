import { 
  User, InsertUser, 
  Course, InsertCourse,
  Section, InsertSection,
  Lesson, InsertLesson,
  Enrollment, InsertEnrollment,
  LessonProgress, InsertLessonProgress,
  Certificate, InsertCertificate,
  Review, InsertReview
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Define the storage interface
export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getInstructors(): Promise<User[]>;
  
  // Course related methods
  getCourse(id: number): Promise<Course | undefined>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  getAllCourses(): Promise<Course[]>;
  getFeaturedCourses(): Promise<Course[]>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  getCoursesByInstructor(instructorId: number): Promise<Course[]>;
  searchCourses(query: string): Promise<Course[]>;
  
  // Section related methods
  getSection(id: number): Promise<Section | undefined>;
  getSectionsByCourse(courseId: number): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: number, sectionData: Partial<Section>): Promise<Section | undefined>;
  deleteSection(id: number): Promise<boolean>;
  
  // Lesson related methods
  getLesson(id: number): Promise<Lesson | undefined>;
  getLessonsBySection(sectionId: number): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, lessonData: Partial<Lesson>): Promise<Lesson | undefined>;
  deleteLesson(id: number): Promise<boolean>;
  
  // Enrollment related methods
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined>;
  getEnrollmentsByUser(userId: number): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | undefined>;
  
  // Lesson Progress related methods
  getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined>;
  getLessonProgressByUser(userId: number): Promise<LessonProgress[]>;
  createOrUpdateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  
  // Certificate related methods
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificatesByUser(userId: number): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  verifyCertificate(certificateNumber: string): Promise<Certificate | undefined>;
  
  // Review related methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewsByCourse(courseId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined>;
  
  // Categories
  getCategories(): Promise<string[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private sections: Map<number, Section>;
  private lessons: Map<number, Lesson>;
  private enrollments: Map<number, Enrollment>;
  private lessonProgress: Map<string, LessonProgress>;
  private certificates: Map<number, Certificate>;
  private reviews: Map<number, Review>;
  private categories: string[];
  
  public sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private courseIdCounter: number;
  private sectionIdCounter: number;
  private lessonIdCounter: number;
  private enrollmentIdCounter: number;
  private lessonProgressIdCounter: number;
  private certificateIdCounter: number;
  private reviewIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.sections = new Map();
    this.lessons = new Map();
    this.enrollments = new Map();
    this.lessonProgress = new Map();
    this.certificates = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.sectionIdCounter = 1;
    this.lessonIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.lessonProgressIdCounter = 1;
    this.certificateIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.categories = [
      "programming",
      "business",
      "design",
      "marketing",
      "languages",
      "photography",
      "health",
      "music",
      "personal-development"
    ];
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      email: "admin@example.com",
      password: "adminpassword",
      fullName: "System Admin",
      role: "admin",
      profileImage: "https://ui-avatars.com/api/?name=System+Admin",
      bio: "System administrator"
    });
  }
  
  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getInstructors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "instructor");
  }
  
  // Course related methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(
      (course) => course.slug === slug
    );
  }
  
  async createCourse(courseData: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const course: Course = { 
      ...courseData, 
      id, 
      createdAt, 
      updatedAt,
      rating: 0,
      totalReviews: 0,
      totalStudents: 0 
    };
    this.courses.set(id, course);
    return course;
  }
  
  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined> {
    const course = await this.getCourse(id);
    if (!course) return undefined;
    
    const updatedAt = new Date();
    const updatedCourse: Course = { ...course, ...courseData, updatedAt };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }
  
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.isPublished);
  }
  
  async getFeaturedCourses(): Promise<Course[]> {
    return Array.from(this.courses.values())
      .filter(course => course.isPublished && course.isFeatured)
      .slice(0, 8);
  }
  
  async getCoursesByCategory(category: string): Promise<Course[]> {
    return Array.from(this.courses.values())
      .filter(course => course.isPublished && course.category === category);
  }
  
  async getCoursesByInstructor(instructorId: number): Promise<Course[]> {
    return Array.from(this.courses.values())
      .filter(course => course.instructorId === instructorId);
  }
  
  async searchCourses(query: string): Promise<Course[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.courses.values())
      .filter(course => 
        course.isPublished && (
          course.title.toLowerCase().includes(lowerQuery) ||
          course.description.toLowerCase().includes(lowerQuery) ||
          course.shortDescription.toLowerCase().includes(lowerQuery) ||
          (course.tags && course.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        )
      );
  }
  
  // Section related methods
  async getSection(id: number): Promise<Section | undefined> {
    return this.sections.get(id);
  }
  
  async getSectionsByCourse(courseId: number): Promise<Section[]> {
    return Array.from(this.sections.values())
      .filter(section => section.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }
  
  async createSection(sectionData: InsertSection): Promise<Section> {
    const id = this.sectionIdCounter++;
    const section: Section = { ...sectionData, id };
    this.sections.set(id, section);
    return section;
  }
  
  async updateSection(id: number, sectionData: Partial<Section>): Promise<Section | undefined> {
    const section = await this.getSection(id);
    if (!section) return undefined;
    
    const updatedSection: Section = { ...section, ...sectionData };
    this.sections.set(id, updatedSection);
    return updatedSection;
  }
  
  async deleteSection(id: number): Promise<boolean> {
    // Delete all lessons in this section first
    const sectionLessons = await this.getLessonsBySection(id);
    for (const lesson of sectionLessons) {
      await this.deleteLesson(lesson.id);
    }
    
    return this.sections.delete(id);
  }
  
  // Lesson related methods
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }
  
  async getLessonsBySection(sectionId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.sectionId === sectionId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }
  
  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    const id = this.lessonIdCounter++;
    const lesson: Lesson = { ...lessonData, id };
    this.lessons.set(id, lesson);
    return lesson;
  }
  
  async updateLesson(id: number, lessonData: Partial<Lesson>): Promise<Lesson | undefined> {
    const lesson = await this.getLesson(id);
    if (!lesson) return undefined;
    
    const updatedLesson: Lesson = { ...lesson, ...lessonData };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }
  
  async deleteLesson(id: number): Promise<boolean> {
    return this.lessons.delete(id);
  }
  
  // Enrollment related methods
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }
  
  async getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      enrollment => enrollment.userId === userId && enrollment.courseId === courseId
    );
  }
  
  async getEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.userId === userId);
  }
  
  async getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.courseId === courseId);
  }
  
  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const enrolledAt = new Date();
    const enrollment: Enrollment = { 
      ...enrollmentData, 
      id, 
      enrolledAt,
      status: 'active',
      progress: 0,
      completedAt: null
    };
    this.enrollments.set(id, enrollment);
    
    // Update course totalStudents
    const course = await this.getCourse(enrollmentData.courseId);
    if (course) {
      await this.updateCourse(course.id, {
        totalStudents: course.totalStudents + 1
      });
    }
    
    return enrollment;
  }
  
  async updateEnrollment(id: number, enrollmentData: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const enrollment = await this.getEnrollment(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment: Enrollment = { ...enrollment, ...enrollmentData };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }
  
  // Lesson Progress related methods
  async getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    const key = `${userId}-${lessonId}`;
    return this.lessonProgress.get(key);
  }
  
  async getLessonProgressByUser(userId: number): Promise<LessonProgress[]> {
    return Array.from(this.lessonProgress.values())
      .filter(progress => progress.userId === userId);
  }
  
  async createOrUpdateLessonProgress(progressData: InsertLessonProgress): Promise<LessonProgress> {
    const key = `${progressData.userId}-${progressData.lessonId}`;
    const existingProgress = this.lessonProgress.get(key);
    
    if (existingProgress) {
      const lastWatchedAt = new Date();
      const updatedProgress: LessonProgress = { 
        ...existingProgress, 
        ...progressData,
        lastWatchedAt
      };
      this.lessonProgress.set(key, updatedProgress);
      
      // Update enrollment progress if lesson is completed
      if (progressData.completed && !existingProgress.completed) {
        await this.updateEnrollmentProgress(progressData.userId, progressData.lessonId);
      }
      
      return updatedProgress;
    } else {
      const id = this.lessonProgressIdCounter++;
      const lastWatchedAt = new Date();
      const newProgress: LessonProgress = { 
        id, 
        ...progressData,
        lastWatchedAt
      };
      this.lessonProgress.set(key, newProgress);
      
      // Update enrollment progress if lesson is completed
      if (progressData.completed) {
        await this.updateEnrollmentProgress(progressData.userId, progressData.lessonId);
      }
      
      return newProgress;
    }
  }
  
  // Helper method to update enrollment progress when lesson progress changes
  private async updateEnrollmentProgress(userId: number, lessonId: number): Promise<void> {
    // Find the lesson to get the course
    const lesson = await this.getLesson(lessonId);
    if (!lesson) return;
    
    const section = await this.getSection(lesson.sectionId);
    if (!section) return;
    
    const courseId = section.courseId;
    
    // Find the enrollment
    const enrollment = await this.getEnrollmentByUserAndCourse(userId, courseId);
    if (!enrollment) return;
    
    // Get all sections for the course
    const sections = await this.getSectionsByCourse(courseId);
    
    // Get all lessons for the course
    let totalLessons = 0;
    let completedLessons = 0;
    
    for (const section of sections) {
      const lessons = await this.getLessonsBySection(section.id);
      totalLessons += lessons.length;
      
      for (const lesson of lessons) {
        const progress = await this.getLessonProgress(userId, lesson.id);
        if (progress && progress.completed) {
          completedLessons++;
        }
      }
    }
    
    // Calculate progress percentage
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    
    // Update enrollment
    const updatedEnrollment: Partial<Enrollment> = { progress };
    
    // Check if course is completed
    if (progress === 100) {
      updatedEnrollment.status = 'completed';
      updatedEnrollment.completedAt = new Date();
      
      // Create certificate if course is completed
      if (enrollment.status !== 'completed') {
        await this.createCertificate({
          userId,
          courseId,
          certificateNumber: `CERT-${Date.now()}-${userId}-${courseId}`,
          templateId: 'default'
        });
      }
    }
    
    await this.updateEnrollment(enrollment.id, updatedEnrollment);
  }
  
  // Certificate related methods
  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }
  
  async getCertificatesByUser(userId: number): Promise<Certificate[]> {
    return Array.from(this.certificates.values())
      .filter(certificate => certificate.userId === userId);
  }
  
  async createCertificate(certificateData: InsertCertificate): Promise<Certificate> {
    const id = this.certificateIdCounter++;
    const issuedAt = new Date();
    const certificate: Certificate = { ...certificateData, id, issuedAt };
    this.certificates.set(id, certificate);
    return certificate;
  }
  
  async verifyCertificate(certificateNumber: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(
      certificate => certificate.certificateNumber === certificateNumber
    );
  }
  
  // Review related methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId);
  }
  
  async getReviewsByCourse(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.courseId === courseId);
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    // Check if user has already reviewed this course
    const existingReview = Array.from(this.reviews.values()).find(
      review => review.userId === reviewData.userId && review.courseId === reviewData.courseId
    );
    
    if (existingReview) {
      return this.updateReview(existingReview.id, reviewData) as Promise<Review>;
    }
    
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    const review: Review = { ...reviewData, id, createdAt };
    this.reviews.set(id, review);
    
    // Update course rating and total reviews
    const course = await this.getCourse(reviewData.courseId);
    if (course) {
      const courseReviews = await this.getReviewsByCourse(reviewData.courseId);
      const totalReviews = courseReviews.length;
      const totalRating = courseReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / totalReviews;
      
      await this.updateCourse(course.id, {
        rating: avgRating,
        totalReviews
      });
    }
    
    return review;
  }
  
  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const review = await this.getReview(id);
    if (!review) return undefined;
    
    const updatedReview: Review = { ...review, ...reviewData };
    this.reviews.set(id, updatedReview);
    
    // Update course rating
    const course = await this.getCourse(review.courseId);
    if (course) {
      const courseReviews = await this.getReviewsByCourse(review.courseId);
      const totalReviews = courseReviews.length;
      const totalRating = courseReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / totalReviews;
      
      await this.updateCourse(course.id, {
        rating: avgRating,
        totalReviews
      });
    }
    
    return updatedReview;
  }
  
  // Categories
  async getCategories(): Promise<string[]> {
    return this.categories;
  }
}

export const storage = new MemStorage();
