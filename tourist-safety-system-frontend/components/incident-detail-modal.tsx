"use client";

import { X, MapPin, Clock, User, Phone, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useState } from "react";

interface IncidentDetailModalProps {
    incident: any;
    onClose: () => void;
    onUpdate?: () => void;
}

export function IncidentDetailModal({ incident, onClose, onUpdate }: IncidentDetailModalProps) {
    const [status, setStatus] = useState(incident.status);
    const [assignedOfficer, setAssignedOfficer] = useState(incident.assignedOfficer || "");
    const [notes, setNotes] = useState("");
    const [updating, setUpdating] = useState(false);

    const handleUpdateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const response = await fetch(`http://localhost:5000/api/security/incidents/${incident.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();
            if (result.success) {
                setStatus(newStatus);
                onUpdate?.();
            } else {
                alert("Failed to update status: " + result.message);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignOfficer = async () => {
        if (!assignedOfficer.trim()) return;

        setUpdating(true);
        try {
            const response = await fetch(`http://localhost:5000/api/security/incidents/${incident.id}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ officerName: assignedOfficer })
            });

            const result = await response.json();
            if (result.success) {
                onUpdate?.();
                alert("Officer assigned successfully");
            } else {
                alert("Failed to assign officer: " + result.message);
            }
        } catch (error) {
            console.error("Failed to assign officer:", error);
            alert("Failed to assign officer");
        } finally {
            setUpdating(false);
        }
    };

    const handleAddNote = async () => {
        if (!notes.trim()) return;

        setUpdating(true);
        try {
            const response = await fetch(`http://localhost:5000/api/security/incidents/${incident.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: notes })
            });

            const result = await response.json();
            if (result.success) {
                setNotes("");
                onUpdate?.();
                alert("Note added successfully");
            } else {
                alert("Failed to add note: " + result.message);
            }
        } catch (error) {
            console.error("Failed to add note:", error);
            alert("Failed to add note");
        } finally {
            setUpdating(false);
        }
    };

    const getSeverityBadge = (severity: string) => {
        const colors = {
            critical: "bg-red-500 text-white",
            high: "bg-orange-500 text-white",
            medium: "bg-yellow-500 text-gray-900",
            low: "bg-blue-500 text-white"
        };
        return colors[severity as keyof typeof colors] || "bg-gray-500 text-white";
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            reported: "bg-yellow-100 text-yellow-800 border-yellow-300",
            investigating: "bg-blue-100 text-blue-800 border-blue-300",
            resolved: "bg-green-100 text-green-800 border-green-300"
        };
        return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-300";
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{incident.title}</h2>
                        <p className="text-sm text-gray-600">Incident ID: {incident.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status and Severity */}
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityBadge(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-lg border text-sm font-semibold ${getStatusBadge(status)}`}>
                            {status.toUpperCase()}
                        </span>
                    </div>

                    {/* Tourist Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Tourist Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-semibold">{incident.touristName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Tourist ID</p>
                                <p className="font-semibold">{incident.touristId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Incident Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Incident Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-semibold capitalize">{incident.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </p>
                                <p className="font-semibold">{incident.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Timestamp
                                </p>
                                <p className="font-semibold">{new Date(incident.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Assignment */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-3">Assigned Officer</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Officer name"
                                value={assignedOfficer}
                                onChange={(e) => setAssignedOfficer(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg"
                            />
                            <button
                                onClick={handleAssignOfficer}
                                disabled={updating}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                                Assign
                            </button>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-3">Update Status</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleUpdateStatus("investigating")}
                                disabled={updating || status === "investigating"}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                                Mark Investigating
                            </button>
                            <button
                                onClick={() => handleUpdateStatus("resolved")}
                                disabled={updating || status === "resolved"}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Mark Resolved
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            Add Note
                        </h3>
                        <div className="space-y-2">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add investigation notes, updates, or comments..."
                                className="w-full px-3 py-2 border rounded-lg h-24 resize-none"
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={updating || !notes.trim()}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                                Add Note
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            onClick={() => window.open(`tel:${incident.touristId}`, "_blank")}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                            <Phone className="h-5 w-5" />
                            Contact Tourist
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
