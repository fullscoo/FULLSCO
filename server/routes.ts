import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCourseSchema, insertSectionSchema, insertLessonSchema, insertReviewSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to ensure user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to ensure user is an instructor
function isInstructor(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && (req.user?.role === 'instructor' || req.user?.role === 'admin')) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Instructor access required" });
}

// Middleware to ensure user is an admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/featured", async (req, res) => {
    try {
      const courses = await storage.getFeaturedCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured courses" });
    }
  });

  app.get("/api/courses/category/:category", async (req, res) => {
    try {
      const courses = await storage.getCoursesByCategory(req.params.category);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses by category" });
    }
  });

  app.get("/api/courses/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const courses = await storage.searchCourses(query);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to search courses" });
    }
  });

  app.get("/api/courses/:slug", async (req, res) => {
    try {
      const course = await storage.getCourseBySlug(req.params.slug);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", isInstructor, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.patch("/api/courses/:id", isInstructor, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user is instructor of this course or admin
      if (course.instructorId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to update this course" });
      }
      
      const updatedCourse = await storage.updateCourse(courseId, req.body);
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", isInstructor, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user is instructor of this course or admin
      if (course.instructorId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to delete this course" });
      }
      
      await storage.deleteCourse(courseId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Section routes
  app.get("/api/courses/:courseId/sections", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const sections = await storage.getSectionsByCourse(courseId);
      res.json(sections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.post("/api/sections", isInstructor, async (req, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      
      // Check if user is instructor of this course or admin
      const course = await storage.getCourse(sectionData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to add sections to this course" });
      }
      
      const section = await storage.createSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid section data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  app.patch("/api/sections/:id", isInstructor, async (req, res) => {
    try {
      const sectionId = parseInt(req.params.id);
      const section = await storage.getSection(sectionId);
      
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      // Check if user is instructor of this course or admin
      const course = await storage.getCourse(section.courseId);
      if (course?.instructorId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to update this section" });
      }
      
      const updatedSection = await storage.updateSection(sectionId, req.body);
      res.json(updatedSection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update section" });
    }
  });

  app.delete("/api/sections/:id", isInstructor, async (req, res) => {
    try {
      const sectionId = parseInt(req.params.id);
      const section = await storage.getSection(sectionId);
      
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      // Check if user is instructor of this course or admin
      const course = await storage.getCourse(section.courseId);
      if (course?.instructorId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to delete this section" });
      }
      
      await storage.deleteSection(sectionId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete section" });
    }
  });

  // Lesson routes
  app.get("/api/sections/:sectionId/lessons", async (req, res) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      const lessons = await storage.getLessonsBySection(sectionId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.post("/api/lessons", isInstructor, async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      
      // Check if user is instructor of this course or admin
      const section = await storage.getSection(lessonData.sectionId);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      const course = await storage.getCourse(section.courseId);
      if (course?.instructorId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to add lessons to this section" });
      }
      
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lesson data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lesson" });
    }
  });

  app.patch("/api/lessons/:id", isInstructor, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      // Check if user is instructor of this course or admin
      const section = await storage.getSection(lesson.sectionId);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      const course = await storage.getCourse(section.courseId);
      if (course?.instructorId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to update this lesson" });
      }
      
      const updatedLesson = await storage.updateLesson(lessonId, req.body);
      res.json(updatedLesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lesson" });
    }
  });

  app.delete("/api/lessons/:id", isInstructor, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      // Check if user is instructor of this course or admin
      const section = await storage.getSection(lesson.sectionId);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      const course = await storage.getCourse(section.courseId);
      if (course?.instructorId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to delete this lesson" });
      }
      
      await storage.deleteLesson(lessonId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lesson" });
    }
  });

  // Enrollment routes
  app.get("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByUser(req.user!.id);
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          return { ...enrollment, course };
        })
      );
      res.json(enrichedEnrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.body.courseId);
      const userId = req.user!.id;
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user is already enrolled
      const existingEnrollment = await storage.getEnrollmentByUserAndCourse(userId, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      const enrollment = await storage.createEnrollment({
        userId,
        courseId,
        status: 'active'
      });
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Lesson Progress routes
  app.post("/api/lesson-progress", isAuthenticated, async (req, res) => {
    try {
      const { lessonId, completed, lastWatchedPosition } = req.body;
      const userId = req.user!.id;
      
      // Check if lesson exists
      const lesson = await storage.getLesson(parseInt(lessonId));
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      
      // Check if user is enrolled in the course
      const section = await storage.getSection(lesson.sectionId);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      const enrollment = await storage.getEnrollmentByUserAndCourse(userId, section.courseId);
      if (!enrollment) {
        return res.status(403).json({ message: "You are not enrolled in this course" });
      }
      
      const progress = await storage.createOrUpdateLessonProgress({
        userId,
        lessonId: parseInt(lessonId),
        completed: !!completed,
        lastWatchedPosition: parseInt(lastWatchedPosition) || 0
      });
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lesson progress" });
    }
  });

  app.get("/api/lesson-progress/:lessonId", isAuthenticated, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const userId = req.user!.id;
      
      const progress = await storage.getLessonProgress(userId, lessonId);
      if (!progress) {
        return res.json({ completed: false, lastWatchedPosition: 0 });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson progress" });
    }
  });

  // Certificate routes
  app.get("/api/certificates", isAuthenticated, async (req, res) => {
    try {
      const certificates = await storage.getCertificatesByUser(req.user!.id);
      const enrichedCertificates = await Promise.all(
        certificates.map(async (certificate) => {
          const course = await storage.getCourse(certificate.courseId);
          return { ...certificate, course };
        })
      );
      res.json(enrichedCertificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.get("/api/certificates/verify/:certificateNumber", async (req, res) => {
    try {
      const certificate = await storage.verifyCertificate(req.params.certificateNumber);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      const user = await storage.getUser(certificate.userId);
      const course = await storage.getCourse(certificate.courseId);
      
      res.json({
        certificate,
        user: user ? { id: user.id, fullName: user.fullName } : null,
        course: course ? { id: course.id, title: course.title } : null,
        isValid: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to verify certificate" });
    }
  });

  // Review routes
  app.get("/api/courses/:courseId/reviews", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const reviews = await storage.getReviewsByCourse(courseId);
      
      const enrichedReviews = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              profileImage: user.profileImage,
            } : null
          };
        })
      );
      
      res.json(enrichedReviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Check if user is enrolled in the course
      const enrollment = await storage.getEnrollmentByUserAndCourse(
        req.user!.id,
        reviewData.courseId
      );
      
      if (!enrollment) {
        return res.status(403).json({ message: "You must be enrolled in the course to leave a review" });
      }
      
      const review = await storage.createReview(reviewData);
      
      // Get user info
      const user = await storage.getUser(review.userId);
      const enrichedReview = {
        ...review,
        user: user ? {
          id: user.id,
          fullName: user.fullName,
          profileImage: user.profileImage,
        } : null
      };
      
      res.status(201).json(enrichedReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // User routes
  app.get("/api/instructors", async (req, res) => {
    try {
      const instructors = await storage.getInstructors();
      
      // Remove sensitive information
      const safeInstructors = instructors.map(instructor => {
        const { password, ...safeInstructor } = instructor;
        return safeInstructor;
      });
      
      res.json(safeInstructors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch instructors" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow users to update their own profile (except admins)
      if (userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to update this user" });
      }
      
      // Don't allow updating role unless admin
      if (req.body.role && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "You don't have permission to update user role" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove sensitive information
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email exists
      const existingEmail = await storage.getUserByEmail(userData.email || '');
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Remove sensitive information
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function hashPassword(password: string): Promise<string> {
  const scryptAsync = promisify(scrypt);
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}
