#my notes: primpt -> clip.tokenize() ->
import subprocess
import torch
import torchvision
import numpy as np
import imageio
from IPython.display import HTML, Image, clear_output
from scipy.stats import truncnorm, dirichlet
from pytorch_pretrained_biggan import convert_to_images, one_hot_from_names
from pytorch_pretrained_biggan import BigGAN
from base64 import b64encode
from time import time
from sentence_transformers import SentenceTransformer, util
from PIL import Image
from torchvision.utils import save_image
from git import Repo
import clip
import os


def save(out,name):
  with torch.no_grad():
    al = out.cpu().numpy()
  img = convert_to_images(al)[0]
  imageio.imwrite(name, np.asarray(img))

def checkin(prompt_num, total_loss, loss, reg, values, out):
  global sample_num
  #print("71")
  name = 'outputs/frame_%d_%03d.jpg'%(prompt_num, sample_num)
  save(out, name)
  #clear_output()
  #display(Image(name))
  print('%d: total=%.1f cos=%.1f reg=%.1f components: >=0.5=%d, >=0.3=%d, >=0.1=%d\n'%(sample_num, total_loss, loss, reg,np.sum(values >= 0.5),np.sum(values >= 0.3),np.sum(values >= 0.1)))
  sample_num += 1


def ascend_txt(prompt_num, i):
  noise_vector_trunc = noise_vector.clamp(-2*truncation,2*truncation) #([1,128])
  class_vector_norm = torch.nn.functional.softmax(class_vector, dim=1) #([1,1000])
  out = gan_model(noise_vector_trunc, class_vector_norm, truncation) #([1, 3, 128, 128])
  if i==iterations-1:
    save(out,'outputs/finalimg/%s.jpg'%prompt)
  p_s = []
  fixed_out = (out+1)/2
  for ch in range(augmentations):
    size = torch.randint(int(.5*sideX), int(.98*sideX), ())
    #size = int(sideX*torch.zeros(1,).normal_(mean=.8, std=.3).clip(.5, .95))
    offsetx = torch.randint(0, sideX - size, ())
    offsety = torch.randint(0, sideX - size, ())
    apper = fixed_out[:, :, offsetx:offsetx + size, offsety:offsety + size]
    apper = torch.nn.functional.interpolate(apper, res, mode='bicubic', align_corners= True)
    apper = apper.clamp(0,1)
    p_s.append(apper)
  into = nom(torch.cat(p_s, 0))  #([augmentation=64, 3, res=224, res=224])
  predict_clip = perceptor.encode_image(into)
  factor = 100
  loss = factor*(1-torch.cosine_similarity(predict_clip, target_clip, dim=-1).mean())
  total_loss = loss
  reg = torch.tensor(0., requires_grad  =True)
  if optimize_class and class_ent_reg:
    reg = -factor*class_ent_reg*(class_vector_norm*torch.log(class_vector_norm+eps)).sum()
    total_loss += reg
  if i % save_every == 0:
    with torch.no_grad():
      checkin(prompt_num, total_loss.item(),loss.item(),reg.item(),class_vector_norm.cpu().numpy(),out)
  #print("148")
  return total_loss
  
#------------------------------------ MAIN ----------------------------------

if os.path.isfile("biggan-128.pt"):
  print("found biggan")
  gan_model= torch.load('biggan-128.pt').to('cpu') #.cuda().eval()
  print("biggan loaded")

perceptor=None
preprocess=None
if os.path.isfile('vit-b-32.pt'):
  print("loading from saved pickle...")
  perceptor= torch.load('vit-b-32.pt').to('cpu') #.cuda()
  print("lllllllllllllllllllllllllloaded")

import nltk
print("downloading wordnet")
nltk.download('wordnet')

#@title Generate!
#@markdown 1. For **prompt** OpenAI suggest to use the template "A photo of a X." or "A photo of a X, a type of Y." [[paper]](https://cdn.openai.com/papers/Learning_Transferable_Visual_Models_From_Natural_Language_Supervision.pdf)
#@markdown 2. For **initial_class** you can either use free text or select a special option from the drop-down list.
#@markdown 3. Free text and 'From prompt' might fail to find an appropriate ImageNet class.
prompts = ['A photo of hell.', 'A photo of freedom.']
#prompt = 'A photo of a highway to hell.' #@param {type:'string'}
initial_class = 'Random class' #@param ['From prompt', 'Random class', 'Random Dirichlet', 'Random mix'] {allow-input: true}
optimize_class = True #@param {type:'boolean'}
class_smoothing = 0.1 #@param {type:'number'}
truncation = 1 #@param {type:'number'}
model = 'ViT-B/32' #@param ['ViT-B/32','RN50']
augmentations = 16#@param {type:'integer'}
learning_rate = 0.1 #@param {type:'number'}
class_ent_reg = 0.0001 #@param {type:'number'}
iterations = 200 #@param {type:'integer'}
save_every = 4 #@param {type:'integer'}
fps = 30 #@param {type:'number'}
freeze_secs = 5 #@param {type:'number'}

im_shape = [128, 128, 3]
sideX, sideY, channels = im_shape
seed = None
state = None if seed is None else np.random.RandomState(seed)
np.random.seed(seed)

for prompt_num, prompt in enumerate(prompts):
  noise_vector = truncnorm.rvs(-2*truncation, 2*truncation, size=(1, 128), random_state=state).astype(np.float32) #see https://github.com/tensorflow/hub/issues/214

  if initial_class.lower()=='random class':
    class_vector = np.ones(shape=(1,1000), dtype=np.float32)*class_smoothing/999
    class_vector[0,np.random.randint(1000)] = 1-class_smoothing
  elif initial_class.lower()=='random dirichlet':
    class_vector = dirichlet.rvs([1/1000] * 1000, size=1, random_state=state).astype(np.float32)
  else:
    class_vector = np.random.rand(1,1000).astype(np.float32)
  # elif initial_class.lower()=='random mix':
  #   class_vector = np.random.rand(1,1000).astype(np.float32)
  # else:
  #   if initial_class.lower()=='from prompt':
  #     initial_class = prompt
  #   try:
  #     class_vector = None
  #     class_vector = one_hot_from_names(initial_class, batch_size=1)
  #     assert class_vector is not None
  #     class_vector = class_vector*(1-class_smoothing*1000/999)+class_smoothing/999
  #   except Exception as e:  
  #     print('Error: could not find initial_class. Try something else.')
  #     raise e
  eps=1e-8
  class_vector = np.log(class_vector+eps)

  # All in tensors
  noise_vector = torch.tensor(noise_vector, requires_grad=True)#, device='cuda')
  class_vector = torch.tensor(class_vector, requires_grad=True)#, device='cuda')

  params = [noise_vector]
  if optimize_class:
    params += [class_vector]
  optimizer = torch.optim.Adam(params, lr=learning_rate)

  tx = clip.tokenize(prompt)
  with torch.no_grad():
    target_clip = perceptor.encode_text(tx)#.cuda())

  res = perceptor.visual.input_resolution
  nom = torchvision.transforms.Normalize((0.48145466, 0.4578275, 0.40821073), (0.26862954, 0.26130258, 0.27577711))

  sample_num = 0
  start = time()
  for i in range(iterations):    
    loss = ascend_txt(prompt_num, i)
    #print(163)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
  print('took: %d secs (%.2f sec/iter)'%(time()-start,(time()-start)/iterations))
