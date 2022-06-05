from keyword import iskeyword
from optparse import AmbiguousOptionError
from textwrap3 import fill
import moviepy.editor as me
import tempfile
import textwrap
import glob
import os
import re
import imageio
import numpy as np 

#def createvid(description, duration, fps):
    # blackbg = me.ColorClip((720,720), (0, 0, 0))
    # clips = [me.ImageClip(images[i], duration=duration) for i in range(len(images))]

#     concat_clip = me.concatenate_videoclips(clips, method="compose").set_position(('center', 'center'))
#     if description == "start song":
#         description = " "
#     if len(description) > 35:
#         description = fill(description, 35)

#     txtClip = me.TextClip(description, color='white', fontsize=30, font='Amiri-regular').set_position('center')
#     txt_col = txtClip.on_color(size=(blackbg.w, txtClip.h + 10),
#                                color=(0,0,0), pos=('center', 'center'), 
#                                col_opacity=0.8)
#     txt_mov = txt_col.set_position((0, blackbg.h-20-txtClip.h))

#     comp_list = [blackbg, concat_clip, txt_mov]
#     final = me.CompositeVideoClip(comp_list).set_duration(concat_clip.duration)
#     final.write_videofile("f.mkv", fps=fps)
    
   
# def concatvids(descriptions, video_temp_list, audiofilepath, fps=24, lyrics=True):
#     clips = []

#     for idx, (desc, vid) in enumerate(zip(descriptions, video_temp_list)):
#         if desc == descriptions[-1][1]:
#             break
#         vid = me.VideoFileClip(f'{vid.name}.mp4')#.set_position(('center', 'center'))
#         clips.append(vid)

#     concat_clip = me.concatenate_videoclips(clips, method="compose").set_position(('center', 'center'))
#     # concat_clip = me.CompositeVideoClip([blackbg, concat_clip])#.set_duration(vid.duration)
#     if audiofilepath:
#         concat_clip.audio = me.AudioFileClip(audiofilepath)
#         concat_clip.duration = concat_clip.audio.duration
#     concat_clip.write_videofile(os.path.join('output', f"finaloutput.mp4"), fps=fps)

def createvid(list_info, fps):
    clips=[]
    blackbg = me.ColorClip((720,720), (0, 0, 0))
    for i in range(len(list_info)):
        clip = me.ImageClip(list_info[i]['im'], duration=float(list_info[i]['duration']))
        clips.append(clip)
        if list_info[i]['lyrics'] == "start song":
            list_info[i]['lyrics'] = " "
        if len(list_info[i]['lyrics']) > 35:
            list_info[i]['lyrics'] = fill(list_info[i]['lyrics'], 35)
    
    concat_clip = me.concatenate_videoclips(clips, method="compose").set_position(('center', 'center'))
    
    txtClip = me.TextClip(list_info['lyrics'], color='white', fontsize=30, font='Amiri-regular').set_position('center')
    txt_col = txtClip.on_color(size=(blackbg.w, txtClip.h + 10),
                               color=(0,0,0), pos=('center', 'center'), 
                               col_opacity=0.8)
    txt_mov = txt_col.set_position((0, blackbg.h-20-txtClip.h))

    # comp_list = [blackbg, concat_clip, txt_mov]
    # final = me.CompositeVideoClip(comp_list).set_duration(concat_clip.duration)
    # final.write_videofile("f.mkv", fps=fps)
    
#note that duration = 1/interpol
#interpol = 
images= sorted(os.listdir('out4'))
#num_imgs= len(images)
num_imgs =20
# info_dict={}
list_info=[]
with open('info.txt') as f:
    info = f.readlines()
    for i in range(num_imgs):
        info_dict={}
        info_dict['im']= 'out4/' + images[i]
        info_dict['lyrics']= re.findall('(\D*)', info[i])[0]
        info_dict['duration']=re.findall("\d+\.\d+|\d", info[i])[0]
        #print(info_dict)
        list_info.append(info_dict)

#print(list_info)

#[print(i , '\n') for i in list_info]
#print(list_info[5])
createvid(list_info, 24)
#descs= list_info[]
# for d in descs:
#     for i in range(N):

    # blackbg = me.ColorClip((720,720), (0, 0, 0))
    # clips = me.ImageClip(list_info[i]['im'], list_info[i]['duration']) 
    # concat_clip = me.concatenate_videoclips(clips, method="compose").set_position(('center', 'center'))
