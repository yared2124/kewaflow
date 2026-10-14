"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface LeadRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: "Facebook" | "Website" | "Referral" | "Direct Inquiry";
  stage: "INQUIRY" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";
  stageLabel: string;
  lastContact: string;
  serviceInterest: string;
  nextFollowUp: string;
  notes: string;
}

const INITIAL_LEADS: LeadRecord[] = [
  {
    id: "lead-1",
    name: "Alamayehu T.",
    company: "TechNova Solutions",
    email: "a.tesfaye@technova.et",
    phone: "+251 911 234 567",
    source: "Facebook",
    stage: "QUALIFIED",
    stageLabel: "Qualified",
    lastContact: "2h ago",
    serviceInterest: "Custom Enterprise Web Systems",
    nextFollowUp: "Today at 04:00 PM",
    notes: "Requested quotation for internal logistics modernization.",
  },
  {
    id: "lead-2",
    name: "Selam G.",
    company: "Global Trade PLC",
    email: "selam.g@globaltrade.et",
    phone: "+251 912 345 678",
    source: "Website",
    stage: "INQUIRY",
    stageLabel: "Inquiry",
    lastContact: "5h ago",
    serviceInterest: "API & Systems Integration",
    nextFollowUp: "Tomorrow morning",
    notes: "Submitted website inquiry regarding ERP and payment switch sync.",
  },
  {
    id: "lead-3",
    name: "Mebratu S.",
    company: "Sunrise Logistics",
    email: "mebratu@sunriselog.et",
    phone: "+251 913 456 789",
    source: "Facebook",
    stage: "PROPOSAL",
    stageLabel: "Proposal",
    lastContact: "1d ago",
    serviceInterest: "Custom Enterprise Web Systems",
    nextFollowUp: "16 Oct",
    notes: "Proposal v1 sent for review by managing director.",
  },
  {
    id: "lead-4",
    name: "Tsagaye G.",
    company: "FreshMart",
    email: "tsagaye@freshmart.et",
    phone: "+251 914 567 890",
    source: "Referral",
    stage: "WON",
    stageLabel: "Won",
    lastContact: "2d ago",
    serviceInterest: "Custom Enterprise Web Systems",
    nextFollowUp: "Kickoff scheduled 20 Oct",
    notes: "Contract signed for multi-store inventory web application.",
  },
  {
    id: "lead-5",
    name: "Daniel K.",
    company: "Blue Horizon",
    email: "daniel@bluehorizon.et",
    phone: "+251 915 678 901",
    source: "Website",
    stage: "INQUIRY",
    stageLabel: "Inquiry",
    lastContact: "3d ago",
    serviceInterest: "API & Systems Integration",
    nextFollowUp: "18 Oct",
    notes: "Inquired about payment gateway integration for e-commerce portal.",
  },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Lead form state
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadCompany, setNewLeadCompany] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadService, setNewLeadService] = useState("Custom Enterprise Web Systems");
  const [newLeadSource, setNewLeadSource] = useState<"Facebook" | "Website" | "Referral" | "Direct Inquiry">("Direct Inquiry");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "ALL" || lead.stage === stageFilter;
    const matchesSource = sourceFilter === "ALL" || lead.source === sourceFilter;
    return matchesSearch && matchesStage && matchesSource;
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompany) return;

    const newLead: LeadRecord = {
      id: `lead-${Date.now()}`,
      name: newLeadName,
      company: newLeadCompany,
      email: newLeadEmail || "contact@client.et",
      phone: newLeadPhone || "+251 900 000 000",
      source: newLeadSource,
      stage: "INQUIRY",
      stageLabel: "Inquiry",
      lastContact: "Just now",
      serviceInterest: newLeadService,
      nextFollowUp: "Today",
      notes: "Direct lead captured manually by Admin.",
    };

    setLeads([newLead, ...leads]);
    setShowAddModal(false);
    setNewLeadName("");
    setNewLeadCompany("");
    setNewLeadEmail("");
    setNewLeadPhone("");
  };

  const updateStage = (leadId: string, newStage: LeadRecord["stage"]) => {
    const stageLabels = {
      INQUIRY: "Inquiry",
      QUALIFIED: "Qualified",
      PROPOSAL: "Proposal",
      WON: "Won",
      LOST: "Lost",
    };
    setLeads(
      leads.map((l) =>
        l.id === leadId
          ? { ...l, stage: newStage, stageLabel: stageLabels[newStage] }
          : l
      )
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) =>
        prev
          ? { ...prev, stage: newStage, stageLabel: stageLabels[newStage] }
          : null
      );
    }
  };

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Leads
          </h1>
          <p className="text-[11px] text-slate-500">
            Track and manage your potential clients through the pipeline.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => alert("CSV Export generated with PII data minimization (LEAD-005).")}
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
            <option value="ALL">All Stages</option>
            <option value="INQUIRY">Inquiry</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Source Dropdown */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Sources</option>
            <option value="Facebook">Facebook</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Direct Inquiry">Direct Inquiry</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Name</th>
                <th className="pb-2.5">Company</th>
                <th className="pb-2.5">Source</th>
                <th className="pb-2.5">Stage</th>
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

                  {/* Stage Pill (CRM-002: INQUIRY -> QUALIFIED -> PROPOSAL -> WON) */}
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
                  Pipeline Stage (CRM-002)
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  {(["INQUIRY", "QUALIFIED", "PROPOSAL", "WON"] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => updateStage(selectedLead.id, st)}
                        className={`py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer border ${
                          selectedLead.stage === st
                            ? "bg-kewa-teal text-white border-kewa-teal shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {st}
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

              {/* Service Interest & Next Action */}
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Service Interest
                  </span>
                  <p className="font-bold text-slate-900">
                    {selectedLead.serviceInterest}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Next Follow-up Due
                  </span>
                  <p className="font-semibold text-kewa-teal">
                    {selectedLead.nextFollowUp}
                  </p>
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
                <span>PII minimized. Pseudonymized before any AI transmission.</span>
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
                  Company *
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
                    Phone
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
                  <option>API & Systems Integration</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700">
                  Source Attribution (CRM-003)
                </label>
                <select
                  value={newLeadSource}
                  onChange={(e) =>
                    setNewLeadSource(
                      e.target.value as "Facebook" | "Website" | "Referral" | "Direct Inquiry"
                    )
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800"
                >
                  <option value="Direct Inquiry">Direct Inquiry</option>
                  <option value="Facebook">Facebook (Confirmed Lead)</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                </select>
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
                className="py-1 px-3.5 rounded-lg bg-kewa-teal text-white text-[11px] font-bold shadow-xs cursor-pointer"
              >
                Create Lead
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
