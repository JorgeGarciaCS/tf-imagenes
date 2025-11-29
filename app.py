import os
import json
import torch
import torch.nn as nn
from torchvision import transforms, models
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import io

from contextlib import asynccontextmanager

# Configuration
MODEL_PATH = "car_brand_model_best.pth"
MAPPING_PATH = "class_mapping.json"
IMG_SIZE = 224

# Global variables for model and classes
model = None
classes = []
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    global model, classes
    
    # Determine which model file to use
    actual_model_path = MODEL_PATH
    if not os.path.exists(MODEL_PATH):
        if os.path.exists("car_brand_model.pth"):
            print(f"Best model not found. Falling back to car_brand_model.pth")
            actual_model_path = "car_brand_model.pth"
        else:
            print("Model files not found. Waiting for training to complete...")
            return False

    if not os.path.exists(MAPPING_PATH):
        print("Mapping file not found. Waiting for training to complete...")
        return False

    # Load classes
    with open(MAPPING_PATH, 'r') as f:
        classes = json.load(f)
    
    # Load Model
    model = models.resnet18(pretrained=False)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(classes))
    model.load_state_dict(torch.load(actual_model_path, map_location=device))
    model = model.to(device)
    model.eval()
    print("Model loaded successfully.")
    return True

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield

app = FastAPI(lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Transforms
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global model
    if model is None:
        if not load_model():
            return JSONResponse(content={"error": "Model not ready yet. Please try again later."}, status_code=503)
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        input_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
        predicted_class = classes[predicted_idx.item()]
        confidence_score = confidence.item()
        
        return {
            "brand": predicted_class,
            "confidence": float(confidence_score)
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/")
async def main():
    content = """
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1>Car Brand Detector</h1>
        <p>Upload an image of a car to detect its brand.</p>
        <input type="file" id="fileInput" accept="image/*">
        <br><br>
        <button onclick="uploadImage()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Detect Brand</button>
        <br><br>
        <div id="result" style="font-size: 20px; font-weight: bold; margin-top: 20px;"></div>
        <img id="preview" style="max-width: 400px; margin-top: 20px; display: none;">
    </div>

    <script>
        async function uploadImage() {
            const fileInput = document.getElementById('fileInput');
            const resultDiv = document.getElementById('result');
            const previewImg = document.getElementById('preview');
            
            if (fileInput.files.length === 0) {
                alert('Please select a file!');
                return;
            }

            const file = fileInput.files[0];
            
            // Preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            }
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('file', file);

            resultDiv.innerText = 'Analyzing...';

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                
                if (data.error) {
                    resultDiv.innerText = 'Error: ' + data.error;
                } else {
                    resultDiv.innerText = `Detected Brand: ${data.brand} (${(data.confidence * 100).toFixed(1)}%)`;
                }
            } catch (error) {
                resultDiv.innerText = 'Error: ' + error.message;
            }
        }
        
        // Fix for the async function definition in script tag which is invalid JS syntax
        // Re-writing the function properly
        window.uploadImage = async function() {
             const fileInput = document.getElementById('fileInput');
            const resultDiv = document.getElementById('result');
            const previewImg = document.getElementById('preview');
            
            if (fileInput.files.length === 0) {
                alert('Please select a file!');
                return;
            }

            const file = fileInput.files[0];
            
            // Preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            }
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('file', file);

            resultDiv.innerText = 'Analyzing...';

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                
                if (data.error) {
                    resultDiv.innerText = 'Error: ' + data.error;
                } else {
                    resultDiv.innerText = `Detected Brand: ${data.brand} (${(data.confidence * 100).toFixed(1)}%)`;
                }
            } catch (error) {
                resultDiv.innerText = 'Error: ' + error.message;
            }
        }
    </script>
</body>
    """
    return HTMLResponse(content=content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
