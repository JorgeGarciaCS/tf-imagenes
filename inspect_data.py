import os
from collections import Counter

def analyze_dataset(directory):
    data = []
    for filename in os.listdir(directory):
        if filename.endswith(".jpg"):
            # Format: Make_Model_Year_...
            parts = filename.split('_')
            if len(parts) > 0:
                make = parts[0]
                data.append(make)
    
    print(f"Total images: {len(data)}")
    print(f"Unique makes: {len(set(data))}")
    
    counts = Counter(data)
    print("\nTop 20 Makes distribution:")
    for make, count in counts.most_common(20):
        print(f"{make}: {count}")

if __name__ == "__main__":
    dataset_dir = "c:/Users/jg153.JORGE-PC/Downloads/Trabajo_IMG/archive"
    if os.path.exists(dataset_dir):
        analyze_dataset(dataset_dir)
    else:
        print(f"Directory not found: {dataset_dir}")
