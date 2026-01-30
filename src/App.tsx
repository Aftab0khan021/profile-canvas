import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";

// Eager load critical routes (auth, landing)
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";

// Lazy load dashboard pages (loaded on demand)
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const ProfilePage = lazy(() => import("./pages/dashboard/ProfilePage"));
const ProjectsPage = lazy(() => import("./pages/dashboard/ProjectsPage"));
const ExperiencePage = lazy(() => import("./pages/dashboard/ExperiencePage"));
const SkillsPage = lazy(() => import("./pages/dashboard/SkillsPage"));
const MessagesPage = lazy(() => import("./pages/dashboard/MessagesPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const BlogPage = lazy(() => import("./pages/dashboard/BlogPage"));
const TestimonialsPage = lazy(() => import("./pages/dashboard/TestimonialsPage"));
const EducationPage = lazy(() => import("./pages/dashboard/EducationPage"));
const CertificationsPage = lazy(() => import("./pages/dashboard/CertificationsPage"));
const ResumePage = lazy(() => import("./pages/dashboard/ResumePage"));
const BrandPage = lazy(() => import("./pages/dashboard/BrandPage"));
const SiteContentPage = lazy(() => import("./pages/dashboard/SiteContentPage"));

// Lazy load public pages (loaded on demand)
const PublicLayout = lazy(() => import("./layouts/PublicLayout"));
const PublicHome = lazy(() => import("./pages/public/PublicHome"));
const PublicAbout = lazy(() => import("./pages/public/PublicAbout"));
const PublicProjects = lazy(() => import("./pages/public/PublicProjects"));
const ProjectDetail = lazy(() => import("./pages/public/ProjectDetail"));
const PublicExperience = lazy(() => import("./pages/public/PublicExperience"));
const PublicSkills = lazy(() => import("./pages/public/PublicSkills"));
const PublicBlog = lazy(() => import("./pages/public/PublicBlog"));
const PublicContact = lazy(() => import("./pages/public/PublicContact"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <RecaptchaProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />

                  {/* Public Portfolio - Multi-page architecture */}
                  <Route path="/p/:username" element={<PublicLayout />}>
                    <Route index element={<PublicHome />} />
                    <Route path="about" element={<PublicAbout />} />
                    <Route path="projects" element={<PublicProjects />} />
                    <Route path="projects/:projectId" element={<ProjectDetail />} />
                    <Route path="experience" element={<PublicExperience />} />
                    <Route path="skills" element={<PublicSkills />} />
                    <Route path="blog" element={<PublicBlog />} />
                    <Route path="contact" element={<PublicContact />} />
                    <Route path="blog/:slug" element={<BlogPost />} />
                  </Route>

                  {/* Dashboard */}
                  <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                    <Route index element={<DashboardHome />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="experience" element={<ExperiencePage />} />
                    <Route path="skills" element={<SkillsPage />} />
                    <Route path="education" element={<EducationPage />} />
                    <Route path="certifications" element={<CertificationsPage />} />
                    <Route path="testimonials" element={<TestimonialsPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="resume" element={<ResumePage />} />
                    <Route path="brand" element={<BrandPage />} />
                    <Route path="content" element={<SiteContentPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </RecaptchaProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
