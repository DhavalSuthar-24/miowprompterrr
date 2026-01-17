import React, { useState } from "react";
import { Brain, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "../common";
import { netFramework } from "../../constants";

export const NETFrameworkVisualizer = ({ theme: t }) => {
    const [expandedLayer, setExpandedLayer] = useState(0);

    return (
        <div className={`${t.card} rounded-xl border ${t.border} p-6`}>
            <h3 className={`font-semibold text-lg mb-4 flex items-center gap-2 ${t.text}`}>
                <Brain className="w-5 h-5 text-blue-500" />
                NET Framework Architecture
            </h3>
            <div className="space-y-2">
                {Object.entries(netFramework.components).map(([key, layer], idx) => (
                    <div
                        key={key}
                        className={`
              border-l-2 pl-4 py-3 cursor-pointer transition-all duration-200 rounded-r-lg
              ${expandedLayer === idx
                                ? `border-l-blue-500 ${t.cardActive}`
                                : `border-l-slate-600 ${t.cardHover}`
                            }
            `}
                        onClick={() => setExpandedLayer(expandedLayer === idx ? -1 : idx)}
                    >
                        <div className={`font-medium text-sm flex items-center justify-between ${t.text}`}>
                            {layer.name}
                            {expandedLayer === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {expandedLayer === idx && (
                            <div className={`mt-3 text-xs ${t.textSecondary} space-y-2`}>
                                <p className="mb-2">{layer.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {layer.techniques.map((tech, i) => (
                                        <Badge key={i} text={tech} variant="info" size="sm" />
                                    ))}
                                </div>
                                <p className="text-blue-500 mt-2 font-medium">→ {layer.purpose}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
