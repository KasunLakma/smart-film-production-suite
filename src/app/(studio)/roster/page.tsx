"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Download,
  Mail,
  Phone,
  Building2,
  Sparkles,
  Plus,
  X,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Calendar,
  MapPin,
  Sun,
  Edit2,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

// --- Types ---
export type RosterCategory = "Cast" | "Crew";
export type PersonnelStatus = "Confirmed" | "Tentative" | "On Set";
export type Department =
  | "Direction"
  | "Camera"
  | "Grip"
  | "Sound"
  | "Art"
  | "Talent"
  | "Production"
  | "Costume"
  | "VFX";

export interface PersonnelMember {
  id: string;
  name: string;
  category: RosterCategory;
  role: string;
  characterName?: string;
  department: Department;
  phone: string;
  email: string;
  dayRate: number;
  callTime: string;
  status: PersonnelStatus;
}

// --- Initial Mock Data (32 Personnel summing exactly to $8,450.00/day) ---
const INITIAL_ROSTER: PersonnelMember[] = [
  // Cast (8 Members) - Total $3,150.00
  {
    id: "cast-1",
    name: "Marcus Vance",
    category: "Cast",
    role: "Lead Actor",
    characterName: "Dr. Julian Vance",
    department: "Talent",
    phone: "+1 (555) 012-3491",
    email: "marcus.vance@agency.com",
    dayRate: 650,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "cast-2",
    name: "Elena Rostova",
    category: "Cast",
    role: "Lead Actress",
    characterName: "Commander Anya",
    department: "Talent",
    phone: "+1 (555) 014-9821",
    email: "elena.r@talentgroup.io",
    dayRate: 600,
    callTime: "06:15 AM",
    status: "Confirmed",
  },
  {
    id: "cast-3",
    name: "Devraj Nair",
    category: "Cast",
    role: "Supporting Actor",
    characterName: "Kaelen (AI Core)",
    department: "Talent",
    phone: "+1 (555) 019-3320",
    email: "devraj.nair@actorstudio.com",
    dayRate: 450,
    callTime: "07:00 AM",
    status: "On Set",
  },
  {
    id: "cast-4",
    name: "Sophia Lin",
    category: "Cast",
    role: "Supporting Actress",
    characterName: "Dr. Aris Thorne",
    department: "Talent",
    phone: "+1 (555) 017-8842",
    email: "sophia.lin@reps.com",
    dayRate: 400,
    callTime: "07:30 AM",
    status: "Confirmed",
  },
  {
    id: "cast-5",
    name: "Arthur Pendelton",
    category: "Cast",
    role: "Supporting Actor",
    characterName: "Senator Sterling",
    department: "Talent",
    phone: "+1 (555) 011-5531",
    email: "apendelton@talent.net",
    dayRate: 350,
    callTime: "08:00 AM",
    status: "Tentative",
  },
  {
    id: "cast-6",
    name: "Maya Lin",
    category: "Cast",
    role: "Featured Actor",
    characterName: "Young Anya",
    department: "Talent",
    phone: "+1 (555) 016-7719",
    email: "guardian.mayalin@email.com",
    dayRate: 250,
    callTime: "09:00 AM",
    status: "Confirmed",
  },
  {
    id: "cast-7",
    name: "Kaito Tanaka",
    category: "Cast",
    role: "Stunt Double",
    characterName: "Vance Stunt Double",
    department: "Talent",
    phone: "+1 (555) 018-4490",
    email: "kaito.stunts@actionhouse.com",
    dayRate: 250,
    callTime: "08:30 AM",
    status: "Confirmed",
  },
  {
    id: "cast-8",
    name: "Chloe Bennett",
    category: "Cast",
    role: "Featured Actor",
    characterName: "Tech Analyst #1",
    department: "Talent",
    phone: "+1 (555) 013-2211",
    email: "chloe.bennett@acting.org",
    dayRate: 200,
    callTime: "08:30 AM",
    status: "Tentative",
  },

  // Crew (24 Members) - Total $5,300.00
  {
    id: "crew-1",
    name: "Sarah Jenkins",
    category: "Crew",
    role: "Director",
    department: "Direction",
    phone: "+1 (555) 021-1001",
    email: "s.jenkins@eclatfilms.com",
    dayRate: 450,
    callTime: "05:30 AM",
    status: "On Set",
  },
  {
    id: "crew-2",
    name: "David Miller",
    category: "Crew",
    role: "Director of Photography",
    department: "Camera",
    phone: "+1 (555) 021-1002",
    email: "david.miller@cineops.com",
    dayRate: 420,
    callTime: "05:30 AM",
    status: "On Set",
  },
  {
    id: "crew-3",
    name: "Olivia Wilde",
    category: "Crew",
    role: "Line Producer",
    department: "Production",
    phone: "+1 (555) 021-1003",
    email: "olivia.prods@eclatfilms.com",
    dayRate: 380,
    callTime: "05:30 AM",
    status: "On Set",
  },
  {
    id: "crew-4",
    name: "James Thorne",
    category: "Crew",
    role: "1st Assistant Director",
    department: "Direction",
    phone: "+1 (555) 021-1004",
    email: "james.thorne@setops.com",
    dayRate: 320,
    callTime: "05:30 AM",
    status: "On Set",
  },
  {
    id: "crew-5",
    name: "Carlos Rodriguez",
    category: "Crew",
    role: "Gaffer",
    department: "Grip",
    phone: "+1 (555) 021-1005",
    email: "carlos.light@lightingcrew.com",
    dayRate: 280,
    callTime: "05:45 AM",
    status: "Confirmed",
  },
  {
    id: "crew-6",
    name: "Emily Watson",
    category: "Crew",
    role: "Key Grip",
    department: "Grip",
    phone: "+1 (555) 021-1006",
    email: "emily.watson@gripping.com",
    dayRate: 260,
    callTime: "05:45 AM",
    status: "Confirmed",
  },
  {
    id: "crew-7",
    name: "Alex Rivera",
    category: "Crew",
    role: "Production Designer",
    department: "Art",
    phone: "+1 (555) 021-1007",
    email: "alex.rivera@artdept.com",
    dayRate: 300,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-8",
    name: "Rachel Green",
    category: "Crew",
    role: "Sound Mixer",
    department: "Sound",
    phone: "+1 (555) 021-1008",
    email: "rachel.green@audioworks.com",
    dayRate: 280,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-9",
    name: "Tom Hardy",
    category: "Crew",
    role: "1st AC (Focus Puller)",
    department: "Camera",
    phone: "+1 (555) 021-1009",
    email: "tom.hardy@camcrew.com",
    dayRate: 250,
    callTime: "05:45 AM",
    status: "Confirmed",
  },
  {
    id: "crew-10",
    name: "Lisa Ray",
    category: "Crew",
    role: "2nd AC",
    department: "Camera",
    phone: "+1 (555) 021-1010",
    email: "lisa.ray@camcrew.com",
    dayRate: 180,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-11",
    name: "Brian O'Connor",
    category: "Crew",
    role: "Digital Intermediate Tech (DIT)",
    department: "Camera",
    phone: "+1 (555) 021-1011",
    email: "brian.dit@digitalfilm.com",
    dayRate: 220,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-12",
    name: "Nina Patel",
    category: "Crew",
    role: "Script Supervisor",
    department: "Direction",
    phone: "+1 (555) 021-1012",
    email: "nina.patel@scriptnotes.io",
    dayRate: 220,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-13",
    name: "Robert Chen",
    category: "Crew",
    role: "Boom Operator",
    department: "Sound",
    phone: "+1 (555) 021-1013",
    email: "robert.chen@audioworks.com",
    dayRate: 200,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-14",
    name: "Amanda Palmer",
    category: "Crew",
    role: "Art Director",
    department: "Art",
    phone: "+1 (555) 021-1014",
    email: "amanda.palmer@artdept.com",
    dayRate: 240,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-15",
    name: "Sam Jackson",
    category: "Crew",
    role: "Set Decorator",
    department: "Art",
    phone: "+1 (555) 021-1015",
    email: "sam.jackson@artdept.com",
    dayRate: 200,
    callTime: "06:15 AM",
    status: "Confirmed",
  },
  {
    id: "crew-16",
    name: "Jessica Taylor",
    category: "Crew",
    role: "Key Costumer",
    department: "Costume",
    phone: "+1 (555) 021-1016",
    email: "jessica.t@wardrobe.com",
    dayRate: 220,
    callTime: "06:15 AM",
    status: "Confirmed",
  },
  {
    id: "crew-17",
    name: "Michael Chang",
    category: "Crew",
    role: "Key Makeup Artist",
    department: "Costume",
    phone: "+1 (555) 021-1017",
    email: "m.chang@hmu.com",
    dayRate: 220,
    callTime: "05:45 AM",
    status: "Confirmed",
  },
  {
    id: "crew-18",
    name: "Daniel Kim",
    category: "Crew",
    role: "Lead VFX Supervisor",
    department: "VFX",
    phone: "+1 (555) 021-1018",
    email: "daniel.vfx@eclatfilms.com",
    dayRate: 300,
    callTime: "07:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-19",
    name: "Laura Croft",
    category: "Crew",
    role: "Stunt Coordinator",
    department: "Direction",
    phone: "+1 (555) 021-1019",
    email: "laura.croft@stuntaction.com",
    dayRate: 280,
    callTime: "06:30 AM",
    status: "Tentative",
  },
  {
    id: "crew-20",
    name: "Peter Parker",
    category: "Crew",
    role: "Still Photographer",
    department: "Camera",
    phone: "+1 (555) 021-1020",
    email: "peter.p@stills.com",
    dayRate: 180,
    callTime: "07:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-21",
    name: "Chris Pratt",
    category: "Crew",
    role: "Production Coordinator",
    department: "Production",
    phone: "+1 (555) 021-1021",
    email: "chris.p@productionoffice.com",
    dayRate: 200,
    callTime: "05:30 AM",
    status: "Confirmed",
  },
  {
    id: "crew-22",
    name: "Zoe Saldana",
    category: "Crew",
    role: "Lead Location Manager",
    department: "Production",
    phone: "+1 (555) 021-1022",
    email: "zoe.locations@eclatfilms.com",
    dayRate: 220,
    callTime: "05:30 AM",
    status: "Confirmed",
  },
  {
    id: "crew-23",
    name: "Dave Bautista",
    category: "Crew",
    role: "Best Boy Electric",
    department: "Grip",
    phone: "+1 (555) 021-1023",
    email: "dave.electric@lightingcrew.com",
    dayRate: 200,
    callTime: "06:00 AM",
    status: "Confirmed",
  },
  {
    id: "crew-24",
    name: "Vin Diesel",
    category: "Crew",
    role: "Key Rigging Grip",
    department: "Grip",
    phone: "+1 (555) 021-1024",
    email: "vin.rigging@gripping.com",
    dayRate: 200,
    callTime: "05:45 AM",
    status: "Confirmed",
  },
];

