"""
ML Model Training Script

Trains a neural network to predict Bézier control points from stroke data.
Uses synthetic training data generated from random Bézier curves.
"""
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from pathlib import Path
import argparse
from tqdm import tqdm

# Import model from services
import sys
sys.path.append(str(Path(__file__).parent.parent))
from app.services.ml_prediction import ControlPointPredictor


class BezierDataset(Dataset):
    """
    Synthetic dataset of Bézier curves.
    
    Generates random cubic Bézier curves and samples points along them with noise.
    """
    
    def __init__(self, num_samples: int = 10000, num_points: int = 32, noise_level: float = 0.02):
        """
        Args:
            num_samples: Number of training examples
            num_points: Number of points to sample per curve
            noise_level: Gaussian noise standard deviation
        """
        self.num_samples = num_samples
        self.num_points = num_points
        self.noise_level = noise_level
        
        # Pre-generate all data
        self.data = []
        self.labels = []
        
        print(f"Generating {num_samples} synthetic Bézier curves...")
        for _ in tqdm(range(num_samples)):
            control_points, sampled_points = self._generate_curve()
            self.data.append(sampled_points)
            self.labels.append(control_points)
        
        self.data = np.array(self.data, dtype=np.float32)
        self.labels = np.array(self.labels, dtype=np.float32)
        
        # Normalize data to [0, 1]
        self._normalize()
    
    def _generate_curve(self):
        """Generate a random cubic Bézier curve with sampled points"""
        # Random control points in [0, 1]²
        control_points = np.random.rand(4, 2)
        
        # Make sure endpoints are more spread out
        control_points[0] = np.random.rand(2) * 0.3  # Start near origin
        control_points[3] = 0.7 + np.random.rand(2) * 0.3  # End near top-right
        
        # Sample points along the curve
        t_values = np.linspace(0, 1, self.num_points)
        sampled_points = np.zeros((self.num_points, 2))
        
        for i, t in enumerate(t_values):
            point = self._evaluate_bezier(control_points, t)
            # Add Gaussian noise
            noise = np.random.normal(0, self.noise_level, 2)
            sampled_points[i] = point + noise
        
        return control_points.flatten(), sampled_points.flatten()
    
    def _evaluate_bezier(self, control_points, t):
        """Evaluate cubic Bézier curve at parameter t"""
        ti = 1 - t
        B0 = ti ** 3
        B1 = 3 * ti ** 2 * t
        B2 = 3 * ti * t ** 2
        B3 = t ** 3
        
        return (
            B0 * control_points[0] +
            B1 * control_points[1] +
            B2 * control_points[2] +
            B3 * control_points[3]
        )
    
    def _normalize(self):
        """Normalize data to have zero mean and unit variance"""
        self.data_mean = self.data.mean(axis=0)
        self.data_std = self.data.std(axis=0) + 1e-8
        self.data = (self.data - self.data_mean) / self.data_std
        
        self.labels_mean = self.labels.mean(axis=0)
        self.labels_std = self.labels.std(axis=0) + 1e-8
        self.labels = (self.labels - self.labels_mean) / self.labels_std
    
    def __len__(self):
        return self.num_samples
    
    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]


def train_model(
    num_samples: int = 10000,
    num_points: int = 32,
    batch_size: int = 64,
    epochs: int = 100,
    learning_rate: float = 0.001,
    output_path: str = "./models/control_point_predictor.pth",
):
    """
    Train the control point prediction model.
    
    Args:
        num_samples: Number of training samples
        num_points: Number of points per curve
        batch_size: Batch size for training
        epochs: Number of training epochs
        learning_rate: Learning rate for optimizer
        output_path: Path to save trained model
    """
    print("=" * 60)
    print("Bézier Control Point Predictor - Training")
    print("=" * 60)
    
    # Set device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Create dataset
    dataset = BezierDataset(num_samples=num_samples, num_points=num_points)
    
    # Split into train/validation
    train_size = int(0.9 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    print(f"Training samples: {train_size}")
    print(f"Validation samples: {val_size}")
    
    # Create model
    model = ControlPointPredictor(num_input_points=num_points)
    model.to(device)
    
    # Loss and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=5)
    
    # Training loop
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        # Training phase
        model.train()
        train_loss = 0.0
        
        for inputs, targets in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            
            # Forward pass
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
        
        train_loss /= len(train_loader)
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        
        with torch.no_grad():
            for inputs, targets in val_loader:
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                val_loss += loss.item()
        
        val_loss /= len(val_loader)
        
        # Learning rate scheduling
        scheduler.step(val_loss)
        
        # Print progress
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{epochs}] - Train Loss: {train_loss:.6f}, Val Loss: {val_loss:.6f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            
            # Create output directory if needed
            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Save model
            torch.save(model.state_dict(), output_path)
            print(f"✅ Model saved to {output_path} (val_loss: {val_loss:.6f})")
    
    print("\n" + "=" * 60)
    print(f"Training complete! Best validation loss: {best_val_loss:.6f}")
    print(f"Model saved to: {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Bézier control point predictor")
    parser.add_argument("--samples", type=int, default=10000, help="Number of training samples")
    parser.add_argument("--points", type=int, default=32, help="Number of points per curve")
    parser.add_argument("--batch-size", type=int, default=64, help="Batch size")
    parser.add_argument("--epochs", type=int, default=100, help="Number of epochs")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--output", type=str, default="../models/control_point_predictor.pth", help="Output path")
    
    args = parser.parse_args()
    
    train_model(
        num_samples=args.samples,
        num_points=args.points,
        batch_size=args.batch_size,
        epochs=args.epochs,
        learning_rate=args.lr,
        output_path=args.output,
    )
