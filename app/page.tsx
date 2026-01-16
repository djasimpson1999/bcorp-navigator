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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    employees: "",
    revenue: "",
    industry: "",
  });
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

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

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

  useEffect(() => {
    if (step === 3) {
      const size = getSizeTrack();
      const industry = formData.industry;
      const filename = `${size}_${industry}.json`;
      fetch(`/data/${filename}`)
        .then((res) => res.json())
        .then((data) => {
          setRequirements(data);
          setTimeout(() => setStep(4), 2500);
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white">
      {/* Form Steps */}
      {step < 4 && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">B Corp Compliance Navigator</h1>
              <p className="text-teal-300/70">Find out exactly which requirements apply to your business.</p>
            </div>

            <div className="flex gap-6 items-start justify-center">
              {/* Main Form Card */}
              <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                {step === 1 && (
                  <form onSubmit={nextStep} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-teal-200 mb-2">
                        Your name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all"
                        placeholder="John Smith"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-teal-200 mb-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all"
                        placeholder="john@company.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-teal-200 mb-2">
                        Company name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all"
                        placeholder="Acme Ltd"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 mt-4"
                    >
                      Continue
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={nextStep} className="space-y-5">
                    <div>
                      <label htmlFor="employees" className="block text-sm font-medium text-teal-200 mb-2">
                        Number of employees (FTE)
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

                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-teal-200 mb-2">
                        Industry
                      </label>
                      <select
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all"
                        required
                      >
                        <option value="" className="bg-slate-800">Select...</option>
                        <option value="manufacturing" className="bg-slate-800">Manufacturing</option>
                        <option value="wholesale-retail" className="bg-slate-800">Wholesale / Retail</option>
                        <option value="services-minor" className="bg-slate-800">Services (Minor Footprint)</option>
                        <option value="services-significant" className="bg-slate-800">Services (Significant Footprint)</option>
                        <option value="agriculture" className="bg-slate-800">Agriculture / Growers</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-teal-400 hover:to-cyan-400 transition-all duration-300 mt-4"
                    >
                      See my requirements
                    </button>
                  </form>
                )}

                {step === 3 && (
                  <div className="text-center py-8">
                    <div className="inline-block w-14 h-14 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mb-6"></div>
                    <p className="text-white font-medium mb-2">Analysing your requirements...</p>
                    <p className="text-teal-300/50 text-sm">Cross-referencing B Corp v2.1 standards</p>
                  </div>
                )}
              </div>

              {/* FTE Explanation Box - Only shows on step 2 */}
              {step === 2 && (
                <div className="w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-teal-200 mb-3">Calculating FTE</h3>
                  <p className="text-xs text-white/60 mb-4">
                    B Lab uses a simplified system for calculating the Full Time Equivalent size of your workforce. They do not use precise FTE calculations:
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {step === 4 && requirements && (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{formData.company}</h1>
                <p className="text-teal-300/70 text-sm">
                  {requirements.totalCriteria} compliance criteria across {requirements.impactTopics.length} impact topics
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
                          <p className="text-sm leading-relaxed text-white/90">{criterion.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when no sub-requirement selected */}
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