FROM nvcr.io/nvidia/pytorch:22.04-py3 
RUN pip install gitpython
RUN pip install torch==1.7.1 
RUN pip install torchvision==0.8.2 -f https://download.pytorch.org/whl/torch_stable.html 
RUN pip install ftfy 
RUN pip install regex
#RUN pip install git+https://github.com/openai/CLIP.git

