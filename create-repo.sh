#!/bin/sh

PROJECT_ID=$1
GITLAB_TOKEN="glpat-WXeK4PkToFK5vVx6qTZN"  # ⚠️ Hardcoding tokens is a security risk!

# Validate input
if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <project_id>"
  exit 1
fi

PROJECT_DIR="/home/asura/Desktop/cloud-ui/cloudinator-ui/tmp/$PROJECT_ID"
GIT_REMOTE_URL="https://git.cloudinator.cloud/cloudinator-ai/${PROJECT_ID}.git"

# Ensure the directory exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: Directory $PROJECT_DIR does not exist."
  exit 1
fi

# Navigate to the project directory
cd "$PROJECT_DIR" || { echo "Failed to enter $PROJECT_DIR"; exit 1; }

echo "Processing project in $PROJECT_DIR"

# List files in the directory
ls -lrt

# Configure Git only if not already configured
git config --get user.name >/dev/null 2>&1 || git config --global user.name "Administrator"
git config --get user.email >/dev/null 2>&1 || git config --global user.email "gitlab_admin_a5a7a1@example.com"

# Initialize Git repository only if it does not exist
if [ ! -d ".git" ]; then
  git init
fi

# Add files to the repository
git add .

# Ensure `main` branch exists
git checkout -b main 2>/dev/null || git checkout main

# Commit changes only if there are staged changes
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "Initial commit"
fi

# Ensure remote is set correctly
if ! git remote | grep -q origin; then
  git remote add origin "$GIT_REMOTE_URL"
else
  git remote set-url origin "$GIT_REMOTE_URL"
fi

# Create a temporary script for Git credentials
GIT_ASKPASS_SCRIPT=$(mktemp)

# Write the hardcoded GitLab token to the script
cat <<EOF > "$GIT_ASKPASS_SCRIPT"
#!/bin/sh
echo "$GITLAB_TOKEN"
EOF

# Ensure the script is executable
chmod +x "$GIT_ASKPASS_SCRIPT"

# Attempt to push changes using the hardcoded token
GIT_ASKPASS="$GIT_ASKPASS_SCRIPT" git push -u origin main || {
  echo "ERROR: Failed to push changes to GitLab." >&2
  rm -f "$GIT_ASKPASS_SCRIPT"
  exit 1
}

# Clean up the temporary file
rm -f "$GIT_ASKPASS_SCRIPT"
