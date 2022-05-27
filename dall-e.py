#my notes: primpt -> clip.tokenize() ->

import subprocess
import torch
import torchvision
import numpy as np
#import imageio
from IPython.display import HTML, Image, clear_output
from scipy.stats import truncnorm, dirichlet
from pytorch_pretrained_biggan import convert_to_images, one_hot_from_names
from pytorch_pretrained_biggan import BigGAN
from base64 import b64encode
from time import time
from sentence_transformers import SentenceTransformer, util
from PIL import Image

# CUDA_version = [s for s in subprocess.check_output(["nvcc", "--version"]).decode("UTF-8").split(", ") if s.startswith("release")][0].split(" ")[-1]
# print("CUDA version:", CUDA_version)
# print("toch ver", torch.__version__)
# if CUDA_version == "10.0":
#     torch_version_suffix = "+cu100"
# elif CUDA_version == "10.1":
#     torch_version_suffix = "+cu101"
# elif CUDA_version == "10.2":
#     torch_version_suffix = ""
# else:
#     torch_version_suffix = "+cu110"

# #!pip install torch==1.7.1{torch_version_suffix} torchvision==0.8.2{torch_version_suffix} -f https://download.pytorch.org/whl/torch_stable.html ftfy regex

import os
biggan_cache = "workspace"
if os.path.isdir("bbiggan-deep-512"):
  print("found biggan")
  gan_model= 'biggan-deep-512/07b5c0d1791fa2028f8aa458a36360f31e1549d44152c96579b3ad6b35055d34.c33e135ad91e13528d0b83edc3c53c7bf94f620bdf8bc2bf08be82ba6d602e62'
  gan_path ="workspace/biggan-deep-512"
  gan_model = BigGAN.from_pretrained(gan_path, local_files_only=True)
  print("biggan loaded")
else:
  print("downloading biggan...")
  gan_model = BigGAN.from_pretrained('biggan-deep-128', biggan_cache).cuda().eval()
  print("biggan downloaded")

import os 
from git import Repo

import clip
models = clip.available_models()
print(models)
perceptor=None
preprocess=None
if os.path.isfile('ViT-B-32.pt'):
  print("loading from saved pickle...")
  perceptor= torch.load('ViT-B-32.pt')
  print("loaded")
else:
  print("loading model from clip...")
  #perceptor = SentenceTransformer('clip-ViT-B-32')
  perceptor, preprocess = clip.load("ViT-B/32", device='cpu')
  print("model loaded")
  torch.save(perceptor, 'clip-ViT-B-32.pt')
  torch.save(preprocess, 'clip-preprpcess-ViT-B-32.pt')
  print("model saved as pickle")

import nltk
#print("downloading wordnet")
#nltk.download('wordnet')

# #/////////////////////////////////////////////////////////////////////////////////////
# #@markdown 1. For **prompt** OpenAI suggest to use the template "A photo of a X." or "A photo of a X, a type of Y." [[paper]](https://cdn.openai.com/papers/Learning_Transferable_Visual_Models_From_Natural_Language_Supervision.pdf)
# #@markdown 2. For **initial_class** you can either use free text or select a special option from the drop-down list.
# #@markdown 3. Free text and 'From prompt' might fail to find an appropriate ImageNet class.
total=[]
prompts = ['A photo of a purple moon in the lake.', 'A photo of a highway to hell.']#, 'A photo of a devil in the shadows.'] #@param {type:'string'}
#final in /content , every saved pic in content/output ?? 

prompt = 'A photo of a rainbow mushroom.' #@param {type:'string'}
initial_class = 'Random class' #@param ['From prompt', 'Random class', 'Random Dirichlet', 'Random mix'] {allow-input: true}
optimize_class = True #@param {type:'boolean'}
class_smoothing = 0.1 #@param {type:'number'}
truncation = 1 #@param {type:'number'}
augmentations =  64#@param {type:'integer'}
learning_rate = 0.1 #@param {type:'number'}
class_ent_reg = 0.0001 #@param {type:'number'}
iterations = 300 #@param {type:'integer'}
save_every = 5 #@param {type:'integer'}
fps = 30 #@param {type:'number'}
freeze_secs = 5 #@param {type:'number'}

#!rm -rf /content/output
#!mkdir -p /content/output

im_shape = [64, 64, 3]
sideX, sideY, channels = im_shape

#***********************************************************************************************************

def save(out,name):
  with torch.no_grad():
    al = out.cpu().numpy()
  img = convert_to_images(al)[0]
  imageio.imwrite(name, np.asarray(img))

def checkin(prompt_num, total_loss, loss, reg, values, out):
  global sample_num
  name = '/content/output/frame%d%05d.jpg\n'%(prompt_num, sample_num)
  save(out, name)
  clear_output()
  display(Image(name))
  print('%d: total=%.1f cos=%.1f reg=%.1f components: >=0.5=%d, >=0.3=%d, >=0.1=%d\n'%(sample_num, total_loss, loss, reg,np.sum(values >= 0.5),np.sum(values >= 0.3),np.sum(values >= 0.1)))
  sample_num += 1

