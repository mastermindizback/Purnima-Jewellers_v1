#!/usr/bin/env python3
"""
build_image_index.py
Run this Python script to automatically generate the images-index.json file
Usage: python build_image_index.py
"""

import os
import json
import re
from pathlib import Path

# Configuration
IMAGE_DIRECTORY = './PJ Jewellery Pics'
OUTPUT_FILE = './images-index.json'

# Category mappings (same as in your JS file)
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

def generate_image_index():
    """Generate the image index JSON file."""
    image_index = {}
    
    try:
        # Check if the main directory exists
        image_dir_path = Path(IMAGE_DIRECTORY)
        if not image_dir_path.exists():
            print(f"Directory not found: {IMAGE_DIRECTORY}")
            return
        
        # Get all subdirectories
        categories = [d.name for d in image_dir_path.iterdir() if d.is_dir()]
        print(f"Found categories: {categories}")
        
        # Process each category
        for category in categories:
            category_path = image_dir_path / category
            category_key = CATEGORY_MAPPINGS.get(category)
            
            if not category_key:
                print(f"Warning: No mapping found for category: {category}")
                continue
            
            try:
                # Get all image files in the category directory
                files = [
                    f.name for f in category_path.iterdir()
                    if f.is_file() and is_image_file(f.name)
                ]
                
                # Sort files numerically
                files = sort_files_numerically(files)
                
                image_index[category_key] = files
                print(f"{category_key}: {len(files)} images found")
                
            except Exception as error:
                print(f"Error reading category {category}: {error}")
        
        # Write the index file
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(image_index, f, indent=2, ensure_ascii=False)
        
        print(f"\nImage index generated successfully: {OUTPUT_FILE}")
        print(f"Total categories processed: {len(image_index)}")
        
        # Print summary
        total_images = 0
        for category, images in image_index.items():
            total_images += len(images)
            print(f"  {category}: {len(images)} images")
        
        print(f"Total images: {total_images}")
        
    except Exception as error:
        print(f"Error generating image index: {error}")

if __name__ == '__main__':
    generate_image_index()