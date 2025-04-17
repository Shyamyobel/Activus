// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { useContext } from "react";
// import { AuthContext } from "../contexts/AuthContext";

// const Dashboard = () => {
//   const { role } = useContext(AuthContext); // Get the logged-in user's role
//   const [allowedContent, setAllowedContent] = useState([]);

//   useEffect(() => {
//     // Define content for each role
//     const contentConfig = {
//       Stakeholder: [
//         { key: "ProjectsPage", label: "Projects" },
//         { key: "tds", label: "TDS" },
//       ],
//       PM: [
//         { key: "ProjectsPage", label: "Projects" },
//         { key: "tds", label: "TDS (Pending Approval)" },
//         { key: "fullyApprovedTds", label: "Fully Approved TDS" },
//         { key: "PMValidateDocument", label: "Validate Documents" },
//       ],
//       L2: [
//         { key: "L2ProjectApproval", label: "Projects" },
//         { key: "L2Validation", label: "TDS Final Approval" },
//         { key: "TDSFinalApproval", label: "L2 Validation" },
//       ],
//       L1: [{ key: "L1TDSApproval", label: "TDS" }],
//       L3: [{ key: "L3TDSApproval", label: "TDS" }],
//       BU: [{ key: "BUTDSApproval", label: "TDS" }],
//       SME: [
//         { key: "CreateTDS", label: "Create TDS" },
//         { key: "RejectedTDS", label: "Rejected TDS" },
//         { key: "SMEValidateDocument", label: "Validate Documents" },
//       ],
//       Contractor: [
//         { key: "ContractorFullyApprovedTDS", label: "Fully Approved TDS" },
//         { key: "ContractorResubmitDocument", label: "Resubmit Documents" },
//         { key: "ContractorAcceptPurchase", label: "Accept Purchase" },
//       ],
//     };

//     // Set allowed content based on the role
//     setAllowedContent(contentConfig[role] || []);
//   }, [role]);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Welcome, {role}</h1>
//       <h2>Your Dashboard</h2>
//       <div style={{ marginTop: "20px" }}>
//         {/* Dynamic Content */}
//         {allowedContent.length > 0 ? (
//           allowedContent.map((item) => (
//             <Link key={item.key} href={`/${item.key}`} legacyBehavior>
//               <a
//                 style={{
//                   display: "block",
//                   padding: "10px 15px",
//                   margin: "10px 0",
//                   backgroundColor: "#117285",
//                   color: "white",
//                   textDecoration: "none",
//                   borderRadius: "5px",
//                   fontWeight: "bold",
//                 }}
//               >
//                 {item.label}
//               </a>
//             </Link>
//           ))
//         ) : (
//           <p>No content available for your role.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
