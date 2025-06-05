import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision.models import resnet50
import numpy as np
import cv2
from PIL import Image
import faiss
import pickle
import os

class CNNHasher(nn.Module):
    """
    Advanced CNN-based perceptual hashing model
    Uses ResNet50 backbone with custom hash layer
    """
    def __init__(self, hash_size=128):
        super(CNNHasher, self).__init__()

        # Use pretrained ResNet50 as backbone
        self.backbone = resnet50(pretrained=True)

        # Remove the final classification layer
        self.backbone = nn.Sequential(*list(self.backbone.children())[:-1])

        # Add custom hash layers
        self.hash_layer = nn.Sequential(
            nn.Linear(2048, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, hash_size),
            nn.Tanh()  # Output between -1 and 1
        )

        # Freeze backbone layers for faster training
        for param in self.backbone.parameters():
            param.requires_grad = False

    def forward(self, x):
        features = self.backbone(x)
        features = features.view(features.size(0), -1)
        hash_code = self.hash_layer(features)
        return hash_code

class TripletLoss(nn.Module):
    """
    Triplet loss for training perceptual hashing
    Brings similar images closer, pushes dissimilar apart
    """
    def __init__(self, margin=1.0):
        super(TripletLoss, self).__init__()
        self.margin = margin

    def forward(self, anchor, positive, negative):
        pos_dist = F.pairwise_distance(anchor, positive, p=2)
        neg_dist = F.pairwise_distance(anchor, negative, p=2)

        loss = F.relu(pos_dist - neg_dist + self.margin)
        return loss.mean()

class ImageHashProcessor:
    """
    Main class for CNN-based image hashing and similarity search
    """
    def __init__(self, model_path=None, faiss_index_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = CNNHasher(hash_size=128).to(self.device)
        self.faiss_index = None
        self.image_metadata = []

        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])

        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

        if faiss_index_path and os.path.exists(faiss_index_path):
            self.load_faiss_index(faiss_index_path)
        else:
            self.faiss_index = faiss.IndexFlatIP(128)  # Inner product for cosine similarity

    def load_model(self, model_path):
        """Load pretrained CNN model"""
        checkpoint = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()

    def save_model(self, model_path):
        """Save trained model"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'hash_size': 128
        }, model_path)

    def load_faiss_index(self, index_path):
        """Load FAISS index and metadata"""
        self.faiss_index = faiss.read_index(index_path)
        metadata_path = index_path.replace('.index', '_metadata.pkl')
        if os.path.exists(metadata_path):
            with open(metadata_path, 'rb') as f:
                self.image_metadata = pickle.load(f)

    def save_faiss_index(self, index_path):
        """Save FAISS index and metadata"""
        faiss.write_index(self.faiss_index, index_path)
        metadata_path = index_path.replace('.index', '_metadata.pkl')
        with open(metadata_path, 'wb') as f:
            pickle.dump(self.image_metadata, f)

    def preprocess_image(self, image_path):
        """Preprocess image for CNN input"""
        try:
            if isinstance(image_path, str):
                image = Image.open(image_path).convert('RGB')
            else:
                image = image_path.convert('RGB')

            return self.transform(image).unsqueeze(0)
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {str(e)}")

    def generate_hash(self, image_path):
        """Generate CNN-based perceptual hash"""
        self.model.eval()

        with torch.no_grad():
            image_tensor = self.preprocess_image(image_path).to(self.device)
            hash_vector = self.model(image_tensor)

            # Normalize for cosine similarity
            hash_vector = F.normalize(hash_vector, p=2, dim=1)

            return hash_vector.cpu().numpy().flatten()

    def add_image_to_index(self, image_path, image_id, metadata=None):
        """Add image hash to FAISS index"""
        try:
            hash_vector = self.generate_hash(image_path)

            # Add to FAISS index
            self.faiss_index.add(hash_vector.reshape(1, -1).astype(np.float32))

            # Store metadata
            self.image_metadata.append({
                'image_id': image_id,
                'image_path': image_path,
                'metadata': metadata or {},
                'index_position': len(self.image_metadata)
            })

            return hash_vector

        except Exception as e:
            raise ValueError(f"Error adding image to index: {str(e)}")

    def search_similar_images(self, image_path, threshold=0.8, top_k=10):
        """Search for similar images using FAISS"""
        try:
            query_hash = self.generate_hash(image_path)

            # Search in FAISS index
            similarities, indices = self.faiss_index.search(
                query_hash.reshape(1, -1).astype(np.float32),
                top_k
            )

            results = []
            for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
                if idx != -1 and similarity >= threshold:
                    metadata = self.image_metadata[idx] if idx < len(self.image_metadata) else {}
                    results.append({
                        'similarity_score': float(similarity),
                        'image_id': metadata.get('image_id'),
                        'image_path': metadata.get('image_path'),
                        'metadata': metadata.get('metadata', {}),
                        'rank': i + 1,
                        'status': self._determine_status(similarity)
                    })

            return {
                'query_image': image_path,
                'total_matches': len(results),
                'matches': results,
                'highest_similarity': results[0]['similarity_score'] if results else 0.0
            }

        except Exception as e:
            raise ValueError(f"Error searching similar images: {str(e)}")

    def _determine_status(self, similarity_score):
        """Determine image status based on similarity score"""
        if similarity_score >= 0.95:
            return "original"
        elif similarity_score >= 0.85:
            return "minor_modifications"
        elif similarity_score >= 0.70:
            return "moderate_modifications"
        elif similarity_score >= 0.50:
            return "significant_modifications"
        else:
            return "potentially_different"

    def calculate_tamper_score(self, similarity_score):
        """Calculate tamper/originality score"""
        tamper_score = {
            'originality_percentage': min(100, int(similarity_score * 100)),
            'tamper_level': self._get_tamper_level(similarity_score),
            'color_code': self._get_color_code(similarity_score),
            'confidence': self._get_confidence_level(similarity_score)
        }
        return tamper_score

    def _get_tamper_level(self, score):
        if score >= 0.95: return "No tampering detected"
        elif score >= 0.85: return "Minor modifications"
        elif score >= 0.70: return "Moderate tampering"
        elif score >= 0.50: return "Significant tampering"
        else: return "Heavily modified or different image"

    def _get_color_code(self, score):
        if score >= 0.90: return "green"
        elif score >= 0.70: return "yellow"
        else: return "red"

    def _get_confidence_level(self, score):
        if score >= 0.95: return "very_high"
        elif score >= 0.85: return "high"
        elif score >= 0.70: return "medium"
        else: return "low"

# Training function for the CNN model
def train_cnn_hasher(model, train_loader, num_epochs=10, learning_rate=0.001):
    """Train the CNN hasher with triplet loss"""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    triplet_loss = TripletLoss(margin=1.0)

    model.train()
    for epoch in range(num_epochs):
        total_loss = 0
        for batch_idx, (anchor, positive, negative) in enumerate(train_loader):
            anchor, positive, negative = anchor.to(device), positive.to(device), negative.to(device)

            optimizer.zero_grad()

            anchor_hash = model(anchor)
            positive_hash = model(positive)
            negative_hash = model(negative)

            loss = triplet_loss(anchor_hash, positive_hash, negative_hash)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

            if batch_idx % 100 == 0:
                print(f'Epoch {epoch}, Batch {batch_idx}, Loss: {loss.item():.4f}')

        print(f'Epoch {epoch} completed. Average Loss: {total_loss/len(train_loader):.4f}')

    return model