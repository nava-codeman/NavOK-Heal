"use client";

import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";
import { UserCircle, Calendar, Scale, Activity, ShieldAlert, Check, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
  uid: string;
  onComplete: () => void;
}

export default function OnboardingModal({ uid, onComplete }: OnboardingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dob: "",
    age: "",
    weight: "",
    hasDisability: "no",
    disabilityDetails: "",
    birthMarks: "",
    bloodGroup: "",
    countryCode: "",
  });
  const [locationStatus, setLocationStatus] = useState<"loading" | "detected" | "manual">("loading");

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            if (data.countryCode) {
              setFormData(prev => ({ ...prev, countryCode: data.countryCode }));
              setLocationStatus("detected");
            } else {
              setLocationStatus("manual");
            }
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            setLocationStatus("manual");
          }
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
          setLocationStatus("manual");
        },
        { timeout: 10000 }
      );
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationStatus("manual");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    setFormData(prev => ({
      ...prev,
      dob,
      age: calculateAge(dob)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dob || !formData.age || !formData.weight) {
      toast.error("Please fill in the required fields.");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        "medicalProfile.dob": formData.dob,
        "medicalProfile.age": parseInt(formData.age),
        "medicalProfile.weight": parseFloat(formData.weight),
        "medicalProfile.hasDisability": formData.hasDisability === "yes",
        "medicalProfile.disabilityDetails": formData.hasDisability === "yes" ? formData.disabilityDetails : "",
        "medicalProfile.birthMarks": formData.birthMarks,
        "medicalProfile.bloodGroup": formData.bloodGroup,
        "medicalProfile.countryCode": formData.countryCode,
        "medicalProfile.onboardingComplete": true,
      });
      
      toast.success("Medical profile updated successfully!");
      onComplete();
    } catch (error) {
      console.error("Error updating medical profile:", error);
      toast.error("Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-2xl bg-[#121214] border border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-zinc-800/60 bg-gradient-to-b from-indigo-500/10 to-transparent shrink-0">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <UserCircle className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Complete Your Profile</h2>
                <p className="text-sm text-zinc-400">Please provide your basic medical records to continue.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8 overflow-y-auto">
            <form id="onboarding-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DOB */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" /> Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-zinc-500" /> Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    placeholder="e.g. 25"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-zinc-500" /> Weight (kg) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    placeholder="e.g. 65"
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-zinc-500" /> Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* Country Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-500" /> Country *
                  </label>
                  {locationStatus === "loading" ? (
                    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-400 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      Detecting location...
                    </div>
                  ) : locationStatus === "detected" ? (
                    <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-emerald-400 flex items-center gap-2">
                      <Check className="h-4 w-4" /> Detected: {formData.countryCode}
                      <button 
                        type="button" 
                        onClick={() => setLocationStatus("manual")}
                        className="ml-auto text-xs text-emerald-500 hover:text-emerald-300 underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <select
                      name="countryCode"
                      required
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none"
                    >
                      <option value="">Select Country</option>
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="NZ">New Zealand</option>
                      <option value="ZA">South Africa</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="SG">Singapore</option>
                      <option value="MY">Malaysia</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Disabilities */}
              <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-zinc-500" /> Do you have any disabilities?
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="hasDisability" 
                        value="no" 
                        checked={formData.hasDisability === "no"}
                        onChange={handleChange}
                        className="text-indigo-500 bg-zinc-900 border-zinc-700 focus:ring-indigo-500/50 accent-indigo-500"
                      />
                      <span className="text-sm text-zinc-400">No</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="hasDisability" 
                        value="yes" 
                        checked={formData.hasDisability === "yes"}
                        onChange={handleChange}
                        className="text-indigo-500 bg-zinc-900 border-zinc-700 focus:ring-indigo-500/50 accent-indigo-500"
                      />
                      <span className="text-sm text-zinc-400">Yes</span>
                    </label>
                  </div>
                </div>

                {formData.hasDisability === "yes" && (
                  <div className="pt-2">
                    <label className="text-xs font-medium text-zinc-500 mb-1 block">Please describe your disability</label>
                    <textarea
                      name="disabilityDetails"
                      value={formData.disabilityDetails}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
                      placeholder="Enter details..."
                    />
                  </div>
                )}
              </div>

              {/* Birth Marks */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Visible Birth Marks / Identification Marks</label>
                <textarea
                  name="birthMarks"
                  value={formData.birthMarks}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
                  placeholder="E.g. A mole on the left cheek..."
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800/60 bg-zinc-900/20 shrink-0 flex justify-end">
            <button
              form="onboarding-form"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Save & Continue
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
