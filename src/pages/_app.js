import React, { useEffect, useState } from "react";
import Sidebar from "../pages/Sidebar";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Do not show sidebar on login page
  const showSidebar = router.pathname !== "/login";

  useEffect(() => {
    // Function to retrieve and set the role
    const checkRole = () => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
        setIsLoading(false);
    };

    // 1. Run once on mount
    checkRole();
    
    // 2. Add listener for route changes (crucial for updating the sidebar after login/logout navigation)
    router.events.on('routeChangeComplete', checkRole);
    router.events.on('routeChangeError', checkRole); // Handle case where nav fails

    // Cleanup function
    return () => {
        router.events.off('routeChangeComplete', checkRole);
        router.events.off('routeChangeError', checkRole);
    };
  }, []); // Empty dependency array: listeners are set up once

  // Loading state while role is being fetched
  if (isLoading) {
    return <div>Loading...</div>; // Or any loading indicator
  }
  
  return (
    <div style={{ display: "flex" }}>
      {showSidebar && role && <Sidebar role={role} />}
      <div style={{ flex: 1 }}>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
