#!/usr/bin/env python3
"""
build_image_index.py
Run this Python script to automatically generate the images-index.json file
Usage: python build_image_index.py
"""

import os
import json
import re
import shutil
from pathlib import Path

# Configuration
IMAGE_DIRECTORY = './PJ Jewellery Pics'
OUTPUT_FILE = './images-index.json'

# Category mappings
CATEGORY_MAPPINGS = {
    'Antitarnish Jewellery': 'antitarnish',
    'Bali and halfbali style earrings': 'bali',
    'Bangles': 'bangles',
    'Bracelets': 'bracelets',
    'Delicate Pendant Sets': 'delicate-pendant',
    'Kundan Heavy Sets': 'kundan-heavy',
    'Kundan earrings': 'kundan',
    'RingNath': 'ring-nath',
    'Sets': 'sets',
    'Silver Replicas': 'silver',
    'Studs': 'studs',
    'Temple Jewellery': 'temple'
}

# Supported image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}

def is_image_file(filename):
    """Check if a file is an image based on its extension."""
    return Path(filename).suffix.lower() in IMAGE_EXTENSIONS

def sort_files_numerically(files):
    """Sort files numerically if they contain numbers."""
    def extract_number(filename):
        match = re.search(r'\d+', filename)
        return int(match.group()) if match else 0
    
    return sorted(files, key=extract_number)

def rename_to_numeric(category_path):
    """Rename all non-numeric image files in a category to numeric format."""
    # Get all image files
    image_files = [
        f for f in category_path.iterdir()
        if f.is_file() and is_image_file(f.name)
    ]
    
    # Find max existing number and collect non-numeric files
    max_num = 0
    non_numeric_files = []
    
    for file in image_files:
        # Extract numeric part from filename
        match = re.search(r'^(\d+)', file.stem)
        if match:
            file_num = int(match.group())
            max_num = max(max_num, file_num)
        else:
            non_numeric_files.append(file)
    
    # Rename non-numeric files starting from max_num + 1
    renamed_count = 0
    for i, file in enumerate(non_numeric_files, start=max_num + 1):
        new_name = f"{i}{file.suffix}"
        new_path = file.with_name(new_name)
        
        # Ensure we don't overwrite existing files
        if not new_path.exists():
            file.rename(new_path)
            renamed_count += 1
            print(f"Renamed {file.name} -> {new_name}")
        else:
            print(f"Warning: Skipped {file.name} (target exists: {new_name})")
    
    return renamed_count

def generate_image_index():
    """Generate the image index JSON file."""
    image_index = {}
    total_renamed = 0
    
    try:
        # Check if main directory exists
        image_dir_path = Path(IMAGE_DIRECTORY)
        if not image_dir_path.exists():
            print(f"Directory not found: {IMAGE_DIRECTORY}")
            return
        
        # Process each category
        categories = [d.name for d in image_dir_path.iterdir() if d.is_dir()]
        print(f"Found categories: {categories}")
        
        for category in categories:
            category_path = image_dir_path / category
            category_key = CATEGORY_MAPPINGS.get(category)
            
            if not category_key:
                print(f"Warning: No mapping found for category: {category}")
                continue
            
            # Rename non-numeric files in this category
            renamed = rename_to_numeric(category_path)
            total_renamed += renamed
            print(f"Renamed {renamed} files in {category}")
            
            # Get image files after renaming
            files = [
                f.name for f in category_path.iterdir()
                if f.is_file() and is_image_file(f.name)
            ]
            
            # Sort files numerically
            files = sort_files_numerically(files)
            image_index[category_key] = files
            print(f"{category_key}: {len(files)} images")
        
        # Write the index file
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(image_index, f, indent=2, ensure_ascii=False)
        
        print(f"\nImage index generated: {OUTPUT_FILE}")
        print(f"Total categories: {len(image_index)}")
        print(f"Total files renamed: {total_renamed}")
        
        # Print summary
        total_images = sum(len(images) for images in image_index.values())
        for category, images in image_index.items():
            print(f"  {category}: {len(images)} images")
        print(f"Total images: {total_images}")
        
    except Exception as error:
        print(f"Error: {error}")

if __name__ == '__main__':
    generate_image_index()