def ascend_txt(prompt,prompt_num, i):
  noise_vector_trunc = noise_vector.clamp(-2*truncation,2*truncation)
  class_vector_norm = torch.nn.functional.softmax(class_vector)
  out = gan_model(noise_vector_trunc, class_vector_norm, truncation)
  if i==iterations-1:
    #save(out,'/content/%s.jpg'%prompt)
    my_save(out, save_path) #save last for wach prompt's final result 
  p_s = []
  fixed_out = (out+1)/2
  for ch in range(augmentations):
    size = torch.randint(int(.5*sideX), int(.98*sideX), ())
    #size = int(sideX*torch.zeros(1,).normal_(mean=.8, std=.3).clip(.5, .95))
    offsetx = torch.randint(0, sideX - size, ())
    offsety = torch.randint(0, sideX - size, ())
    apper = fixed_out[:, :, offsetx:offsetx + size, offsety:offsety + size]
    apper = torch.nn.functional.interpolate(apper, res, mode='bicubic')
    apper = apper.clamp(0,1)
    p_s.append(apper)
  into = nom(torch.cat(p_s, 0))

  predict_clip = perceptor[model].encode_image(into)
  factor = 100
  loss = factor*(1-torch.cosine_similarity(predict_clip, target_clip, dim=-1).mean())
  total_loss = loss
  reg = torch.tensor(0., requires_grad=True)
  if optimize_class and class_ent_reg:
    reg = -factor*class_ent_reg*(class_vector_norm*torch.log(class_vector_norm+eps)).sum()
    total_loss += reg
  if i % save_every == 0:
    with torch.no_grad():
      checkin(prompt_num, total_loss.item(),loss.item(),reg.item(),class_vector_norm.cpu().numpy(),out)
      #save every nth for video
  return total_loss
#***********************************************************************************************************
#___________________________________________main_______________________

seed = None
state = None if seed is None else np.random.RandomState(seed)
np.random.seed(seed)
noise_vector = truncnorm.rvs(-2*truncation, 2*truncation, size=(1, 128), random_state=state).astype(np.float32) #see https://github.com/tensorflow/hub/issues/214

if initial_class.lower()=='random class':
  class_vector = np.ones(shape=(1,1000), dtype=np.float32)*class_smoothing/999
  class_vector[0,np.random.randint(1000)] = 1-class_smoothing
elif initial_class.lower()=='random dirichlet':
  class_vector = dirichlet.rvs([1/1000] * 1000, size=1, random_state=state).astype(np.float32)
elif initial_class.lower()=='random mix':
  class_vector = np.random.rand(1,1000).astype(np.float32)
else:
  if initial_class.lower()=='from prompt':
    initial_class = prompt
  try:
    class_vector = None
    class_vector = one_hot_from_names(initial_class, batch_size=1)
    assert class_vector is not None
    class_vector = class_vector*(1-class_smoothing*1000/999)+class_smoothing/999
  except Exception as e:  
    print('Error: could not find initial_class. Try something else.')
    raise e

eps=1e-8
class_vector = np.log(class_vector+eps)

# All in tensors
noise_vector = torch.tensor(noise_vector, requires_grad=True, device='cuda')
class_vector = torch.tensor(class_vector, requires_grad=True, device='cuda')

params = [noise_vector]
if optimize_class:
  params += [class_vector]
optimizer = torch.optim.Adam(params, lr=learning_rate)

for prompt_num, prompt in enumerate(prompts):
  #tx = clip.tokenize(prompt)
  with torch.no_grad():
    #target_clip = perceptor.encode_text(tx.cuda())
    target_clip = perceptor.encode(prompt)
  
  #res = perceptor.visual.input_resolution

  nom = torchvision.transforms.Normalize((0.48145466, 0.4578275, 0.40821073), (0.26862954, 0.26130258, 0.27577711))

  sample_num = 0
  start = time()
  for i in range(iterations):    
    loss = ascend_txt(prompt, prompt_num, i)
    optimizer.zero_grad() #minimize gradian
    loss.backward() #back prop
    optimizer.step() #update wrights
  print('took: %d secs (%.2f sec/iter)'%(time()-start,(time()-start)/iterations))

  files.download('/content/%s.jpg'%prompt)
  
out = '"/content/film.mp4"'
with open('/content/list.txt','w') as f:
  for p in range(len(prompts)):
    for i in range(sample_num):
      f.write('file /content/output/frame%d%05d.jpg\n'%(p,i))
    for j in range(int(freeze_secs*fps)):
      f.write('file /content/output/frame%d%05d.jpg\n'%(p,i))
#!ffmpeg -r $fps -f concat -safe 0 -i /content/list.txt -c:v libx264 -pix_fmt yuv420p -profile:v baseline -movflags +faststart -r $fps $out -y
with open('/content/film.mp4', 'rb') as f:
  data_url = "data:video/mp4;base64," + b64encode(f.read()).decode()
display(HTML("""
  <video controls autoplay loop>
        <source src="%s" type="video/mp4">
  </video>""" % data_url))

from google.colab import files, output
output.eval_js('new Audio("https://freesound.org/data/previews/80/80921_1022651-lq.ogg").play()')
files.download('/content/%s.mp4'%prompt)

