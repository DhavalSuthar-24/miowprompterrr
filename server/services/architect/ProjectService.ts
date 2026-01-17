import AdmZip from 'adm-zip';
import { AgentSession } from '@prisma/client';

interface FileNode {
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileNode[];
}

export class ProjectService {
    
    /**
     * Converts a flat list of files from Executor Agent into a hierarchical file tree
     */
    static generateFileTree(session: AgentSession): FileNode[] {
        const artifacts = session.artifacts as any;
        const execution = artifacts?.execution as any; // Output from Executor Agent
        
        // Root folder
        const root: FileNode = {
            name: 'project',
            type: 'folder',
            children: []
        };

        if (!execution) return [root];

        // 1. Add System Prompt
        if (execution.systemPrompt) {
            root.children?.push({
                name: 'system_prompt.md',
                type: 'file',
                content: execution.systemPrompt
            });
        }

        // 2. Add Context Files
        // Executor returns contextFiles: [{ name, content, description }]
        if (execution.contextFiles && Array.isArray(execution.contextFiles)) {
            const contextFolder: FileNode = {
                name: 'context',
                type: 'folder',
                children: [] 
            };

            execution.contextFiles.forEach((file: any) => {
                contextFolder.children?.push({
                    name: file.name.endsWith('.md') ? file.name : `${file.name}.md`, // Ensure extension
                    type: 'file',
                    content: `<!-- ${file.description} -->\n\n${file.content}`
                });
            });

            root.children?.push(contextFolder);
        }

        // 3. Add User Prompt Template
        if (execution.userPromptTemplate) {
            root.children?.push({
                name: 'user_prompt_template.md',
                type: 'file',
                content: execution.userPromptTemplate
            });
        }

        return [root];
    }

    /**
     * Generates a ZIP buffer for the project
     */
    static generateZip(session: AgentSession): Buffer {
        const zip = new AdmZip();
        const tree = this.generateFileTree(session);
        const root = tree[0];

        // Helper to recursively add nodes
        const addNode = (node: FileNode, path: string) => {
            if (node.type === 'file' && node.content) {
                zip.addFile(path + node.name, Buffer.from(node.content));
            } else if (node.type === 'folder' && node.children) {
                node.children.forEach(child => addNode(child, path + node.name + '/'));
            }
        };

        // We skip adding the root folder itself to the zip path to keep structure clean
        // e.g. project/system.md -> system.md in zip
        if (root.children) {
            root.children.forEach(child => addNode(child, ""));
        }

        return zip.toBuffer();
    }
}
