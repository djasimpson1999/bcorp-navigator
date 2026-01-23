"use client";

import { useState, useEffect } from "react";

type Criteria = {
  code: string;
  text: string;
  guidance: string;
};

type SubRequirement = {
  code: string;
  title: string;
  criteria: Criteria[];
};

type Requirement = {
  code: string;
  title: string;
  subRequirements: SubRequirement[];
};

type ImpactTopic = {
  code: string;
  name: string;
  requirements: Requirement[];
};

type RequirementsData = {
  size: string;
  industry: string;
  totalCriteria: number;
  impactTopics: ImpactTopic[];
};

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [step, setStep] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState<"new" | "experienced" | null>(null);
  const [formData, setFormData] = useState({
    employees: "",
    revenue: "",
  });
  
  // Industry questionnaire state
  const [q1PhysicalProducts, setQ1PhysicalProducts] = useState<boolean | null>(null);
  const [q2PhysicalLocations, setQ2PhysicalLocations] = useState<boolean | null>(null);
  const [q3Manufactures, setQ3Manufactures] = useState<boolean | null>(null);
  const [q4Agriculture, setQ4Agriculture] = useState<boolean | null>(null);
  const [determinedIndustry, setDeterminedIndustry] = useState<string | null>(null);

  const [requirements, setRequirements] = useState<RequirementsData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ImpactTopic | null>(null);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [selectedSubReq, setSelectedSubReq] = useState<SubRequirement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Determine industry based on answers
  useEffect(() => {
    if (q4Agriculture === true) {
      setDeterminedIndustry("agriculture");
      return;
    }

    if (q1PhysicalProducts === false && q2PhysicalLocations === false) {
      setDeterminedIndustry("services-minor");
      return;
    }

    if (q1PhysicalProducts === false && q2PhysicalLocations === true) {
      setDeterminedIndustry("services-significant");
      return;
    }

    if (q1PhysicalProducts === true && q2PhysicalLocations === false) {
      if (q3Manufactures === true && q4Agriculture === false) {
        setDeterminedIndustry("manufacturing");
        return;
      }
      if (q3Manufactures === false && q4Agriculture === false) {
        setDeterminedIndustry("wholesale-retail");
        return;
      }
    }

    if (q1PhysicalProducts === true && q2PhysicalLocations === true) {
      if (q3Manufactures === true && q4Agriculture === false) {
        setDeterminedIndustry("manufacturing");
        return;
      }
      if (q3Manufactures === false && q4Agriculture === false) {
        setDeterminedIndustry("wholesale-retail");
        return;
      }
    }

    setDeterminedIndustry(null);
  }, [q1PhysicalProducts, q2PhysicalLocations, q3Manufactures, q4Agriculture]);

  const showQ3Q4 = q1PhysicalProducts === true && q2PhysicalLocations !== null;

  const getSizeTrack = () => {
    const sizeOrder = ["no-workers", "micro", "small", "medium", "large", "xlarge", "xxlarge"];
    const employeeMap: Record<string, string> = {
      "0": "no-workers",
      "1-9": "micro",
      "10-49": "small",
      "50-249": "medium",
      "250-999": "large",
      "1000-9999": "xlarge",
      "10000+": "xxlarge",
    };
    const revenueMap: Record<string, string> = {
      "under-2m": "micro",
      "2m-10m": "small",
      "10m-75m": "medium",
      "75m-350m": "large",
      "350m-1.5b": "xlarge",
      "over-1.5b": "xxlarge",
    };
    const employeeSize = employeeMap[formData.employees] || "micro";
    const revenueSize = revenueMap[formData.revenue] || "micro";
    return sizeOrder.indexOf(employeeSize) <= sizeOrder.indexOf(revenueSize)
      ? employeeSize
      : revenueSize;
  };

  const canSubmit = determinedIndustry && formData.employees && formData.revenue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      setStep(2);
    }
  };

  useEffect(() => {
    if (step === 2) {
      const size = getSizeTrack();
      const industry = determinedIndustry;
      const filename = `${size}_${industry}.json`;
      fetch(`/data/${filename}`)
        .then((res) => res.json())
        .then((data) => {
          setRequirements(data);
          setTimeout(() => setStep(3), 2500);
        })
        .catch((err) => {
          console.error("Failed to load requirements:", err);
        });
    }
  }, [step]);

  const handleSelectTopic = (topic: ImpactTopic) => {
    setSelectedTopic(topic);
    setSelectedReq(null);
    setSelectedSubReq(null);
  };

  const handleSelectReq = (req: Requirement) => {
    setSelectedReq(req);
    setSelectedSubReq(null);
  };

  const handleSelectSubReq = (subReq: SubRequirement) => {
    setSelectedSubReq(subReq);
  };

  const countTopicCriteria = (topic: ImpactTopic) => {
    let count = 0;
    for (const req of topic.requirements) {
      for (const subReq of req.subRequirements) {
        count += subReq.criteria.length;
      }
    }
    return count;
  };

  const countReqCriteria = (req: Requirement) => {
    let count = 0;
    for (const subReq of req.subRequirements) {
      count += subReq.criteria.length;
    }
    return count;
  };

  const getIndustryDisplayName = (key: string) => {
    const names: Record<string, string> = {
      "services-minor": "Service with Minor Footprint",
      "services-significant": "Service with Significant Footprint",
      "manufacturing": "Manufacturing",
      "wholesale-retail": "Wholesale/Retail",
      "agriculture": "Agriculture/Growers",
    };
    return names[key] || key;
  };

  const getSizeDisplayName = (key: string) => {
    const names: Record<string, string> = {
      "no-workers": "No Workers",
      "micro": "Micro",
      "small": "Small",
      "medium": "Medium",
      "large": "Large",
      "xlarge": "X-Large",
      "xxlarge": "XX-Large",
    };
    return names[key] || key;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white">
           
            {/* Experience Level Step */}
      {step === 0 && (
        <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-all duration-400 ${isTransitioning ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"}`}>
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">B Corp Compliance Navigator</h1>
              <p className="text-teal-300/70">Find out exactly which requirements apply to your business.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-lg font-semibold text-teal-200 mb-6 text-center">
                How familiar are you with B Corp and the B Impact Assessment?
              </h2>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setExperienceLevel("new");
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setStep(1);
                      setIsTransitioning(false);
                    }, 400);
                  }}
                  className="flex-1 py-4 px-6 rounded-xl border bg-white/5 border-white/10 text-white/90 hover:bg-teal-500/20 hover:border-teal-400/50 hover:text-teal-200 transition-all duration-200"
                >
                  <span className="block font-medium mb-1">I am new to B Corp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExperienceLevel("experienced");
                     setIsTransitioning(true);
                    setTimeout(() => {
                      setStep(1);
                      setIsTransitioning(false);
                    }, 400);
                   }}
                  className="flex-1 py-4 px-6 rounded-xl border bg-white/5 border-white/10 text-white/90 hover:bg-teal-500/20 hover:border-teal-400/50 hover:text-teal-200 transition-all duration-200"
                >
                  <span className="block font-medium mb-1">I've engaged with B Corp before</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Step */}
      {step === 1 && (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-slideUp">
          <div className="w-full max-w-5xl">

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Industry Category Box */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="text-lg font-semibold text-teal-200 mb-1">Industry Category</h2>
                <p className="text-sm text-white/60 mb-6">B Lab places companies into one of the five industry categories they have defined to ensure that the assessment is appropriate for the nature of your business.<br></br><br></br>The questions below will determine which industry category applies to your business.</p>

                <div className="space-y-5">
                  {/* Question 1 */}
                  <div className="space-y-3">
                    <p className="text-sm text-white/90">
                      Does your company earn 10% or more of revenue from the sale of physical products?
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setQ1PhysicalProducts(true);
                        }}
                        className={`flex-1 py-2 px-4 rounded-xl border transition-all duration-200 ${
                          q1PhysicalProducts === true
                            ? "bg-teal-500/20 border-teal-400/50 text-teal-200"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQ1PhysicalProducts(false);
                          setQ3Manufactures(null);
                          setQ4Agriculture(null);
                        }}
                        className={`flex-1 py-2 px-4 rounded-xl border transition-all duration-200 ${
                          q1PhysicalProducts === false
                            ? "bg-teal-500/20 border-teal-400/50 text-teal-200"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Question 2 */}
                  {q1PhysicalProducts !== null && (
                    <div className="space-y-3 animate-fadeIn">
                      <p className="text-sm text-white/90">
                        Does your company own or operate physical locations or industrial equipment (not including an office)?
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setQ2PhysicalLocations(true)}
                          className={`flex-1 py-2 px-4 rounded-xl border transition-all duration-200 ${
                            q2PhysicalLocations === true
                              ? "bg-teal-500/20 border-teal-400/50 text-teal-200"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setQ2PhysicalLocations(false)}
                          className={`flex-1 py-2 px-4 rounded-xl border transition-all duration-200 ${
                            q2PhysicalLocations === false
                              ? "bg-teal-500/20 border-teal-400/50 text-teal-200"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question 3 */}
                  {showQ3Q4 && (
                    <div className="space-y-3 animate-fadeIn">
                      <p className="text-sm text-white/90">
                        Does the company directly manufacture its own products?
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setQ3Manufactures(true)}
                          className={`flex-1 py-2 px-4 rounded-xl border transition-all duration-200 ${
                            q3Manufactures === true
                              ? "bg-teal-500/20 border-teal-400/50 text-teal-200"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setQ3Manufactures(false)}
                          className={`flex-1 py-2 px-4 rounded-xl border transition-all duration-200 ${
                            q3Manufactures === false
                              ? "bg-teal-500/20 border-teal-400/50 text-teal-200"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question 4 */}
                  {showQ3Q4 && q3Manufactures !== null && (
                    <div className="space-y-3 animate-fadeIn">
                      <p className="text-sm text-white/90">
                        Does a majority of the company&apos;s revenue come from agricultural products?
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setQ4Agriculture(true)}
                          className={`flex-1 py-2 px-4 rounded-xl border transition-all duration-200 ${
                            q4Agriculture === true
                              ? "bg-teal-500/20 border-teal-400/50 text-teal-200"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setQ4Agriculture(false)}
                          className={`flex-1 py-2 px-4 rounded-xl border transition-all duration-200 ${
                            q4Agriculture === false
                              ? "bg-teal-500/20 border-teal-400/50 text-teal-200"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Size Box */}
              <div className={`flex gap-6 transition-all duration-500 ${determinedIndustry ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <h2 className="text-lg font-semibold text-teal-200 mb-1">Size</h2>
                  <p className="text-sm text-white/60 mb-6">Your size track is determined by the lower of your employee count or revenue band.</p>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="employees" className="block text-sm font-medium text-teal-200 mb-2">
                        Number of employees (Full Time Equivalent)
                      </label>
                      <select
                        id="employees"
                        name="employees"
                        value={formData.employees}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all"
                        required
                      >
                        <option value="" className="bg-slate-800">Select...</option>
                        <option value="0" className="bg-slate-800">0 (No workers)</option>
                        <option value="1-9" className="bg-slate-800">1-9</option>
                        <option value="10-49" className="bg-slate-800">10-49</option>
                        <option value="50-249" className="bg-slate-800">50-249</option>
                        <option value="250-999" className="bg-slate-800">250-999</option>
                        <option value="1000-9999" className="bg-slate-800">1,000-9,999</option>
                        <option value="10000+" className="bg-slate-800">10,000+</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="revenue" className="block text-sm font-medium text-teal-200 mb-2">
                        Annual revenue (USD)
                      </label>
                      <select
                        id="revenue"
                        name="revenue"
                        value={formData.revenue}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all"
                        required
                      >
                        <option value="" className="bg-slate-800">Select...</option>
                        <option value="under-2m" className="bg-slate-800">Under $2m</option>
                        <option value="2m-10m" className="bg-slate-800">$2m - $10m</option>
                        <option value="10m-75m" className="bg-slate-800">$10m - $75m</option>
                        <option value="75m-350m" className="bg-slate-800">$75m - $350m</option>
                        <option value="350m-1.5b" className="bg-slate-800">$350m - $1.5b</option>
                        <option value="over-1.5b" className="bg-slate-800">Over $1.5b</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* FTE Explanation Box */}
                <div className="w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-teal-200 mb-3">Calculating Full Time Equivalent (FTE)</h3>
                  <p className="text-xs text-white/60 mb-4">
                    B Lab uses a simplified system for calculating the FTE size of your workforce. This will <u>not</u> match your own precise FTE calculations.
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-teal-300/70 font-medium"></th>
                        <th colSpan={2} className="text-center py-2 text-teal-300/70 font-medium">
                          Works more than 6 months of the year?
                        </th>
                      </tr>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2"></th>
                        <th className="text-center py-2 text-teal-300/70 font-medium">Yes</th>
                        <th className="text-center py-2 text-teal-300/70 font-medium">No</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/80">
                      <tr className="border-b border-white/5">
                        <td className="py-2 pr-3">Works at least 35 hrs/week</td>
                        <td className="text-center">1 FTE</td>
                        <td className="text-center">0.5 FTE</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 pr-3">Works 20-35 hrs/week</td>
                        <td className="text-center">0.5 FTE</td>
                        <td className="text-center">0.25 FTE</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3">Works less than 20 hrs/week</td>
                        <td className="text-center">0.25 FTE</td>
                        <td className="text-center">0 FTE</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  canSubmit
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                See my requirements
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Loading Step */}
      {step === 2 && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="text-center py-8">
              <div className="inline-block w-14 h-14 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mb-6"></div>
              <p className="text-white font-medium mb-2">Analysing your requirements...</p>
              <p className="text-teal-300/50 text-sm">Cross-referencing B Corp v2.1 standards</p>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {step === 3 && requirements && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Your Requirements</h1>
                <p className="text-teal-300/70 text-sm">
                  {getIndustryDisplayName(determinedIndustry || "")} · {getSizeDisplayName(getSizeTrack())} · {requirements.totalCriteria} compliance criteria across {requirements.impactTopics.length} impact topics
                </p>
              </div>
              <button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2 rounded-lg font-medium hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 text-sm">
                Book consultation
              </button>
            </div>
          </header>

          {/* Column Navigation */}
          <div className="flex-1 flex overflow-hidden">
            {/* Column 1: Impact Topics */}
            <div className="w-72 flex-shrink-0 border-r border-white/10 overflow-y-auto bg-black/10">
              <div className="p-3">
                <h2 className="text-xs font-semibold text-teal-300/50 uppercase tracking-wider px-3 py-2">
                  Impact Topics
                </h2>
                <div className="space-y-1">
                  {requirements.impactTopics.map((topic) => (
                    <button
                      key={topic.code}
                      onClick={() => handleSelectTopic(topic)}
                      className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 ${
                        selectedTopic?.code === topic.code
                          ? "bg-teal-500/20 border border-teal-400/30"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{topic.name}</span>
                        <span className="text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full">
                          {countTopicCriteria(topic)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Requirements */}
            <div
              className={`w-80 flex-shrink-0 border-r border-white/10 overflow-y-auto bg-black/5 transition-all duration-300 ease-out ${
                selectedTopic ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0 pointer-events-none"
              }`}
            >
              {selectedTopic && (
                <div className="p-3">
                  <h2 className="text-xs font-semibold text-teal-300/50 uppercase tracking-wider px-3 py-2">
                    Requirements
                  </h2>
                  <div className="space-y-1">
                    {selectedTopic.requirements.map((req) => (
                      <button
                        key={req.code}
                        onClick={() => handleSelectReq(req)}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 ${
                          selectedReq?.code === req.code
                            ? "bg-teal-500/20 border border-teal-400/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs text-teal-400 font-mono">{req.code}</span>
                            <p className="text-sm mt-1 leading-snug">{req.title}</p>
                          </div>
                          <span className="text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full flex-shrink-0">
                            {countReqCriteria(req)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Sub-requirements */}
            <div
              className={`w-80 flex-shrink-0 border-r border-white/10 overflow-y-auto transition-all duration-300 ease-out ${
                selectedReq ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0 pointer-events-none"
              }`}
            >
              {selectedReq && (
                <div className="p-3">
                  <h2 className="text-xs font-semibold text-teal-300/50 uppercase tracking-wider px-3 py-2">
                    Sub-requirements
                  </h2>
                  <div className="space-y-1">
                    {selectedReq.subRequirements.map((subReq) => (
                      <button
                        key={subReq.code}
                        onClick={() => handleSelectSubReq(subReq)}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 ${
                          selectedSubReq?.code === subReq.code
                            ? "bg-teal-500/20 border border-teal-400/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs text-teal-400 font-mono">{subReq.code}</span>
                            <p className="text-sm mt-1 leading-snug">{subReq.title}</p>
                          </div>
                          <span className="text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full flex-shrink-0">
                            {subReq.criteria.length}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Column 4: Criteria */}
            <div
              className={`flex-1 overflow-y-auto transition-all duration-300 ease-out ${
                selectedSubReq ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0 pointer-events-none"
              }`}
            >
              {selectedSubReq && (
                <div className="p-4">
                  <h2 className="text-xs font-semibold text-teal-300/50 uppercase tracking-wider px-2 py-2">
                    Compliance Criteria
                  </h2>
                  <div className="space-y-3">
                    {selectedSubReq.criteria.map((criterion, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-teal-400 font-mono bg-teal-400/10 px-2 py-1 rounded flex-shrink-0">
                            {criterion.code}
                          </span>
                          <p className="text-sm leading-relaxed text-white/90 whitespace-pre-line">{criterion.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedSubReq && selectedReq && (
                <div className="h-full flex items-center justify-center text-white/30">
                  <p>Select a sub-requirement to view criteria</p>
                </div>
              )}

              {!selectedReq && selectedTopic && (
                <div className="h-full flex items-center justify-center text-white/30">
                  <p>Select a requirement to continue</p>
                </div>
              )}

              {!selectedTopic && (
                <div className="h-full flex items-center justify-center text-white/30">
                  <p>Select an impact topic to explore requirements</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}