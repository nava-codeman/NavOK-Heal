"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Stethoscope, Star, Clock, Calendar as CalendarIcon, MapPin } from "lucide-react";
import Image from "next/image";

const mockDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    experience: "15 years",
    rating: 4.9,
    reviews: 124,
    availability: "Available Today",
    location: "Downtown Medical Center",
    image: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Dermatology",
    experience: "8 years",
    rating: 4.7,
    reviews: 89,
    availability: "Next Available: Tomorrow",
    location: "Westside Skin Clinic",
    image: "https://i.pravatar.cc/150?u=michael"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    experience: "12 years",
    rating: 4.8,
    reviews: 215,
    availability: "Available Today",
    location: "Children's Health Pavilion",
    image: "https://i.pravatar.cc/150?u=emily"
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Neurology",
    experience: "20 years",
    rating: 4.9,
    reviews: 342,
    availability: "Next Available: Thu, 24th",
    location: "Advanced Neuro Institute",
    image: "https://i.pravatar.cc/150?u=james"
  }
];

const specialties = ["All", "Cardiology", "Dermatology", "Pediatrics", "Neurology", "General Practice"];

export default function DoctorsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  const filteredDoctors = mockDoctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All" || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans text-[#14332F] overflow-hidden relative">
      {/* Background abstract elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 md:px-8 py-5 border-b border-white/5 bg-black/20 backdrop-blur-md relative z-20 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard/patient")}
              className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-zinc-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Find a Doctor</h1>
              <p className="text-sm text-zinc-400 mt-1">Book an appointment with top-rated medical specialists.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 relative z-10 flex flex-col">
        
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative glass rounded-2xl border border-white/10 shadow-xl overflow-hidden flex-1 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-orange-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 text-white placeholder-zinc-500 text-[15px]"
              placeholder="Search by doctor name or clinic location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0 md:max-w-md lg:max-w-lg xl:max-w-none">
            {specialties.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                  selectedSpecialty === spec 
                    ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]" 
                    : "glass border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 pb-20">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="glass rounded-3xl p-6 border border-white/10 hover:border-orange-500/30 transition-all group flex flex-col sm:flex-row gap-6 bg-black/20">
              
              <div className="shrink-0 relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 transition-colors relative z-10 bg-zinc-800">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 glass px-2 py-0.5 rounded-lg flex items-center gap-1 z-20 border border-white/20 shadow-xl bg-black/60">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-white">{doc.rating}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{doc.name}</h2>
                  </div>
                  <p className="text-sm text-orange-400 font-medium mb-3">{doc.specialty}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Stethoscope className="w-4 h-4 text-zinc-500" /> {doc.experience} Experience
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <MapPin className="w-4 h-4 text-zinc-500" /> {doc.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <Clock className="w-4 h-4 text-emerald-500" /> {doc.availability}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 sm:mt-0 pt-4 border-t border-white/5">
                  <button className="flex-1 py-2.5 glass rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors border border-white/10">
                    View Profile
                  </button>
                  <button className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg">
                    Book Visit
                  </button>
                </div>
              </div>

            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-20 flex flex-col items-center justify-center text-center">
              <Stethoscope className="w-16 h-16 text-zinc-700 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-300">No doctors found</h3>
              <p className="text-zinc-500 mt-2">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
