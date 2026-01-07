import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout, AuthLayout, AdminLayout, ProtectedRoute } from "../components/layout";
import { GlobalLoading } from "../components/ui/GlobalLoading";
import { NotFoundPage } from "../pages/NotFoundPage";

// Lazy load pages for code splitting
import { lazy, Suspense } from "react";

// Main App (Prompt Builder)
const PromptBuilder = lazy(() => import("../App"));

// Community Pages
const FeedPage = lazy(() => import("../pages/community/FeedPage").then(m => ({ default: m.FeedPage })));
const CreatePromptPage = lazy(() => import("../pages/community/CreatePromptPage").then(m => ({ default: m.CreatePromptPage })));
const PromptDetailPage = lazy(() => import("../pages/community/PromptDetailPage").then(m => ({ default: m.PromptDetailPage })));
const EditPromptPage = lazy(() => import("../pages/community/EditPromptPage").then(m => ({ default: m.EditPromptPage })));
const ProfilePage = lazy(() => import("../pages/community/ProfilePage").then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage").then(m => ({ default: m.SettingsPage })));

// Auth Pages (to be created)
const LoginPage = lazy(() => import("../pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const GoogleCallbackPage = lazy(() => import("../pages/auth/GoogleCallbackPage").then(m => ({ default: m.GoogleCallbackPage })));

// Admin Pages (to be created)
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminPersonalitiesPage = lazy(() => import("../pages/admin/PersonalitiesPage").then(m => ({ default: m.AdminPersonalitiesPage })));
const AdminPresetsPage = lazy(() => import("../pages/admin/PresetsPage").then(m => ({ default: m.AdminPresetsPage })));
const AdminModerationPage = lazy(() => import("../pages/admin/ModerationPage").then(m => ({ default: m.AdminModerationPage })));
const AdminUsersPage = lazy(() => import("../pages/admin/UsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminTiersPage = lazy(() => import("../pages/admin/TiersPage").then(m => ({ default: m.AdminTiersPage })));
const AdminTemplatesPage = lazy(() => import("../pages/admin/TemplatesPage").then(m => ({ default: m.AdminTemplatesPage })));

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}



// Wrap component with Suspense
function withSuspense(Component: React.ComponentType<any>, props: any = {}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component {...props} />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // Main Layout Routes
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: withSuspense(PromptBuilder),
      },
      {
        path: "/prompts",
        element: withSuspense(FeedPage),
      },
      {
        path: "/prompts/:id",
        element: withSuspense(PromptDetailPage),
      },
      {
        path: "/u/:username",
        element: withSuspense(ProfilePage),
      },
      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/prompts/create",
            element: withSuspense(CreatePromptPage),
          },
          {
            path: "/prompts/:id/edit",
            element: withSuspense(EditPromptPage),
          },
          {
            path: "/settings",
            element: withSuspense(SettingsPage),
          },
        ],
      },
    ],
  },
  // Auth Layout Routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: withSuspense(LoginPage),
      },
      {
        path: "/register",
        element: withSuspense(RegisterPage),
      },
      {
        path: "/forgot-password",
        element: withSuspense(ForgotPasswordPage),
      },
      {
        path: "/reset-password",
        element: withSuspense(ResetPasswordPage),
      },
    ],
  },
  // Google OAuth Callback (no layout)
  {
    path: "/auth/google/callback",
    element: withSuspense(GoogleCallbackPage),
  },
  // Admin Layout Routes (Protected)
  {
    element: <ProtectedRoute requireAuth requireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/admin",
            element: withSuspense(AdminDashboard),
          },


          {
            path: "/admin/personalities",
            element: withSuspense(AdminPersonalitiesPage),
          },


          {
            path: "/admin/presets",
            element: withSuspense(AdminPresetsPage),
          },


          {
            path: "/admin/tiers",
            element: withSuspense(AdminTiersPage),
          },
          {
            path: "/admin/templates",
            element: withSuspense(AdminTemplatesPage),
          },


          {
            path: "/admin/users",
            element: withSuspense(AdminUsersPage),
          },


          {
            path: "/admin/moderation",
            element: withSuspense(AdminModerationPage),
          },
        ],
      },
    ],
  },
  // 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRoutes() {
  return (
    <>
      <GlobalLoading />
      <RouterProvider router={router} />
    </>
  );
}
