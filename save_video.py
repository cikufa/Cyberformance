# from keyword import iskeyword
# from optparse import AmbiguousOptionError
from textwrap3 import fill
import moviepy.editor as me
import tempfile
# import textwrap
import glob
import os
import re
import time 

def createvid(description, images, duration, fps=24):
    blackbg = me.ColorClip((720,720), (0, 0, 0))
    clips = [me.ImageClip(m, duration=duration) for m in images]
   
    concat_clip = me.concatenate_videoclips(clips, method="compose").set_position(('center', 'center'))
    if description == "start song":
        description = " "
    if len(description) > 35:
        description = fill(description, 35)

    #asd lyrics
    txtClip = me.TextClip(description, color='white', fontsize=30, font='Amiri-regular').set_position('center')
    txt_col = txtClip.on_color(size=(blackbg.w, txtClip.h + 10),
                               color=(0,0,0), pos=('center', 'center'), 
                               col_opacity=0.8)

    txt_mov = txt_col.set_position((0, blackbg.h-20-txtClip.h))
    comp_list = [blackbg, concat_clip, txt_mov]
    final = me.CompositeVideoClip(comp_list).set_duration(concat_clip.duration)

    with tempfile.NamedTemporaryFile() as video_tempfile:
        final.write_videofile(video_tempfile.name+".mp4", fps=fps)
        video_tempfile.seek(0)
        return video_tempfile

def concatvids(descriptions, video_temp_list, audiofilepath=False, fps=24, lyrics=True):
    clips = []
    for idx, (desc, vid) in enumerate(zip(descriptions, video_temp_list)):
    #     # compvid_list = []
    #     # desc = desc[1]
        if desc == descriptions[-1][1]:
            break
        vid = me.VideoFileClip(f'{vid.name}.mp4')#.set_position(('center', 'center'))
        clips.append(vid)

    concat_clip = me.concatenate_videoclips(clips, method="compose").set_position(('center', 'center'))
    # concat_clip = me.CompositeVideoClip([blackbg, concat_clip])#.set_duration(vid.duration)
    if audiofilepath:
        concat_clip.audio = me.AudioFileClip(audiofilepath)
        concat_clip.duration = concat_clip.audio.duration
    concat_clip.write_videofile("finallll.mp4", fps=fps)

def create_strp(d, timeformat):
    return time.mktime(time.strptime(d, timeformat))

def init_textfile(textfile):
    timeformat = "%M:%S"
    starttime = "00:00"
    with open(textfile, 'r') as file:
        descs = file.readlines()
        descs1 = [re.findall(r'(\d\d:\d\d) (.*)', d.strip('\n').strip())[0] for d in descs]
        if len(descs1[0]) == 0:
            descs1 = [re.findall(r'(\d\d:\d\d.\d\d) (.*)', d.strip('\n').strip())[0] for d in descs]
            timeformat = "%M:%S.%f"
            starttime = "00:00.00"
        descs1 = [(create_strp(d[0], timeformat), d[1])for d in descs1]
        firstline = (create_strp(starttime, timeformat), "start song")

        if descs1[0][0] - firstline[0]:
            descs1.insert(0, firstline)

        lastline = (descs1[-1][0]+1, "end song")
        descs1.append(lastline)   
    return descs1

def sort(t):
    path = f'outt/out{t}'
    num = [re.findall('\d+', im)[0] for im in os.listdir(path)]   
    num= list(map(int, num))
    num.sort()
    imgs = [f'outt/out{t}/frame{i}.png' for i in num]
    return imgs

descs = init_textfile('shokoo.txt')

interpol= 10
video_temp_list=[]  
for idx1, pt in enumerate(descs):
    z1_idx = idx1 + 1
    if z1_idx >= len(descs):
        break
    current_lyric = pt[1]

    d1 = pt[0]
    d2 = descs[z1_idx][0]
    ttime = d2 - d1   
    N = round(ttime * interpol)
    # images =[f'outt/out{idx1+1}/'+ os.listdir(f'outt/out{idx1+1}')[i] for i in range(N)]
    images= sort(idx1+1)
    # print(images)
    # print("______________________________________")
    video_temp = createvid(f'{current_lyric}', images, duration=ttime / N)
    video_temp_list.append(video_temp)

concatvids(descs, video_temp_list)
