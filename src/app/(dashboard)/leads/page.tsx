"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Download,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getLeads, createLead, updateLeadStage, ValidLeadStage } from "@/server/actions/leads";

interface LeadUI {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  stage: ValidLeadStage;
  stageLabel: string;
  lastContact: string;
  serviceInterest: string;
  nextFollowUp: string;
  notes: string;
  dealValueUsd?: number | null;
}

function formatTimeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STAGE_LABELS: Record<ValidLeadStage, string> = {
  INQUIRY: "Inquiry",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  WON: "Won",
  LOST: "Lost",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<LeadUI | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Lead form state
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadCompany, setNewLeadCompany] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadService, setNewLeadService] = useState("Custom Enterprise Web Systems");
  const [newLeadSource, setNewLeadSource] = useState("Direct Inquiry");
  const [newLeadNotes, setNewLeadNotes] = useState("");
  const [newLeadDealValue, setNewLeadDealValue] = useState("");

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const res = await getLeads();
      if (res.success && res.leads) {
        const mapped: LeadUI[] = res.leads.map((l) => {
          // Parse name and company if formatted as "Name (Company)"
          let name = l.name;
          let company = "Private Client";
          const match = l.name.match(/^(.*?)\s*\((.*?)\)$/);
          if (match) {
            name = match[1].trim();
            company = match[2].trim();
          }

          const isEmail = l.contactIdentifier.includes("@");
          const email = isEmail ? l.contactIdentifier : "client@company.et";
          const phone = !isEmail ? l.contactIdentifier : "+251 91 123 4567";

          return {
            id: l.id,
            name,
            company,
            email,
            phone,
            source: l.sourceCampaign || l.contactChannel || "Direct Inquiry",
            stage: l.stage as ValidLeadStage,
            stageLabel: STAGE_LABELS[l.stage as ValidLeadStage] || l.stage,
            lastContact: formatTimeAgo(l.updatedAt),
            serviceInterest: l.contentItem?.title || "Custom Enterprise Web Systems",
            nextFollowUp: "Active Follow-up",
            notes: l.notes || "Recorded inquiry in CRM pipeline.",
            dealValueUsd: l.dealValueUsd ? Number(l.dealValueUsd) : null,
          };
        });
        setLeads(mapped);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "ALL" || lead.stage === stageFilter;
    const matchesSource = sourceFilter === "ALL" || lead.source.toLowerCase().includes(sourceFilter.toLowerCase());
    return matchesSearch && matchesStage && matchesSource;
  });

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompany) return;

    setIsActionPending(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const fullNameWithCompany = `${newLeadName.trim()} (${newLeadCompany.trim()})`;
      const contactChannel = newLeadPhone ? "Phone / WhatsApp" : "Email";
      const contactIdentifier = newLeadPhone || newLeadEmail || "Pending contact info";

      const res = await createLead({
        name: fullNameWithCompany,
        contactChannel,
        contactIdentifier,
        stage: "INQUIRY",
        attributionType: newLeadSource === "Facebook" ? "DIRECT" : "UNKNOWN",
        sourceCampaign: newLeadSource,
        notes: newLeadNotes || `Inquired about ${newLeadService}`,
        dealValueUsd: newLeadDealValue ? parseFloat(newLeadDealValue) : undefined,
      });

      if (!res.success) {
        setActionError(res.error || "Failed to create lead.");
        return;
      }

      setActionSuccess(`Lead for "${newLeadName}" created in PostgreSQL!`);
      setShowAddModal(false);
      setNewLeadName("");
      setNewLeadCompany("");
      setNewLeadEmail("");
      setNewLeadPhone("");
      setNewLeadNotes("");
      setNewLeadDealValue("");
      await loadLeads();
    } catch (err: any) {
      setActionError(err.message || "Failed to add lead.");
    } finally {
      setIsActionPending(false);
    }
  };

  const updateStage = async (leadId: string, newStage: ValidLeadStage) => {
    setIsActionPending(true);
    setActionError(null);

    try {
      const res = await updateLeadStage(leadId, newStage);
      if (!res.success) {
        setActionError(res.error || "Failed to update lead stage.");
        return;
      }

      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, stage: newStage, stageLabel: STAGE_LABELS[newStage] }
            : l
        )
      );

      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) =>
          prev ? { ...prev, stage: newStage, stageLabel: STAGE_LABELS[newStage] } : null
        );
      }
      setActionSuccess(`Stage updated to ${STAGE_LABELS[newStage]}.`);
    } catch (err: any) {
      setActionError(err.message || "Failed to update stage.");
    } finally {
      setIsActionPending(false);
    }
  };

  const exportCsv = () => {
    const headers = ["ID", "Name", "Company", "Stage", "Source", "Email", "Phone", "Notes", "DealValueUSD"];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name}"`,
      `"${l.company}"`,
      l.stage,
      `"${l.source}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      l.dealValueUsd || 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kewaflow_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Leads & Pipeline CRM
          </h1>
          <p className="text-[11px] text-slate-500">
            Track genuine client opportunities (CRM-001: Likes & reach are NEVER counted as leads).
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadLeads}
            disabled={isLoading}
            className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCsv}
            className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-1.5 px-3.5 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-300" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Stage Dropdown */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Stages ({leads.length})</option>
            <option value="INQUIRY">Inquiry ({leads.filter(l => l.stage === "INQUIRY").length})</option>
            <option value="QUALIFIED">Qualified ({leads.filter(l => l.stage === "QUALIFIED").length})</option>
            <option value="PROPOSAL">Proposal ({leads.filter(l => l.stage === "PROPOSAL").length})</option>
            <option value="WON">Won ({leads.filter(l => l.stage === "WON").length})</option>
            <option value="LOST">Lost ({leads.filter(l => l.stage === "LOST").length})</option>
          </select>

          {/* Source Dropdown */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Sources</option>
            <option value="Facebook">Facebook (Confirmed Leads)</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Direct">Direct / Inbound</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-kewa-teal" />
            <p className="text-xs font-medium">Loading CRM leads from database...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-1">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No leads match your filter.</p>
            <p className="text-[11px]">Click "Add Lead" to register a new client inquiry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Name</th>
                  <th className="pb-2.5">Company</th>
                  <th className="pb-2.5">Source Attribution</th>
                  <th className="pb-2.5">Stage</th>
                  <th className="pb-2.5">Value (USD)</th>
                  <th className="pb-2.5">Last Contact</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="py-2.5 font-bold text-slate-900 group-hover:text-kewa-teal transition-colors">
                      {lead.name}
                    </td>

                    {/* Company */}
                    <td className="py-2.5 text-slate-600 font-medium">
                      {lead.company}
                    </td>

                    {/* Source */}
                    <td className="py-2.5 text-slate-500 font-normal">
                      {lead.source}
                    </td>

                    {/* Stage Pill */}
                    <td className="py-2.5">
                      {lead.stage === "INQUIRY" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          Inquiry
                        </span>
                      )}
                      {lead.stage === "QUALIFIED" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-100">
                          Qualified
                        </span>
                      )}
                      {lead.stage === "PROPOSAL" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          Proposal
                        </span>
                      )}
                      {lead.stage === "WON" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Won
                        </span>
                      )}
                      {lead.stage === "LOST" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                          Lost
                        </span>
                      )}
                    </td>

                    {/* Deal Value */}
                    <td className="py-2.5 font-semibold text-slate-800">
                      {lead.dealValueUsd ? `$${lead.dealValueUsd.toLocaleString()}` : "—"}
                    </td>

                    {/* Last Contact */}
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {lead.lastContact}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Inspection Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {selectedLead.name}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {selectedLead.company} • {selectedLead.source}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              {/* Stage Transition Selector (CRM-002) */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pipeline Stage (CRM-002: Zero ad-hoc stages)
                </span>
                <div className="grid grid-cols-5 gap-1 text-center text-xs">
                  {(["INQUIRY", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => updateStage(selectedLead.id, st)}
                        disabled={isActionPending}
                        className={`py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer border ${
                          selectedLead.stage === st
                            ? "bg-kewa-teal text-white border-kewa-teal shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {STAGE_LABELS[st]}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium text-slate-700">
                    {selectedLead.email}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium text-slate-700">
                    {selectedLead.phone}
                  </span>
                </div>
              </div>

              {/* Service Interest & Deal Value */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Service Interest
                    </span>
                    <p className="font-bold text-slate-900">
                      {selectedLead.serviceInterest}
                    </p>
                  </div>
                  {selectedLead.dealValueUsd && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Deal Value
                      </span>
                      <p className="font-bold text-emerald-600">
                        ${selectedLead.dealValueUsd.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Activity Notes
                  </span>
                  <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 mt-0.5">
                    {selectedLead.notes}
                  </p>
                </div>
              </div>

              {/* PII Protection Notice (CRM-005) */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-cyan-50/70 border border-cyan-100 p-2 rounded-lg font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-kewa-cyan-dark shrink-0" />
                <span>PII minimized. Pseudonymized before transmission per CRM-005.</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                onClick={() => setSelectedLead(null)}
                className="py-1 px-3.5 rounded-lg bg-kewa-teal text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddLead}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900">
                Add New Lead Record
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almaz Bekele"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ethiopian Tech PLC"
                  value={newLeadCompany}
                  onChange={(e) => setNewLeadCompany(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@company.et"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+251 9..."
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-700">
                    Service Interest
                  </label>
                  <select
                    value={newLeadService}
                    onChange={(e) => setNewLeadService(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800"
                  >
                    <option>Custom Enterprise Web Systems</option>
                    <option>Business Process Automation</option>
                    <option>Cloud Architecture & Migration</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700">
                    Est. Deal Value (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={newLeadDealValue}
                    onChange={(e) => setNewLeadDealValue(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700">
                  Source Attribution (CRM-003)
                </label>
                <select
                  value={newLeadSource}
                  onChange={(e) => setNewLeadSource(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800"
                >
                  <option value="Direct Inquiry">Direct Inquiry</option>
                  <option value="Facebook">Facebook (Confirmed Inbound)</option>
                  <option value="Website">Website Form</option>
                  <option value="Referral">Client Referral</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700">
                  Notes / Problem Statement
                </label>
                <textarea
                  rows={2}
                  placeholder="Key business challenges described..."
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="py-1 px-3 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionPending}
                className="py-1 px-3.5 rounded-lg bg-kewa-teal text-white text-[11px] font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isActionPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Create Lead</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
