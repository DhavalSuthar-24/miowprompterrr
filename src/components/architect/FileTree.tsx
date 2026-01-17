import { useState } from 'react';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';

export interface FileNode {
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileNode[];
}

export const FileTree = ({ data, onSelect }: { data: FileNode[], onSelect: (node: FileNode) => void }) => {
    return (
        <div className="text-sm font-mono">
            {data.map((node, i) => (
                <TreeNode key={i} node={node} onSelect={onSelect} />
            ))}
        </div>
    );
};

const TreeNode = ({ node, onSelect }: { node: FileNode, onSelect: (node: FileNode) => void }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (node.type === 'file') {
        return (
            <div 
                className="flex items-center gap-2 py-1 px-2 hover:bg-gray-800 cursor-pointer rounded text-gray-300 hover:text-white"
                onClick={() => onSelect(node)}
            >
                <File className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{node.name}</span>
            </div>
        );
    }

    return (
        <div>
            <div 
                className="flex items-center gap-1 py-1 px-2 hover:bg-gray-800 cursor-pointer rounded text-gray-400 hover:text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <ChevronDown className="w-3 h-3 text-yellow-500 shrink-0" />
                ) : (
                    <ChevronRight className="w-3 h-3 text-yellow-500 shrink-0" />
                )}
                <Folder className="w-3 h-3 text-yellow-500 shrink-0" />
                <span className="font-semibold truncate">{node.name}</span>
            </div>
            {isOpen && node.children && (
                <div className="pl-4 border-l border-gray-800 ml-2">
                    {node.children.map((child, i) => (
                        <TreeNode key={i} node={child} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
};
