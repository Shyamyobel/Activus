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
    // Set role after the component is mounted (client-side only)
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setIsLoading(false); // Set loading to false after role is fetched
  }, []); // Empty dependency array, runs only once after the initial render

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
