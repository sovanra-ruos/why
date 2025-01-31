import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GitCommandModalProps {
    isOpen: boolean;
    onClose: () => void;
    commands: string[];
    clear: () => void;
}

export function GitCommandModal({ isOpen, onClose, commands, clear }: GitCommandModalProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState<boolean>(false);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const copyAllToClipboard = () => {
        const allCommands = commands.join('\n');
        navigator.clipboard.writeText(allCommands).then(() => {
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 2000);
        });
    };

    const handleClear = () => {
        onClose();
        clear();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClear}>
            <DialogContent className="sm:max-w-[550px] bg-zinc-950 text-zinc-50">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-zinc-50 flex items-center">
                        <Terminal className="mr-2 h-6 w-6 text-emerald-500" />
                        Git Commands
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Use these commands to initialize your git repository
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-6 space-y-4">
                    <AnimatePresence>
                        {commands.map((command, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-md border border-zinc-800 group-hover:border-emerald-500 transition-all duration-300">
                                    <code className="text-sm font-mono text-emerald-400">{command}</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(command, index)}
                                        className="text-zinc-400 hover:text-emerald-500 transition-colors duration-200"
                                    >
                                        {copiedIndex === index ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-l-md transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top"></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="mt-6 text-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAllToClipboard}
                        className="text-zinc-400 hover:text-emerald-500 transition-colors duration-200"
                    >
                        {copiedAll ? (
                            <Check className="h-4 w-4 mr-2" />
                        ) : (
                            <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy All
                    </Button>
                    <p className="text-sm text-zinc-400 mt-2">
                        Run these commands in your project directory to set up Git
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}