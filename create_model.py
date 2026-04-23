import numpy as np
import onnx
import onnxruntime as ort
from sklearn.neural_network import MLPClassifier
from sklearn.feature_extraction.text import CountVectorizer
import pickle
import json
import onnxruntime as rt
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Training data: sentences -> behavior label
sentences = [
    "hello", "hi", "greetings", "hey", # idle
    "look left", "turn left", "left side", # look left
    "look right", "turn right", "right side", # look right
    "move head", "nod", "shake head", # move head
    "open mouth", "say something", "talk", # open mouth
    "raise arm", "lift arm", "wave", # raise arm
    "listen to me", "hear", "pay attention", # listen
    "think about it", "ponder", "consider" # think
]
labels = [
    "IDLE", "IDLE", "IDLE", "IDLE",
    "LOOK_LEFT", "LOOK_LEFT", "LOOK_LEFT",
    "LOOK_RIGHT", "LOOK_RIGHT", "LOOK_RIGHT",
    "MOVE_HEAD", "MOVE_HEAD", "MOVE_HEAD",
    "OPEN_MOUTH", "OPEN_MOUTH", "OPEN_MOUTH",
    "RAISE_ARM", "RAISE_ARM", "RAISE_ARM",
    "LISTEN", "LISTEN", "LISTEN",
    "THINK", "THINK", "THINK"
]

label_to_id = {lbl:i for i,lbl in enumerate(set(labels))}
y = [label_to_id[l] for l in labels]

# Vectorize text (simple bag of words)
vectorizer = CountVectorizer(max_features=30)
X = vectorizer.fit_transform(sentences).toarray().astype(np.float32)

# Train a small MLP
clf = MLPClassifier(hidden_layer_sizes=(16,), max_iter=500, random_state=42)
clf.fit(X, y)

# Convert to ONNX
initial_type = [('input', FloatTensorType([None, X.shape[1]]))]
onnx_model = convert_sklearn(clf, initial_types=initial_type, target_opset=12)

# Save model
with open("model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

# Save tokenizer (vocabulary mapping)
vocab = vectorizer.vocabulary_
tokenizer_json = {"vocab": vocab}
with open("tokenizer.json", "w") as f:
    json.dump(tokenizer_json, f)

print("✅ model.onnx and tokenizer.json generated. Place them in /models/ folder.")
