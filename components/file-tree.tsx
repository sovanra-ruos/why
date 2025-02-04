import type React from "react"
import { FileIcon, FolderIcon, CodeIcon, ImageIcon, FileTextIcon } from "lucide-react"

interface FileTreeProps {
  files: Array<{
    name: string
    path: string
    content: string
  }>
  selectedFile: { name: string; path: string; content: string } | null
  onSelect: (file: { name: string; path: string; content: string }) => void
}

const FileTree: React.FC<FileTreeProps> = ({ files, selectedFile, onSelect }) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
        return <CodeIcon className="w-4 h-4 text-yellow-500" />
      case "css":
      case "scss":
        return <CodeIcon className="w-4 h-4 text-blue-500" />
      case "html":
        return <CodeIcon className="w-4 h-4 text-orange-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return <ImageIcon className="w-4 h-4 text-green-500" />
      case "md":
      case "txt":
        return <FileTextIcon className="w-4 h-4 text-gray-500" />
      default:
        return <FileIcon className="w-4 h-4 text-gray-400" />
    }
  }

  return (
      <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold mb-4 text-purple-600 flex items-center">
          <FolderIcon className="w-5 h-5 mr-2" />
          Project Files
        </h2>
        <ul className="space-y-2">
          {files.map((file) => (
              <li
                  key={file.path}
                  onClick={() => onSelect(file)}
                  className={`
              flex items-center p-2 rounded-md cursor-pointer
              transition-all duration-200 ease-in-out
              ${
                      selectedFile?.path === file.path
                          ? "bg-purple-100 text-purple-700 font-medium shadow-sm"
                          : "hover:bg-gray-100"
                  }
            `}
              >
                <span className="mr-2">{getFileIcon(file.name)}</span>
                <span className="text-sm truncate">{file.name}</span>
              </li>
          ))}
        </ul>
      </div>
  )
}

export default FileTree

