// Locations Mock Data සැබෑ Film Location ඡායාරූප සමඟ:
const initialLocations = [
  {
    id: "loc-01",
    name: "Metro Soundstage 4 — Cyber Archive",
    sceneTag: "SCENE 01 / INT. CYBERNETIC ARCHIVE",
    address: "Cinematix City Studios 02, Colombo",
    category: "Soundstage",
    status: "Cleared",
    // Industrial Hi-Tech Studio / Soundstage Interior
    imageUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80",
    powerGrid: "3-Phase 400A Grid",
    rigging: "Full Controlled Rig (Dimmer)",
    dailyFee: "$5,500"
  },
  {
    id: "loc-02",
    name: "Lotus Tower Neon Alleyway",
    sceneTag: "SCENE 02 / EXT. NEON MARKETPLACE",
    address: "D.R. Wijewardena Mawatha, Colombo 10",
    category: "Exterior Street",
    status: "Cleared",
    // Moody Rainy Urban Neon Night Street
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    powerGrid: "Mobile 60kVA Generator",
    rigging: "Ambient Practical Neon (Wet Surface)",
    dailyFee: "$4,250"
  },
  {
    id: "loc-03",
    name: "Old Port Docklands Sub-Level",
    sceneTag: "SCENE 03 / EXT. WATERFRONT DOCKS",
    address: "Port Access Road, Northern Gate 3",
    category: "Industrial Docks",
    status: "Under Review",
    // Dramatic Industrial Harbor / Shipping Dock Cranes at Dusk
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    powerGrid: "On-site Auxiliary Tie-In",
    rigging: "Sodium High-Pressure / Flood Rig",
    dailyFee: "$4,500"
  }
];