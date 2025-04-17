// // pages/_app.js
// import React from "react";
// import Sidebar from "../components/Sidebar";
// import { useRouter } from "next/router";

// function MyApp({ Component, pageProps }) {
//   const router = useRouter();

//   // Do not show sidebar on login page
//   const showSidebar = router.pathname !== "/login";

//   // Get the user role from localStorage
//   const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

//   return (
//     <div style={{ display: "flex" }}>
//       {showSidebar && <Sidebar role={role} />}
//       <div style={{ flex: 1 }}>
//         <Component {...pageProps} />
//       </div>
//     </div>
//   );
// }

// export default MyApp;