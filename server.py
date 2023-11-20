import random
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from diffusers import StableDiffusionPipeline, AutoPipelineForText2Image
import torch

app = Flask(__name__)
CORS(app)

def createPipeline():
  # pipeline = AutoPipelineForText2Image.from_pretrained(
  #   "stabilityai/stable-diffusion-2", torch_dtype=torch.float32, variant="fp16", use_safetensors=True
  # )
  pipeline = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-2", variant="fp16", use_safetensors=True
  )
  return pipeline

pipeline = createPipeline()

  

@app.route('/image', methods=['GET', 'POST'])
def generate_image():
  print("generating image")
  data = request.json
  prompt = data.get('prompt')
  print(prompt)
  
  # pipeline = StableDiffusionPipeline.from_single_file('./models/768-v-ema.safetensors', torch_dtype=torch.float32, variants='fp16', use_safetensors=True)
  
  # takes around 15-35s/iteration (and there's 10 iterations/num_inference_steps at the moment) to generate an image, so maybe we can generate a progress bar to simulate this time??
  
  index = random.randint(0, 1000)
  image_generated_path = 'image_generated_' + str(index) + '.png'
  
  image = pipeline(prompt=prompt, num_inference_steps=10).images[0]
  # image_generated_path = 'image_' + prompt + '.png'
  image.save("image_generated.png")
  # image_generated_path = 'image_generated_525.png'
  
  # buffered = BytesIO()
  # image.save(buffered, format="PNG")
  # encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
  # return jsonify({'image_generated_path': image_generated_path}), 201
  # return jsonify({'image_generated_path': image_generated_path, 'image_base64': encoded_image}), 201
  return send_file("image_generated.png", mimetype='image/png', as_attachment=True), 201


if __name__ == '__main__':
  host = '127.0.0.1'
  port = 5000
  app.run(debug=True)
  
  