import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const Adminicon: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth(); // Use existing Firebase auth instance
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Check custom claims for admin role
        const idTokenResult = await user.getIdTokenResult();
        const isAdminUser = idTokenResult.claims.role === 'admin';
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false); // No user logged in
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (loading || !isAdmin) {
    return null; // Don't render during loading or if not admin
  }

  return (
    <a
      href="/admin/admin-dashboard"
      className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      title="Admin Dashboard"
    >
      {/* Replace with your admin icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5v-4a2 2 0 012-2h10a2 2 0 012 2v4h-4m-2 4h.01M12 14h.01"
        />
      </svg>
    </a>
  );
};

export default Adminicon;