import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms, models
from PIL import Image
from collections import Counter

# Configuration
DATA_DIR = "c:/Users/jg153.JORGE-PC/Downloads/Trabajo_IMG/archive"
MODEL_SAVE_PATH = "car_brand_model.pth"
BEST_MODEL_SAVE_PATH = "car_brand_model_best.pth"
MAPPING_SAVE_PATH = "class_mapping.json"
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001
IMG_SIZE = 224

class CarDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []
        self.classes = set()
        
        # Load images and extract labels
        valid_extensions = {'.jpg', '.jpeg', '.png'}
        for filename in os.listdir(root_dir):
            if os.path.splitext(filename)[1].lower() in valid_extensions:
                parts = filename.split('_')
                if len(parts) > 0:
                    make = parts[0]
                    self.image_paths.append(os.path.join(root_dir, filename))
                    self.labels.append(make)
                    self.classes.add(make)
        
        self.classes = sorted(list(self.classes))
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        print(f"Found {len(self.image_paths)} images from {len(self.classes)} classes.")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label_name = self.labels[idx]
        label_idx = self.class_to_idx[label_name]
        
        try:
            image = Image.open(img_path).convert('RGB')
            if self.transform:
                image = self.transform(image)
            return image, label_idx
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            # Return a dummy image or handle error appropriately
            # For simplicity, returning a black image
            return torch.zeros((3, IMG_SIZE, IMG_SIZE)), label_idx

def train_model():
    # Check device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Transforms
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # Dataset
    full_dataset = CarDataset(DATA_DIR, transform=transform)
    
    # Save class mapping
    with open(MAPPING_SAVE_PATH, 'w') as f:
        json.dump(full_dataset.classes, f)
    print(f"Saved class mapping to {MAPPING_SAVE_PATH}")

    # Split
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0) # num_workers=0 for Windows compatibility
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # Model (ResNet18)
    model = models.resnet18(pretrained=True)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(full_dataset.classes))
    model = model.to(device)

    # Loss and Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)

    best_acc = 0.0

    # Training Loop
    for epoch in range(EPOCHS):
        print(f"Epoch {epoch+1}/{EPOCHS}")
        model.train()
        running_loss = 0.0
        
        for i, (inputs, labels) in enumerate(train_loader):
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            if i % 100 == 0:
                print(f"Batch {i}/{len(train_loader)}, Loss: {loss.item():.4f}")
        
        scheduler.step()

        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for inputs, labels in enumerate(val_loader):
                # Fix: enumerate returns (index, data), so we need to unpack data if it's a tuple
                # Actually val_loader yields (images, labels) directly if not enumerated, 
                # but with enumerate it yields i, (images, labels)
                pass 
            
            # Correct loop for validation
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        epoch_acc = 100 * correct / total
        print(f"Validation Accuracy: {epoch_acc:.2f}%")
        
        if epoch_acc > best_acc:
            best_acc = epoch_acc
            torch.save(model.state_dict(), BEST_MODEL_SAVE_PATH)
            print(f"New best model saved with accuracy: {best_acc:.2f}%")

    # Save Final Model
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Final model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train_model()
