import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import ExperiencePage from "./pages/dashboard/ExperiencePage";
import SkillsPage from "./pages/dashboard/SkillsPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import BlogPage from "./pages/dashboard/BlogPage";
import TestimonialsPage from "./pages/dashboard/TestimonialsPage";
import EducationPage from "./pages/dashboard/EducationPage";
import CertificationsPage from "./pages/dashboard/CertificationsPage";
import ResumePage from "./pages/dashboard/ResumePage";
import BrandPage from "./pages/dashboard/BrandPage";
import SiteContentPage from "./pages/dashboard/SiteContentPage";
import PublicLayout from "./layouts/PublicLayout";
import PublicHome from "./pages/public/PublicHome";
import PublicAbout from "./pages/public/PublicAbout";
import PublicProjects from "./pages/public/PublicProjects";
import ProjectDetail from "./pages/public/ProjectDetail";
import PublicExperience from "./pages/public/PublicExperience";
import PublicSkills from "./pages/public/PublicSkills";
import PublicBlog from "./pages/public/PublicBlog";
import PublicContact from "./pages/public/PublicContact";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

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
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

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
            </BrowserRouter>
          </TooltipProvider>
        </RecaptchaProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
