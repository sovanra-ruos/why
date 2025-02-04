import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import { promises as fs } from "fs";

const execShellScript = (scriptPath: string, args: string[], cwd: string) => {
  return new Promise((resolve, reject) => {
    exec(`sh ${scriptPath} ${args.join(' ')}`, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const projectPath = path.join(process.cwd(), "tmp", projectId);

    // Ensure the project directory exists
    await fs.access(projectPath);

    console.log("Creating Git repository for project:", projectId);

    // Path to the shell script
    const scriptPath = path.join(process.cwd(), "create-repo.sh");

    // Execute the shell script with projectId as a parameter
    await execShellScript(scriptPath, [projectId], projectPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating repo:", error);
    return NextResponse.json({ error: "Failed to create repo" }, { status: 500 });
  }
}