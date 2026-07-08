import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";
import { normalizeRole } from "../services/roleRouting";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

function ProtectedRoute({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);
  const showingLogoutPrompt = useRef(false);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const normalizedAllowedRoles = useMemo(
    () => allowedRoles.map(normalizeRole),
    [allowedRoles]
  );

  useEffect(() => {
    let active = true;

    const validate = () => {
      checkAccess(active);
    };

    validate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      validate();
    });

    const handlePageShow = () => {
      validate();
    };

    const handleFocus = () => {
      validate();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        validate();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [normalizedAllowedRoles.join("|")]);

  useEffect(() => {
    if (!allowed || loading) return;

    const currentUrl = location.pathname + location.search;
    const guardedUrl = `${currentUrl}#session-active`;

    window.history.replaceState({ placeMateProtectedPage: true }, "", currentUrl);
    window.history.pushState({ placeMateBackGuard: true }, "", guardedUrl);

    const handleBack = async () => {
      if (showingLogoutPrompt.current) {
        return;
      }

      showingLogoutPrompt.current = true;
      setShowLogoutPrompt(true);
      window.setTimeout(() => {
        window.history.pushState({ placeMateBackGuard: true }, "", guardedUrl);
      }, 50);
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [allowed, loading, location.pathname, location.search, navigate]);

  const checkAccess = async (active = true) => {
    setLoading(true);
    setAllowed(false);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!active) return;

    if (!session?.user) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!active) return;

    if (userError || !user) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    let role = normalizeRole(profile?.role);

    if (!role) {
      const { data: tpo } = await supabase
        .from("tpos")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (tpo) {
        role = "TPO_ADMIN";
      }
    }

    if (!role) {
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (student) {
        role = "STUDENT";
      }
    }

    if (!active) return;

    setAllowed(
      normalizedAllowedRoles.length === 0 ||
        normalizedAllowedRoles.includes(role)
    );

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">
        Checking access...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  const stayOnPage = () => {
    showingLogoutPrompt.current = false;
    setShowLogoutPrompt(false);
  };

  const logoutFromPrompt = async () => {
    showingLogoutPrompt.current = false;
    setShowLogoutPrompt(false);
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {children}
      {showLogoutPrompt ? (
        <div className="pm-session-modal" role="dialog" aria-modal="true" aria-labelledby="session-modal-title">
          <div className="pm-session-card">
            <h2 id="session-modal-title">Logout from PlaceMate?</h2>
            <p>You are currently signed in. Do you want to logout and return to the login page?</p>
            <div className="pm-session-actions">
              <button className="pm-btn ghost" onClick={stayOnPage} type="button">
                No, stay here
              </button>
              <button className="pm-btn primary" onClick={logoutFromPrompt} type="button">
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ProtectedRoute;
