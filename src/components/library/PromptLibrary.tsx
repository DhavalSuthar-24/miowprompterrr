import { useState } from "react";
import { Search, Sparkles, Code, PenTool, Briefcase, GraduationCap } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  category: "Coding" | "Writing" | "Business" | "Education" | "Creative";
  prompt: string;
  tags: string[];
  settings?: any; // Optional settings override
}

const TEMPLATES: Template[] = [
  {
    id: "tech-architect",
    title: "Senior System Architect",
    description: "Expert guidance on distributed systems, scalability, and cloud patterns.",
    category: "Coding",
    tags: ["Architecture", "System Design", "Cloud"],
    prompt: "You are a Senior System Architect with 15+ years of experience in designing high-scale distributed systems. Your goal is to provide comprehensive, robust, and scalable architectural solutions. When presented with a problem, breakdown the system components, discuss trade-offs (CAP theorem, latency vs consistency), and recommend specific technologies (e.g., Kafka vs RabbitMQ, NoSQL vs SQL) with clear reasoning. Always consider failure modes and recovery strategies."
  },
  {
    id: "react-expert",
    title: "React Performance Expert",
    description: "Optimize React applications, fix re-renders, and ensure best practices.",
    category: "Coding",
    tags: ["React", "Performance", "Frontend"],
    prompt: "You are a React Performance Expert. Your task is to analyze code snippets or architectural descriptions and identify performance bottlenecks. Focus heavily on render cycles, memoization (useMemo, useCallback), virtualization, and state management efficiency. Provide code refactors that demonstrate significantly improved performance metrics."
  },
  {
    id: "email-copywriter",
    title: "Conversion Copywriter",
    description: "Write high-converting email sequences and landing page copy.",
    category: "Writing",
    tags: ["Marketing", "Sales", "Email"],
    prompt: "You are a World-Class Conversion Copywriter specializing in direct response marketing. Your writing style is punchy, emotional, and persuasive. Use psychological triggers like scarcity, social proof, and reciprocity. Write an email sequence that nurtures leads from awareness to consideration to purchase. Keep paragraphs short and use engaging hooks."
  },
  {
    id: "data-analyst",
    title: "Data Science Mentor",
    description: "Explain complex statistical concepts and Python pandas manipulation.",
    category: "Education",
    tags: ["Data Science", "Python", "Statistics"],
    prompt: "You are a Patient Data Science Mentor. Explain complex concepts (e.g., p-values, regression, neural networks) using simple analogies and beginner-friendly language. When provided with data tasks, write clean, commented Python code using Pandas and Scikit-Learn. Always explain the 'why' behind each step of the data cleaning and analysis process."
  },
  {
    id: "startup-pitch",
    title: "VC Pitch Deck Assistant",
    description: "Refine startup pitches to be compelling for investors.",
    category: "Business",
    tags: ["Startup", "Pitch", "Investment"],
    prompt: "You are a Venture Capital Associate. tailored to critique and improve startup pitch decks. Focus on the narrative arc: Problem, Solution, Market Size, Traction, Team, and Ask. Be critical but constructive. Ensure the value proposition is crystal clear and the market opportunity is quantified. trimming fluff and jargon."
  },
  {
    id: "creative-story",
    title: "Sci-Fi World Builder",
    description: "Generate immersive lore, characters, and settings for sci-fi stories.",
    category: "Creative",
    tags: ["Fiction", "Sci-Fi", "Writing"],
    prompt: "You are a Visionary Sci-Fi World Builder. Help me flesh out a futuristic universe. Focus on sensory details, coherent technology systems, unique sociopolitical structures, and alien cultures. When asked about a setting, describe the sights, sounds, and smells. maintain internal consistency in the lore."
  }
];

interface PromptLibraryProps {
  onAdopt: (template: Template) => void;
  theme: any;
}

export const PromptLibrary = ({ onAdopt, theme: t }: PromptLibraryProps) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Coding", "Writing", "Business", "Education", "Creative"];

  const filtered = TEMPLATES.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(search.toLowerCase()) || 
                          tpl.description.toLowerCase().includes(search.toLowerCase()) ||
                          tpl.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === "All" || tpl.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (cat: string) => {
    switch(cat) {
      case "Coding": return <Code className="w-5 h-5 text-blue-400" />;
      case "Writing": return <PenTool className="w-5 h-5 text-purple-400" />;
      case "Business": return <Briefcase className="w-5 h-5 text-green-400" />;
      case "Education": return <GraduationCap className="w-5 h-5 text-yellow-400" />;
      default: return <Sparkles className="w-5 h-5 text-pink-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className={`text-3xl font-extrabold ${t.text} mb-2`}>
            Explore Templates
        </h2>
        <p className={`${t.textSecondary} max-w-xl mx-auto`}>
            Jumpstart your workflow with these expert-crafted prompts.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full md:w-96">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textSecondary}`} />
            <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl border ${t.border} bg-transparent ${t.text} focus:outline-none focus:border-blue-500 transition-colors`}
            />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`
                        px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                        ${activeCategory === cat 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                            : `bg-slate-800 text-slate-400 hover:bg-slate-700`
                        }
                    `}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10 custom-scrollbar">
        {filtered.map(template => (
            <div 
                key={template.id}
                className={`
                    group relative p-6 rounded-2xl border ${t.border} ${t.card} 
                    hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 
                    transition-all duration-300 flex flex-col
                `}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 group-hover:scale-110 transition-transform duration-300">
                        {getIcon(template.category)}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-800 ${t.textSecondary}`}>
                        {template.category}
                    </span>
                </div>
                
                <h3 className={`text-lg font-bold ${t.text} mb-2 group-hover:text-blue-400 transition-colors`}>
                    {template.title}
                </h3>
                
                <p className={`text-sm ${t.textMuted} mb-6 flex-grow line-clamp-3`}>
                    {template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/50 flex gap-3">
                    <button
                        onClick={() => onAdopt(template)}
                        className={`
                            flex-1 py-2.5 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white
                            flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20
                            transition-all active:scale-95
                        `}
                    >
                        <Sparkles className="w-4 h-4 fill-current" />
                        Use Template
                    </button>
                </div>
            </div>
        ))}
        {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-50">
                <Search className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-xl font-medium text-slate-400">No templates found</p>
                <p className="text-slate-500">Try adjusting your filters</p>
            </div>
        )}
      </div>
    </div>
  );
};
