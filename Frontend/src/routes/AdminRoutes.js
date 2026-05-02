import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { verifyToken } from "./auth";

const AdminRoutes = () => {
    const [state, setState] = useState(null);

    useEffect(() => {
        const run = async () => {
            const authed = await verifyToken();
            if (!authed) {
                setState("denied");
                return;
            }
            try {
                const token = localStorage.getItem("accessToken");
                const decoded = jwtDecode(token);
                setState(decoded.role === "admin" ? "ok" : "denied");
            } catch {
                setState("denied");
            }
        };
        run();
    }, []);

    if (state === null) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center text-gray-600">
                Loading…
            </div>
        );
    }

    if (state !== "ok") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoutes;
