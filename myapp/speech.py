import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import sounddevice as sd
from scipy.io.wavfile import write
import ollama
import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["mydatabase"]
collection = db["questions"]

device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

model_id = "openai/whisper-base.en"

model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id,
    torch_dtype=torch_dtype,
    low_cpu_mem_usage=True,
    use_safetensors=True,
)
model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    max_new_tokens=128,
    torch_dtype=torch_dtype,
    device=device,
)

freq = 44100
duration = 5


def record_audio():
    recording = sd.rec(int(duration * freq), samplerate=freq, channels=2)
    sd.wait()
    write("recording0.wav", freq, recording)
    audio_data = "recording0.wav"
    recognized_text = pipe(audio_data)["text"] + " in 100 words"
    result = collection.find_one({"question": recognized_text[:-13]})
    if result:
        res = f"Q:{result['question']}\nA:{result['answer']}"
        return res
    else:
        response = ollama.generate(model="phi:latest", prompt=recognized_text)[
            "response"
        ]
        res = f"Q:{recognized_text[:-13]}\nA:{response}"
        data = {"question": recognized_text[:-13], "answer": response}
        collection.insert_one(data)
        return res
