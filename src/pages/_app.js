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
    router.events.on('routeChangeError', checkRole);

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
    // FIX 1: Add minHeight: "100vh" to ensure the container spans the full screen height.
    // display: "flex" is already here to position the sidebar and content side-by-side.
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {showSidebar && role && <Sidebar role={role} />}
      
      {/* FIX 2: flex: 1 ensures this div takes up all remaining width. */}
      {/* Set minHeight: '100vh' here too, to ensure content also stretches vertically if sidebar is not shown */}
      <div style={{ flex: 1, minHeight: "100vh" }}> 
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
