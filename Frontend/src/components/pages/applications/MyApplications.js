import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { getMyApplications } from "../../../services/applications/applicationService";

const statusClass = (s) => {
    switch (s) {
        case "approved":
            return "bg-green-100 text-green-800";
        case "rejected":
            return "bg-red-100 text-red-800";
        case "under_review":
            return "bg-amber-100 text-amber-800";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const MyApplications = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await getMyApplications();
                setList(res.data || []);
            } catch (e) {
                setError("Could not load your applications.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <div className="max-w-3xl mx-auto p-8 text-center text-gray-600">Loading…</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 pb-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="text-[#74B83E]" />
                My applications
            </h1>
            <p className="text-gray-600 mb-8">Track welfare scheme applications you have submitted.</p>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {!list.length && !error ? (
                <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
                    No applications yet.{" "}
                    <Link to="/schemes" className="text-[#74B83E] font-medium hover:underline">
                        Browse schemes
                    </Link>
                </div>
            ) : (
                <ul className="space-y-4">
                    {list.map((app) => (
                        <li
                            key={app._id}
                            className="bg-white rounded-xl shadow border border-gray-100 p-5"
                        >
                            <div className="flex flex-wrap justify-between gap-2 items-start">
                                <div>
                                    <h2 className="font-semibold text-lg text-gray-900">
                                        {app.scheme?.schemeName || "Scheme"}
                                    </h2>
                                    {app.scheme?.schemeShortTitle && (
                                        <p className="text-sm text-gray-500">{app.scheme.schemeShortTitle}</p>
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass(
                                        app.status
                                    )}`}
                                >
                                    {app.status?.replace("_", " ")}
                                </span>
                            </div>
                            {app.applicantNote ? (
                                <p className="mt-3 text-sm text-gray-600">
                                    <span className="font-medium">Your note:</span> {app.applicantNote}
                                </p>
                            ) : null}
                            {app.adminNote ? (
                                <p className="mt-2 text-sm text-gray-600">
                                    <span className="font-medium">Admin:</span> {app.adminNote}
                                </p>
                            ) : null}
                            <p className="mt-3 text-xs text-gray-400">
                                Submitted {app.createdAt ? new Date(app.createdAt).toLocaleString() : "—"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyApplications;
