import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
    adminListApplications,
    adminListSchemes,
    adminListUsers,
    adminUpdateApplication,
    adminUpdateUserRole,
    adminCreateScheme,
    adminDeactivateScheme,
} from "../../../services/admin/adminService";

const tabs = [
    { id: "applications", label: "Applications" },
    { id: "users", label: "Users" },
    { id: "schemes", label: "Schemes" },
];

const AdminDashboard = () => {
    const [tab, setTab] = useState("applications");
    const [applications, setApplications] = useState([]);
    const [users, setUsers] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [schemeForm, setSchemeForm] = useState({
        schemeName: "",
        schemeShortTitle: "",
        state: "",
        level: "Central",
        detailedDescription_md: "",
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            if (tab === "applications") {
                const r = await adminListApplications(1, 50);
                setApplications(r.data || []);
            } else if (tab === "users") {
                const r = await adminListUsers(1, 50);
                setUsers(r.data || []);
            } else {
                const r = await adminListSchemes(1, 50);
                setSchemes(r.schemes || []);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        load();
    }, [load]);

    const handleAppUpdate = async (id, status, adminNote) => {
        try {
            await adminUpdateApplication(id, { status, adminNote });
            toast.success("Updated");
            load();
        } catch (e) {
            toast.error(e.response?.data?.message || "Update failed");
        }
    };

    const handleRole = async (userId, role) => {
        try {
            await adminUpdateUserRole(userId, role);
            toast.success("Role updated");
            load();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed");
        }
    };

    const handleCreateScheme = async (e) => {
        e.preventDefault();
        try {
            await adminCreateScheme({
                ...schemeForm,
                tags: [],
                schemeCategory: [],
                eligibilityDescription_md: "",
                applicationProcess: [],
                benefits: [],
                faqs: [],
                documents_required: [],
                references: [],
                isActive: true,
            });
            toast.success("Scheme created");
            setSchemeForm({
                schemeName: "",
                schemeShortTitle: "",
                state: "",
                level: "Central",
                detailedDescription_md: "",
            });
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Create failed");
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm("Deactivate this scheme? It will be hidden from the public catalogue.")) return;
        try {
            await adminDeactivateScheme(id);
            toast.success("Deactivated");
            load();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 pb-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin dashboard</h1>
            <p className="text-gray-600 mb-8">Manage applications, users, and welfare schemes.</p>

            <div className="flex gap-2 border-b border-gray-200 mb-6">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                            tab === t.id
                                ? "border-[#74B83E] text-[#74B83E]"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-gray-500">Loading…</p>
            ) : (
                <>
                    {tab === "applications" && (
                        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-left">
                                    <tr>
                                        <th className="p-3">Applicant</th>
                                        <th className="p-3">Scheme</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Admin note</th>
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((a) => (
                                        <ApplicationRow key={a._id} app={a} onSave={handleAppUpdate} />
                                    ))}
                                </tbody>
                            </table>
                            {!applications.length && (
                                <p className="p-6 text-gray-500 text-center">No applications yet.</p>
                            )}
                        </div>
                    )}

                    {tab === "users" && (
                        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-left">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} className="border-t border-gray-100">
                                            <td className="p-3">{u.name}</td>
                                            <td className="p-3">{u.email}</td>
                                            <td className="p-3">
                                                <select
                                                    className="border rounded px-2 py-1"
                                                    value={u.role}
                                                    onChange={(e) => handleRole(u._id, e.target.value)}
                                                >
                                                    <option value="user">user</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!users.length && (
                                <p className="p-6 text-gray-500 text-center">No users.</p>
                            )}
                        </div>
                    )}

                    {tab === "schemes" && (
                        <div className="space-y-8">
                            <form
                                onSubmit={handleCreateScheme}
                                className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-4"
                            >
                                <h2 className="font-semibold text-gray-900">Add scheme (quick)</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Scheme name *
                                        </label>
                                        <input
                                            required
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={schemeForm.schemeName}
                                            onChange={(e) =>
                                                setSchemeForm((s) => ({ ...s, schemeName: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Short title *
                                        </label>
                                        <input
                                            required
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={schemeForm.schemeShortTitle}
                                            onChange={(e) =>
                                                setSchemeForm((s) => ({
                                                    ...s,
                                                    schemeShortTitle: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            State
                                        </label>
                                        <input
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={schemeForm.state}
                                            onChange={(e) =>
                                                setSchemeForm((s) => ({ ...s, state: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Level
                                        </label>
                                        <select
                                            className="w-full border rounded-lg px-3 py-2"
                                            value={schemeForm.level}
                                            onChange={(e) =>
                                                setSchemeForm((s) => ({ ...s, level: e.target.value }))
                                            }
                                        >
                                            <option value="Central">Central</option>
                                            <option value="State">State</option>
                                            <option value="State/ UT">State/ UT</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Description (markdown)
                                    </label>
                                    <textarea
                                        className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                                        value={schemeForm.detailedDescription_md}
                                        onChange={(e) =>
                                            setSchemeForm((s) => ({
                                                ...s,
                                                detailedDescription_md: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#74B83E] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#629a33]"
                                >
                                    Create scheme
                                </button>
                            </form>

                            <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 text-left">
                                        <tr>
                                            <th className="p-3">Name</th>
                                            <th className="p-3">State</th>
                                            <th className="p-3">Active</th>
                                            <th className="p-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schemes.map((s) => (
                                            <tr key={s._id} className="border-t border-gray-100">
                                                <td className="p-3 font-medium">{s.schemeName}</td>
                                                <td className="p-3">{s.state || "—"}</td>
                                                <td className="p-3">
                                                    {s.isActive === false ? (
                                                        <span className="text-red-600">No</span>
                                                    ) : (
                                                        <span className="text-green-600">Yes</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {s.isActive !== false && (
                                                        <button
                                                            type="button"
                                                            className="text-red-600 hover:underline"
                                                            onClick={() => handleDeactivate(s._id)}
                                                        >
                                                            Deactivate
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

function ApplicationRow({ app, onSave }) {
    const [status, setStatus] = useState(app.status);
    const [note, setNote] = useState(app.adminNote || "");

    useEffect(() => {
        setStatus(app.status);
        setNote(app.adminNote || "");
    }, [app._id, app.status, app.adminNote]);

    return (
        <tr className="border-t border-gray-100 align-top">
            <td className="p-3">
                <div className="font-medium">{app.user?.name}</div>
                <div className="text-gray-500 text-xs">{app.user?.email}</div>
            </td>
            <td className="p-3">
                <div>{app.scheme?.schemeName}</div>
                <div className="text-gray-500 text-xs">{app.applicantNote}</div>
            </td>
            <td className="p-3">
                <select
                    className="border rounded px-2 py-1"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="pending">pending</option>
                    <option value="under_review">under_review</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                </select>
            </td>
            <td className="p-3">
                <textarea
                    className="border rounded px-2 py-1 w-full min-w-[160px] min-h-[60px] text-xs"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </td>
            <td className="p-3">
                <button
                    type="button"
                    className="text-[#74B83E] font-medium hover:underline"
                    onClick={() => onSave(app._id, status, note)}
                >
                    Save
                </button>
            </td>
        </tr>
    );
}

export default AdminDashboard;