export default function RosterPage() {
  const [roster, setRoster] = useState<PersonnelMember[]>(INITIAL_ROSTER);
  const [activeTab, setActiveTab] = useState<
    "Cast" | "Crew" | "All" | "CallSheet"
  >("Crew");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCallSheetModalOpen, setIsCallSheetModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PersonnelMember | null>(
    null
  );

  // Form State for Add Personnel
  const [formData, setFormData] = useState<{
    name: string;
    category: RosterCategory;
    role: string;
    characterName: string;
    department: Department;
    phone: string;
    email: string;
    dayRate: number | string;
    callTime: string;
    status: PersonnelStatus;
  }>({
    name: "",
    category: "Crew",
    role: "",
    characterName: "",
    department: "Camera",
    phone: "",
    email: "",
    dayRate: "",
    callTime: "06:00 AM",
    status: "Confirmed",
  });

  // --- Dynamic KPI Calculations ---
  const crewCount = useMemo(
    () => roster.filter((m) => m.category === "Crew").length,
    [roster]
  );
  const castCount = useMemo(
    () => roster.filter((m) => m.category === "Cast").length,
    [roster]
  );
  const totalCount = roster.length;

  const totalBurnRate = useMemo(
    () => roster.reduce((sum, m) => sum + m.dayRate, 0),
    [roster]
  );

  const confirmedCount = useMemo(
    () => roster.filter((m) => m.status === "Confirmed" || m.status === "On Set").length,
    [roster]
  );
  const readinessPercent = Math.round(
    totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0
  );

  const activeDepartments = useMemo(() => {
    const depts = new Set(roster.map((m) => m.department));
    return Array.from(depts);
  }, [roster]);

  // --- Filtered Personnel List ---
  const filteredRoster = useMemo(() => {
    return roster.filter((member) => {
      // Category Tab Filter
      if (activeTab === "Cast" && member.category !== "Cast") return false;
      if (activeTab === "Crew" && member.category !== "Crew") return false;

      // Department Filter
      if (departmentFilter !== "All" && member.department !== departmentFilter)
        return false;

      // Status Filter
      if (statusFilter !== "All" && member.status !== statusFilter)
        return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = member.name.toLowerCase().includes(q);
        const matchRole = member.role.toLowerCase().includes(q);
        const matchChar = member.characterName
          ? member.characterName.toLowerCase().includes(q)
          : false;
        const matchDept = member.department.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchChar && !matchDept) return false;
      }

      return true;
    });
  }, [roster, activeTab, departmentFilter, statusFilter, searchQuery]);

  // --- Handlers ---
  const handleOpenAddModal = (memberToEdit?: PersonnelMember) => {
    if (memberToEdit) {
      setEditingMember(memberToEdit);
      setFormData({
        name: memberToEdit.name,
        category: memberToEdit.category,
        role: memberToEdit.role,
        characterName: memberToEdit.characterName || "",
        department: memberToEdit.department,
        phone: memberToEdit.phone,
        email: memberToEdit.email,
        dayRate: memberToEdit.dayRate,
        callTime: memberToEdit.callTime,
        status: memberToEdit.status,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        category: activeTab === "Cast" ? "Cast" : "Crew",
        role: "",
        characterName: "",
        department: activeTab === "Cast" ? "Talent" : "Camera",
        phone: "",
        email: "",
        dayRate: "",
        callTime: "06:00 AM",
        status: "Confirmed",
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    const rate =
      typeof formData.dayRate === "number"
        ? formData.dayRate
        : parseFloat(formData.dayRate) || 0;

    if (editingMember) {
      setRoster((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                name: formData.name,
                category: formData.category,
                role: formData.role,
                characterName: formData.characterName,
                department: formData.department,
                phone: formData.phone || "+1 (555) 000-0000",
                email: formData.email || "staff@eclatfilms.com",
                dayRate: rate,
                callTime: formData.callTime,
                status: formData.status,
              }
            : m
        )
      );
    } else {
      const newMember: PersonnelMember = {
        id: `personnel-${Date.now()}`,
        name: formData.name,
        category: formData.category,
        role: formData.role,
        characterName: formData.characterName,
        department: formData.department,
        phone: formData.phone || "+1 (555) 000-0000",
        email: formData.email || "staff@eclatfilms.com",
        dayRate: rate,
        callTime: formData.callTime,
        status: formData.status,
      };
      setRoster((prev) => [newMember, ...prev]);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to remove this member from the active roster?")) {
      setRoster((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setRoster((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus: PersonnelStatus =
            m.status === "Confirmed"
              ? "On Set"
              : m.status === "On Set"
              ? "Tentative"
              : "Confirmed";
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Category",
      "Role",
      "Character",
      "Department",
      "Phone",
      "Email",
      "Day Rate ($)",
      "Call Time",
      "Status",
    ];
    const rows = roster.map((m) => [
      m.id,
      `"${m.name}"`,
      m.category,
      `"${m.role}"`,
      `"${m.characterName || ""}"`,
      m.department,
      `"${m.phone}"`,
      `"${m.email}"`,
      m.dayRate,
      `"${m.callTime}"`,
      m.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eclat_roster_day12_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Call Sheet Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-700">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-emerald-400" />
              Cast & Crew Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(22,163,74,0.2)]">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
              Live Ledger
            </span>
          </div>
          <p className="text-sm text-emerald-100/70 mt-1">
            Operational command center for call sheet scheduling, daily burn rates, and personnel readiness.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCallSheetModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-studio-800 border border-studio-700 hover:border-emerald-500/50 hover:bg-studio-700 text-slate-200 text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Generate Day Call Sheet</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)] active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Personnel</span>
          </button>
        </div>
      </div>

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Active Personnel */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Total Active Personnel
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-white tracking-tight font-mono">
              {totalCount}
            </p>
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{crewCount} Crew</span>
              <span className="text-slate-500">/</span>
              <span className="text-amber-400 font-semibold">{castCount} Cast</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-studio-950 rounded-full h-1.5 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(crewCount / totalCount) * 100}%` }}
              title={`Crew: ${crewCount}`}
            />
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${(castCount / totalCount) * 100}%` }}
              title={`Cast: ${castCount}`}
            />
          </div>
        </div>

        {/* Card 2: Daily Burn Rate */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Daily Burn Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-emerald-400 tracking-tight font-mono">
              ${totalBurnRate.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] font-mono text-emerald-300/80 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              / day
            </span>
          </div>
          <div className="mt-3 w-full bg-studio-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-full animate-pulse" />
          </div>
        </div>

        {/* Card 3: Call Sheet Readiness Status */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Call Sheet Readiness
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-white tracking-tight font-mono">
              {readinessPercent}%
            </p>
            <span className="text-xs font-mono text-emerald-400">
              {confirmedCount}/{totalCount} Confirmed
            </span>
          </div>
          <div className="mt-3 w-full bg-studio-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>

        {/* Card 4: Departments Covered */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Departments Covered
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-white tracking-tight font-mono">
              {activeDepartments.length}
            </p>
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
              Full Dept Coverage
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {activeDepartments.slice(0, 5).map((d) => (
              <span
                key={d}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-studio-800 text-slate-300 border border-studio-700 shrink-0"
              >
                {d}
              </span>
            ))}
            {activeDepartments.length > 5 && (
              <span className="text-[9px] font-mono text-emerald-400">
                +{activeDepartments.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Operational Workspace View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-studio-900 p-1.5 rounded-xl border border-studio-700">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("Crew")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "Crew"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-[0_0_10px_rgba(22,163,74,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-studio-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Crew Roster</span>
            <span className="px-1.5 py-0.2 rounded-full bg-studio-800 text-slate-300 text-[10px]">
              {crewCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("Cast")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "Cast"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-[0_0_10px_rgba(22,163,74,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-studio-800"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cast Roster</span>
            <span className="px-1.5 py-0.2 rounded-full bg-studio-800 text-slate-300 text-[10px]">
              {castCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("All")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "All"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-[0_0_10px_rgba(22,163,74,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-studio-800"
            }`}
          >
            <span>All Personnel</span>
            <span className="px-1.5 py-0.2 rounded-full bg-studio-800 text-slate-300 text-[10px]">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("CallSheet")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "CallSheet"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-[0_0_10px_rgba(22,163,74,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-studio-800"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Call Sheet Preview</span>
          </button>
        </div>

        {activeTab !== "CallSheet" && (
          <div className="text-xs font-mono text-slate-400 px-3 py-1 flex items-center justify-end gap-2">
            <span>Showing {filteredRoster.length} entries</span>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === "CallSheet" ? (
        /* Call Sheet Quick Preview Component */
        <div className="bg-studio-900 border border-studio-700 rounded-xl p-6 space-y-6 shadow-xl">
          {/* Call Sheet Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-studio-700 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-mono text-xs font-bold">
                  DAY 12 OF 28
                </span>
                <span className="text-xs font-mono text-slate-400">
                  SHOOT DATE: MONDAY, SEPT 14, 2026
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide mt-2">
                ECLAT FEATURE FILM — CALL SHEET #12
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                INT. CYBERNETIC ARCHIVE & EXT. NEON ALLEYWAY
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-lg bg-studio-800 border border-studio-700 text-slate-200 hover:text-white font-mono text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Call Sheet</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-mono text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export CSV Ledger</span>
              </button>
            </div>
          </div>

          {/* Quick Details Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>GENERAL CREW CALL</span>
              </div>
              <p className="text-base font-bold text-emerald-300">06:00 AM</p>
            </div>

            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>PRIMARY LOCATION</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 truncate">
                STAGE 4 — METRO SOUNDSTAGE
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>SUNRISE / SUNSET</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">
                06:22 AM / 07:15 PM
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>NEAREST HOSPITAL</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-200 truncate">
                CEDARS-SINAI (310) 555-0199
              </p>
            </div>
          </div>

          {/* Cast Schedule Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between border-b border-studio-700 pb-2">
              <span>Cast Call Times & Readiness</span>
              <span className="text-xs text-emerald-400">
                {roster.filter((m) => m.category === "Cast" && m.status === "Confirmed").length} / {castCount} Confirmed
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-studio-700 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Character</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Pickup</th>
                    <th className="py-2.5 px-3">H / MU</th>
                    <th className="py-2.5 px-3">Set Call</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-800">
                  {roster
                    .filter((m) => m.category === "Cast")
                    .map((cast, idx) => (
                      <tr key={cast.id} className="hover:bg-studio-800/50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-bold">
                          #{idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-300">
                          {cast.characterName || cast.role}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">{cast.name}</td>
                        <td className="py-2.5 px-3 text-slate-400">05:30 AM</td>
                        <td className="py-2.5 px-3 text-slate-400">05:45 AM</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">
                          {cast.callTime}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] border ${
                              cast.status === "Confirmed"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-700/60"
                                : cast.status === "On Set"
                                ? "bg-blue-950 text-blue-300 border-blue-700/60"
                                : "bg-amber-950 text-amber-300 border-amber-700/60"
                            }`}
                          >
                            {cast.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Headcounts & Daily Rate Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-studio-700">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Crew Department Headcount
              </h3>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {activeDepartments.map((dept) => {
                  const deptCount = roster.filter(
                    (m) => m.department === dept
                  ).length;
                  return (
                    <div
                      key={dept}
                      className="p-2.5 rounded bg-studio-950 border border-studio-700/60 flex items-center justify-between"
                    >
                      <span className="text-slate-300">{dept}</span>
                      <span className="text-emerald-400 font-bold">
                        {deptCount} staff
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Daily Call Sheet Directives
              </h3>
              <div className="p-4 rounded bg-studio-950 border border-studio-700/60 space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2 text-amber-300 font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Rain atmospheric effects scheduled in Scene 15 (Exterior Alley). All electrical equipment requires waterproof covering.
                  </p>
                </div>
                <p className="text-slate-400 text-[11px] pt-2 border-t border-studio-800">
                  Quiet on set protocol strictly enforced during INT. ARCHIVE dialogue sequences. Safety briefing at 06:15 AM sharp.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Personnel Data Table View */
        <div className="space-y-4">
          {/* Data Table Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, or character..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-studio-900 border border-studio-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2 bg-studio-900 border border-studio-700 px-3 py-1.5 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                Dept:
              </span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-studio-900 text-slate-200">
                  All Departments
                </option>
                <option value="Direction" className="bg-studio-900 text-slate-200">
                  Direction
                </option>
                <option value="Camera" className="bg-studio-900 text-slate-200">
                  Camera
                </option>
                <option value="Grip" className="bg-studio-900 text-slate-200">
                  Grip
                </option>
                <option value="Sound" className="bg-studio-900 text-slate-200">
                  Sound
                </option>
                <option value="Art" className="bg-studio-900 text-slate-200">
                  Art
                </option>
                <option value="Talent" className="bg-studio-900 text-slate-200">
                  Talent
                </option>
                <option value="Production" className="bg-studio-900 text-slate-200">
                  Production
                </option>
                <option value="Costume" className="bg-studio-900 text-slate-200">
                  Costume
                </option>
                <option value="VFX" className="bg-studio-900 text-slate-200">
                  VFX
                </option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-studio-900 border border-studio-700 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-studio-900 text-slate-200">
                  All Statuses
                </option>
                <option value="Confirmed" className="bg-studio-900 text-slate-200">
                  Confirmed
                </option>
                <option value="Tentative" className="bg-studio-900 text-slate-200">
                  Tentative
                </option>
                <option value="On Set" className="bg-studio-900 text-slate-200">
                  On Set
                </option>
              </select>
            </div>
          </div>

          {/* Personnel Table Container */}
          <div className="bg-studio-900 border border-studio-700 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-studio-950/80 border-b border-studio-700 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Personnel Name</th>
                    <th className="py-3 px-4">Role / Dept</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4 text-right">Daily Rate ($)</th>
                    <th className="py-3 px-4">Call Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-800/80">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-500 font-mono text-xs"
                      >
                        No personnel matching your criteria. Try resetting filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-studio-800/40 transition-colors group"
                      >
                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                                member.category === "Cast"
                                  ? "bg-amber-950 text-amber-300 border-amber-700/50"
                                  : "bg-emerald-950 text-emerald-300 border-emerald-700/50"
                              }`}
                            >
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100 text-sm">
                                  {member.name}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold rounded ${
                                    member.category === "Cast"
                                      ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                                      : "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                                  }`}
                                >
                                  {member.category}
                                </span>
                              </div>
                              {member.characterName && (
                                <p className="text-[11px] font-mono text-emerald-300/80">
                                  As: {member.characterName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role & Department */}
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-slate-200">
                              {member.role}
                            </p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-studio-950 text-slate-400 border border-studio-700 font-mono text-[10px]">
                              {member.department}
                            </span>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="py-3 px-4 font-mono text-[11px] space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <a
                              href={`tel:${member.phone}`}
                              className="hover:text-emerald-400 transition-colors"
                            >
                              {member.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            <a
                              href={`mailto:${member.email}`}
                              className="hover:text-emerald-400 transition-colors truncate max-w-[150px]"
                            >
                              {member.email}
                            </a>
                          </div>
                        </td>

                        {/* Daily Rate ($) */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-sm text-emerald-300">
                          ${member.dayRate.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Call Time */}
                        <td className="py-3 px-4 font-mono">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-studio-950 border border-studio-700 text-slate-200 text-xs">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>{member.callTime}</span>
                          </div>
                        </td>

                        {/* Status Badge & Cycle Trigger */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(member.id)}
                            title="Click to cycle status: Confirmed -> On Set -> Tentative"
                            className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                              member.status === "Confirmed"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:border-emerald-500"
                                : member.status === "On Set"
                                ? "bg-blue-950/80 text-blue-300 border-blue-700/60 hover:border-blue-500"
                                : "bg-amber-950/80 text-amber-300 border-amber-700/60 hover:border-amber-500"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                member.status === "Confirmed"
                                  ? "bg-emerald-400"
                                  : member.status === "On Set"
                                  ? "bg-blue-400 animate-ping"
                                  : "bg-amber-400"
                              }`}
                            />
                            <span>{member.status}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenAddModal(member)}
                              title="Edit personnel"
                              className="p-1.5 rounded hover:bg-studio-800 text-slate-400 hover:text-emerald-300 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              title="Delete from roster"
                              className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT PERSONNEL SLIDE-OVER / MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-studio-950 border-b border-studio-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingMember ? "Edit Roster Member" : "Add Personnel to Roster"}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Real-time daily burn rate recalculation applied automatically.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-studio-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSavePersonnel}
              className="p-6 overflow-y-auto space-y-4 font-sans text-xs flex-1"
            >
              {/* Category Selector */}
              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1.5">
                  Roster Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: "Crew",
                        department:
                          prev.department === "Talent" ? "Camera" : prev.department,
                      }))
                    }
                    className={`py-2 px-4 rounded-lg font-mono font-semibold border transition-all flex items-center justify-center gap-2 ${
                      formData.category === "Crew"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                        : "bg-studio-950 text-slate-400 border-studio-700 hover:bg-studio-800"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Crew Member</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: "Cast",
                        department: "Talent",
                      }))
                    }
                    className={`py-2 px-4 rounded-lg font-mono font-semibold border transition-all flex items-center justify-center gap-2 ${
                      formData.category === "Cast"
                        ? "bg-amber-950 text-amber-300 border-amber-700"
                        : "bg-studio-950 text-slate-400 border-studio-700 hover:bg-studio-800"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Cast / Talent</span>
                  </button>
                </div>
              </div>

              {/* Member Name */}
              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Role & Character Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Role / Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    placeholder={
                      formData.category === "Cast"
                        ? "e.g. Lead Actor"
                        : "e.g. 1st Assistant Director"
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {formData.category === "Cast" && (
                  <div>
                    <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                      Character Name
                    </label>
                    <input
                      type="text"
                      value={formData.characterName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          characterName: e.target.value,
                        }))
                      }
                      placeholder="e.g. Dr. Julian Vance"
                      className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value as Department,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Direction">Direction</option>
                    <option value="Camera">Camera</option>
                    <option value="Grip">Grip</option>
                    <option value="Sound">Sound</option>
                    <option value="Art">Art</option>
                    <option value="Talent">Talent</option>
                    <option value="Production">Production</option>
                    <option value="Costume">Costume</option>
                    <option value="VFX">VFX</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Day Rate & Call Time & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Day Rate ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10"
                    value={formData.dayRate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dayRate: e.target.value,
                      }))
                    }
                    placeholder="450"
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Call Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.callTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        callTime: e.target.value,
                      }))
                    }
                    placeholder="06:00 AM"
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as PersonnelStatus,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Tentative">Tentative</option>
                    <option value="On Set">On Set</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-studio-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-400 hover:text-white font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingMember ? "Update Member" : "Save & Recalculate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- GENERATE DAY CALL SHEET MODAL --- */}
      {isCallSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-studio-950 border-b border-studio-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Generate Production Day Call Sheet
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Ready for distribution & print sign-off.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCallSheetModalOpen(false)}
                className="p-1 rounded-lg hover:bg-studio-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-studio-950 border border-studio-700 space-y-3">
                <div className="flex items-center justify-between border-b border-studio-800 pb-2">
                  <span className="text-slate-400 uppercase">Call Sheet Summary</span>
                  <span className="text-emerald-400 font-bold">READY TO PRINT</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-[10px]">TOTAL PERSONNEL ON CALL</p>
                    <p className="text-lg font-bold text-white">{totalCount} Members</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">DAILY BURN RATE</p>
                    <p className="text-lg font-bold text-emerald-400">
                      ${totalBurnRate.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-300 text-[11px] uppercase tracking-wider">
                  Call Sheet Distribution Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-studio-950 border border-studio-700 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-emerald-500 rounded"
                    />
                    <span>Include Department Head Call Times & Contact Info</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-studio-950 border border-studio-700 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-emerald-500 rounded"
                    />
                    <span>Include Safety & Weather Warnings (Scene 15 Rain Effects)</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-lg bg-studio-950 border border-studio-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-emerald-500 rounded"
                    />
                    <span>Attach Financial Rates Ledger (Restricted Access)</span>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{readinessPercent}% Confirmed Signatures Logged</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold">
                  {confirmedCount}/{totalCount} OK
                </span>
              </div>
            </div>

            <div className="p-5 bg-studio-950 border-t border-studio-700 flex justify-end gap-3">
              <button
                onClick={() => setIsCallSheetModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-studio-900 border border-studio-700 text-slate-400 hover:text-white font-mono text-xs"
              >
                Close
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-lg bg-studio-800 border border-studio-700 text-emerald-300 hover:text-white font-mono text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Call Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
