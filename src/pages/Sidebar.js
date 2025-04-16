import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from 'next/image';
import {
  FaFileAlt,
  FaCheckCircle,
  FaTasks,
  FaFileSignature,
  FaClipboardCheck,
  FaFileUpload,
  FaFileDownload,
  FaShoppingCart,
  FaUsers,
  FaPlusSquare,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ role }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // Define sidebar items for each role with icons
  const sidebarItems = {
    PM: [
      { name: "TDS (Pending Approval)", path: "/tds", icon: <FaFileAlt /> },
      { name: "Fully Approved TDS", path: "/fullyApprovedTds", icon: <FaCheckCircle /> },
      { name: "Validate Documents", path: "/PMValidateDocument", icon: <FaTasks /> },
    ],
    L2: [
      { name: "TDS Final Approval", path: "/L2Validation", icon: <FaFileSignature /> },
      { name: "L2 Validation", path: "/TDSFinalApproval", icon: <FaClipboardCheck /> },
    ],
    L1: [
      { name: "TDS", path: "/L1TDSApproval", icon: <FaFileAlt /> },
      { name: "Manage Project Teams", path: "/L1ProjectUserUpdate", icon: <FaUsers /> },
    ],
    L3: [{ name: "TDS", path: "/L3TDSApproval", icon: <FaFileAlt /> }],
    BU: [{ name: "TDS", path: "/BUTDSApproval", icon: <FaFileAlt /> }],
    SME: [
      { name: "Create TDS", path: "/CreateTDS", icon: <FaFileUpload /> },
      { name: "Rejected TDS", path: "/RejectedTDS", icon: <FaFileDownload /> },
      { name: "Validate Documents", path: "/SMEValidateDocument", icon: <FaTasks /> },
    ],
    Contractor: [
      { name: "Fully Approved TDS", path: "/ContractorFullyApprovedTDS", icon: <FaCheckCircle /> },
      { name: "Resubmit Documents", path: "/ContractorResubmitDocument", icon: <FaFileUpload /> },
      { name: "Accept Purchase", path: "/ContractorAcceptPurchase", icon: <FaShoppingCart /> },
    ],
    SUPER_ADMIN: [
      { name: "User Approval", path: "/UserApproval", icon: <FaUsers /> },
      { name: "Create Project", path: "/ProjectsPage", icon: <FaPlusSquare /> },
    ],
  };

  const items = sidebarItems[role] || [];

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Redirect to login page
    router.push("/login");
  };

  return (
    <div
      style={{
        width: isExpanded ? "250px" : "60px",
        background: "linear-gradient(to bottom right, #0A3D62, #67E6DC)",
        transition: "width 0.4s",
        minHeight: "100vh",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderTopLeftRadius: "10px",
        borderBottomLeftRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div>
        {/* Logo Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isExpanded ? "center" : "flex-start",
            padding: "15px",
            backgroundColor: "#013A53",
            transition: "justify-content 0.4s ease",
            height: "70px",
          }}
        >
          <Image
            src="/Remove background project.png"
            alt="Logo"
            width={40} // Specify width
            height={40} // Specify height
            style={{
              objectFit: "contain",
            }}
          />
        </div>

        {/* Sidebar Items */}
        {items.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              textDecoration: "none",
              padding: "15px",
              marginBottom: "5px",
              borderRadius: "5px",
              backgroundColor: router.pathname === item.path ? "#0a4a5a" : "transparent",
              transition: "background-color 0.3s ease",
            }}
          >
            <span style={{ fontSize: "1.5em", marginRight: isExpanded ? "10px" : "0" }}>
              {item.icon}
            </span>
            {isExpanded && <span style={{ fontWeight: "500" }}>{item.name}</span>}
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div
        style={{
          padding: "15px",
          marginBottom: "10px",
          cursor: "pointer",
          color: "white",
          display: "flex",
          alignItems: "center",
          borderRadius: "5px",
          transition: "background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
        onClick={handleLogout}
      >
        <span style={{ fontSize: "1.5em", marginRight: isExpanded ? "10px" : "0" }}>
          <FaSignOutAlt />
        </span>
        {isExpanded && <span style={{ fontWeight: "500" }}>Logout</span>}
      </div>
    </div>
  );
};

export default Sidebar;