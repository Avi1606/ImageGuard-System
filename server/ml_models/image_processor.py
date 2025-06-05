import os
import sys
import json
import cv2
import numpy as np
from PIL import Image
import hashlib
from sklearn.metrics.pairwise import cosine_similarity
import pickle

class SimpleImageProcessor:
    def __init__(self):
        self.index_file = os.path.join(os.path.dirname(__file__), 'simple_index.pkl')
        self.load_index()

    def load_index(self):
        """Load existing image index or create new one"""
        try:
            if os.path.exists(self.index_file):
                with open(self.index_file, 'rb') as f:
                    self.image_index = pickle.load(f)
            else:
                self.image_index = []
        except:
            self.image_index = []

    def save_index(self):
        """Save image index to file"""
        try:
            with open(self.index_file, 'wb') as f:
                pickle.dump(self.image_index, f)
        except Exception as e:
            print(f"Error saving index: {e}")

    def extract_features(self, image_path):
        """Extract simple features from image"""
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image")

            # Resize for consistency
            img_resized = cv2.resize(img, (64, 64))

            # Convert to different color spaces and extract features
            gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
            hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)

            # Calculate histograms
            hist_gray = cv2.calcHist([gray], [0], None, [16], [0, 256])
            hist_h = cv2.calcHist([hsv], [0], None, [16], [0, 180])
            hist_s = cv2.calcHist([hsv], [1], None, [16], [0, 256])
            hist_v = cv2.calcHist([hsv], [2], None, [16], [0, 256])

            # Combine features
            features = np.concatenate([
                hist_gray.flatten(),
                hist_h.flatten(),
                hist_s.flatten(),
                hist_v.flatten(),
                gray.flatten()[:100]  # First 100 pixels as texture features
            ])

            # Normalize
            features = features / (np.linalg.norm(features) + 1e-7)

            return features

        except Exception as e:
            raise ValueError(f"Error extracting features: {e}")

    def generate_hash(self, image_path):
        """Generate hash for image"""
        try:
            features = self.extract_features(image_path)

            # Create a simple hash from features
            feature_string = ''.join([str(int(f * 1000)) for f in features[:32]])
            hash_value = hashlib.md5(feature_string.encode()).hexdigest()

            return {
                'hash_vector': features.tolist(),
                'simple_hash': hash_value,
                'success': True
            }
        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }

    def add_to_index(self, image_path, image_id, metadata=None):
        """Add image to search index"""
        try:
            hash_result = self.generate_hash(image_path)
            if not hash_result['success']:
                return hash_result

            # Add to index
            self.image_index.append({
                'image_id': image_id,
                'image_path': image_path,
                'features': hash_result['hash_vector'],
                'simple_hash': hash_result['simple_hash'],
                'metadata': metadata or {}
            })

            self.save_index()

            return {
                'success': True,
                'message': 'Image added to index',
                'total_images': len(self.image_index)
            }

        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }

    def search_similar(self, image_path, threshold=0.8):
        """Search for similar images"""
        try:
            # Generate features for query image
            query_features = self.extract_features(image_path)

            if len(self.image_index) == 0:
                return {
                    'total_matches': 0,
                    'matches': [],
                    'highest_similarity': 0.0,
                    'success': True
                }

            # Calculate similarities
            similarities = []
            for item in self.image_index:
                stored_features = np.array(item['features'])
                similarity = cosine_similarity(
                    query_features.reshape(1, -1),
                    stored_features.reshape(1, -1)
                )[0][0]

                if similarity >= threshold:
                    similarities.append({
                        'image_id': item['image_id'],
                        'image_path': item['image_path'],
                        'similarity_score': float(similarity),
                        'metadata': item['metadata'],
                        'rank': 0  # Will be set after sorting
                    })

            # Sort by similarity
            similarities.sort(key=lambda x: x['similarity_score'], reverse=True)

            # Add ranks
            for i, item in enumerate(similarities):
                item['rank'] = i + 1

            return {
                'total_matches': len(similarities),
                'matches': similarities[:10],  # Top 10 matches
                'highest_similarity': similarities[0]['similarity_score'] if similarities else 0.0,
                'success': True
            }

        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No command provided', 'success': False}))
        return

    processor = SimpleImageProcessor()
    command = sys.argv[1]

    try:
        if command == 'generate_hash':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'No image path provided', 'success': False}))
                return

            image_path = sys.argv[2]
            result = processor.generate_hash(image_path)
            print(json.dumps(result))

        elif command == 'add_to_index':
            if len(sys.argv) < 4:
                print(json.dumps({'error': 'Missing parameters', 'success': False}))
                return

            image_path = sys.argv[2]
            image_id = sys.argv[3]
            metadata = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}

            result = processor.add_to_index(image_path, image_id, metadata)
            print(json.dumps(result))

        elif command == 'search_similar':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'No image path provided', 'success': False}))
                return

            image_path = sys.argv[2]
            threshold = float(sys.argv[3]) if len(sys.argv) > 3 else 0.8

            result = processor.search_similar(image_path, threshold)
            print(json.dumps(result))

        elif command == 'test':
            print(json.dumps({'success': True, 'message': 'Python ML processor is working!'}))

        else:
            print(json.dumps({'error': f'Unknown command: {command}', 'success': False}))

    except Exception as e:
        print(json.dumps({'error': str(e), 'success': False}))

if __name__ == '__main__':
    main()