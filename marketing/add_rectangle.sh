#! /usr/bin/sh
ffmpeg -y -i no_sound.mp4 -vf "drawbox=x=600:y=0:w=50:h=626:color=#4b5563@1.0:t=fill" out.mp4

