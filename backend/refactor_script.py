import os

path = r"c:\Users\aksha\Downloads\degree_planner_agent\frontend\src\app\planner\page.tsx"

print(f"Reading file: {path}")
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
in_removal = False
import_added = False

print(f"Total lines read: {len(lines)}")

found_start = False
found_end = False

for line in lines:
    # Add import after the last import (checking for 'cn' import)
    if not import_added and 'import { cn }' in line:
        new_lines.append(line)
        new_lines.append('import { VisualRoadmap } from "./VisualRoadmap";\n')
        import_added = True
        print("Import added.")
        continue

    if "function VisualRoadmap({ plan, difficulty, courses }" in line:
        in_removal = True
        found_start = True
        print(f"Found start of VisualRoadmap at line: {line.strip()}")
        continue
    
    if "function SkillsProgression" in line:
        if in_removal:
            print(f"Found end of removal at line: {line.strip()}")
            found_end = True
        in_removal = False
    
    if not in_removal:
        new_lines.append(line)

if found_start and found_end:
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Successfully refactored page.tsx")
else:
    print("Could not find start or end of the function to remove. No changes made.")
    if found_start: print("Found start but not end.")
    if found_end: print("Found end but not start.")
